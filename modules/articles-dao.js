const db = require('./database');
async function getAllArticles() {
    const articles = await db.query(`
        SELECT 
            a.id,
            a.title,
            a.content,
            a.image_url,
            a.author_id,
            a.created_at,
            u.username as author_username,
            u.full_name as author_full_name,
            u.avatar_url as author_avatar
        FROM articles a
        JOIN users u ON a.author_id = u.id
        ORDER BY a.created_at DESC
    `);

    return articles;
}
async function getArticleById(articleId) {
    const articles = await db.query(`
        SELECT 
            a.id,
            a.title,
            a.content,
            a.image_url,
            a.author_id,
            a.created_at,
            a.updated_at,
            u.username as author_username,
            u.full_name as author_full_name,
            u.avatar_url as author_avatar
        FROM articles a
        JOIN users u ON a.author_id = u.id
        WHERE a.id = ?
    `, [articleId]);

    return articles.length > 0 ? articles[0] : null;
}

module.exports = {
    getAllArticles,
    getArticleById
};
