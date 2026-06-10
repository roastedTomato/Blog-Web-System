const db = require('./database');

/**
 * Gets all articles with author details and like counts.
 * sortBy and order are checked against a whitelist before being added to SQL.
 */
async function getAllArticles(sortBy = 'date', order='DESC') {
    const validSortFields ={
        'title':'a.title',
        'username': 'u.username',
        'date': 'a.created_at'
    };

    const sortField = validSortFields[sortBy] || 'a.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `SELECT 
            a.id,
            a.title,
            a.content,
            a.image_url,
            a.author_id,
            a.created_at,
            u.username as author_username,
            u.full_name as author_full_name,
            u.avatar_url as author_avatar,
            COUNT(l.user_id) as likes_count
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN likes l ON a.id = l.article_id
        GROUP BY a.id
        ORDER BY ${sortField} ${sortOrder}`;

    const articles = await db.query(query);
    return articles;
}

/**
 * Gets articles written by one user with author details and like counts.
 * Used by the "My Articles" page.
 */
async function getArticlesByUserId(userId, sortBy = 'date', order='DESC') {
    const validSortFields ={
        'title':'a.title',
        'username': 'u.username',
        'date': 'a.created_at'
    };

    const sortField = validSortFields[sortBy] || 'a.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `SELECT 
            a.id,
            a.title,
            a.content,
            a.image_url,
            a.author_id,
            a.created_at,
            u.username as author_username,
            u.full_name as author_full_name,
            u.avatar_url as author_avatar,
            COUNT(l.user_id) as likes_count
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN likes l ON a.id = l.article_id
        WHERE a.author_id = ?
        GROUP BY a.id
        ORDER BY ${sortField} ${sortOrder}`;

    const articles = await db.query(query, [userId]);
    return articles;
}

/**
 * Gets one article by id, including author information and total likes.
 * Returns null when the article does not exist.
 */
async function getArticleById(articleId) {
    const articles = await db.query(`        SELECT 
            a.id,
            a.title,
            a.content,
            a.image_url,
            a.author_id,
            a.created_at,
            a.updated_at,
            u.username as author_username,
            u.full_name as author_full_name,
            u.avatar_url as author_avatar,
            COUNT(l.user_id) as likes_count
        FROM articles a
        JOIN users u ON a.author_id = u.id
        LEFT JOIN likes l ON a.id = l.article_id
        WHERE a.id = ?
        GROUP BY a.id
    `, [articleId]);

    return articles.length > 0 ? articles[0] : null;
}

/**
 * Creates a new article record and returns the new article id.
 * imageUrl can be null when the author does not upload an image.
 */
async function createArticle(title, content, imageUrl, authorId) {
    const result = await db.query(
        'INSERT INTO articles (title, content, image_url, author_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [title, content, imageUrl, authorId]
    );

    return result.insertId;
}

/**
 * Updates the editable fields for an existing article.
 * The route checks ownership before calling this method.
 */
async function updateArticle(articleId, title, content, imageUrl) {
    await db.query(
        'UPDATE articles SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
        [title, content, imageUrl, articleId]
    );

    return true;
}

/**
 * Deletes an article by id.
 * Related comments and likes are removed by database cascade rules.
 */
async function deleteArticle(articleId) {
    await db.query('DELETE FROM articles WHERE id = ?', [articleId]);
    return true;
}

module.exports = {
    getAllArticles,
    getArticlesByUserId,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
};
