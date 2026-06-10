const db = require('./database');

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

async function createArticle(title, content, imageUrl, authorId) {
    const result = await db.query(
        'INSERT INTO articles (title, content, image_url, author_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [title, content, imageUrl, authorId]
    );

    return result.insertId;
}

async function updateArticle(articleId, title, content, imageUrl) {
    await db.query(
        'UPDATE articles SET title = ?, content = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
        [title, content, imageUrl, articleId]
    );

    return true;
}

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
