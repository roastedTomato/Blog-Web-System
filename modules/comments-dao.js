const db = require('./database');

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


module.exports = {
    getCommentsByArticleId,
    deleteComment,
};
