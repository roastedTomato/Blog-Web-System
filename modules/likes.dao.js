const db = require('./database')

/**
 * Checks whether one user has already liked one article.
 * The route uses this to prevent duplicate likes and to support unlike.
 */
async function existingLike(userId, articleId){
    const result = await db.query('SELECT * FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
    );
    return result;
}

/**
 * Removes an existing like for an article.
 * Called when a user clicks the like button again.
 */
async function unlike(userId,articleId){
    await db.query(
        'DELETE FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
    );
    return true;
}

/**
 * Adds a like record for one user and one article.
 * The database primary key prevents duplicate likes.
 */
async function addLike(userId,articleId){
    await db.query(
        'INSERT INTO likes (user_id, article_id) VALUES (?, ?)',
        [userId, articleId]
    );
    return true;
}

/**
 * Counts how many likes an article currently has.
 * The route returns this number to update the page without reloading.
 */
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
