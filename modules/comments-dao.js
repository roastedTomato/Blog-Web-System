const db = require('./database');

/**
 * Gets all comments for one article in chronological order.
 * The frontend uses parent_id to render nested replies.
 */
async function getCommentsByArticleId(articleId) {
    const query = `
        SELECT 
            c.id,
            c.content,
            c.user_id,
            c.article_id,
            c.parent_id,
            c.created_at,
            u.username,
            u.avatar_url,
            u.full_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.article_id = ?
        ORDER BY c.created_at ASC
    `;

    return await db.query(query, [articleId]);
}

/**
 * Creates a top-level comment or a reply.
 * parentId is null for top-level comments and contains a comment id for replies.
 */
async function createComment(content, userId, articleId, parentId = null) {
    const result = await db.query(
        'INSERT INTO comments (content, user_id, article_id, parent_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [content, userId, articleId, parentId]
    );

    return Number(result.insertId);
}

/**
 * Deletes a comment after checking permission.
 * A comment can be deleted by its author or by the author of the article.
 */
async function deleteComment(commentId, userId) {
    // validation: if commenter or author
    const comment = await db.query(`
        SELECT c.id, c.user_id, c.article_id, a.author_id
        FROM comments c
        JOIN articles a ON c.article_id = a.id
        WHERE c.id = ?
    `, [commentId]);

    if (comment.length === 0) {
        throw new Error('Comment not found');
    }

    const c = comment[0];
    const isCommenter = c.user_id === userId;
    const isArticleAuthor = c.author_id === userId;

    if (!isCommenter && !isArticleAuthor) {
        throw new Error('Unauthorized to delete this comment');
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);
    return true;
}

/**
 * Calculates how deeply a comment is nested.
 * This is used to stop replies after the allowed two levels.
 */
async function getCommentDepth(commentId) {
    let depth = 0;
    let currentId = commentId;

    while (currentId !== null && depth < 3) {
        const comment = await db.query(
            'SELECT parent_id FROM comments WHERE id = ?',
            [currentId]
        );

        if (comment.length === 0) break;

        currentId = comment[0].parent_id;
        depth++;
    }

    return depth;
}

module.exports = {
    getCommentsByArticleId,
    createComment,
    deleteComment,
    getCommentDepth
};
