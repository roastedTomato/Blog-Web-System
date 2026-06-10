const db = require('./database')

// Check if user already liked this article
async function existingLike(userId, articleId){
    const result = await db.query('SELECT * FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
    );
    return result;
}

// Unlike - remove the like
async function unlike(userId,articleId){
    await db.query(
        'DELETE FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
    );
    return true;
}

// Like - add new like
async function addLike(userId,articleId){
    await db.query(
        'INSERT INTO likes (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
    );
    return true;
}

// Get updated like count
async function likeCount (articleId){
    const result = await db.query(
        'SELECT COUNT(*) as count FROM likes WHERE article_id = ?',
        [articleId]);
    return result;
}

module.exports = {
    existingLike,
    unlike,
    addLike,
    likeCount
};
