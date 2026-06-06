const db = require('./database');
const bcrypt = require('bcryptjs');

//User Data Access Object (DAO)

//1.query
async function findByUsername(username) {
    const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return users.length > 0 ? users[0] : null;
}

async function findById(userId) {
    const users = await db.query(
        'SELECT id, username, full_name, birthday, bio, avatar_url, created_at FROM users WHERE id = ?',
        [userId]
    );
     if(users.length === 0){
         return null;
     }
     const user = users[0];

     if(user.birthday){
         const date = new Date(user.birthday);
         if (!isNaN(date.getTime())) {
             user.birthday = date.toISOString().split('T')[0];
         }
     }

    return user;
}

async function getActiveAvatars() {
    return await db.query('SELECT * FROM avatars ORDER BY display_order');
}

async function getAvatarUrlById(avatarId) {
    if (!avatarId) {
        return '/public/avatarImages/default.png';
    }

    const avatar = await db.query(
        'SELECT icon_path FROM avatars WHERE id = ?',
        [avatarId]
    );

    return avatar.length > 0 ? avatar[0].icon_path : '/public/avatarImages/default.png';
}

async function isUsernameTaken(username, excludeUserId = null) {
    let query = 'SELECT id FROM users WHERE username = ?';
    const params = [username];

    if (excludeUserId) {
        query += ' AND id != ?';
        params.push(excludeUserId);
    }

    const existingUser = await db.query(query, params);
    return existingUser.length > 0;
}

//2.create
async function create(userData) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    const avatarUrl = await getAvatarUrlById(userData.avatarId);

    const result = await db.query(
        'INSERT INTO users (username, password_hash, full_name, birthday, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
            userData.username,
            passwordHash,
            userData.fullName || null,
            userData.birthday || null,
            userData.bio || null,
            avatarUrl
        ]
    );

    return result.insertId;
}

//3.update
async function updateProfile(userId, updateData) {
    const avatarUrl = await getAvatarUrlById(updateData.avatarId);

    await db.query(
        'UPDATE users SET username = ?, full_name = ?, birthday = ?, bio = ?, avatar_url = ? WHERE id = ?',
        [
            updateData.username,
            updateData.fullName || null,
            updateData.birthday || null,
            updateData.bio || null,
            avatarUrl,
            userId
        ]
    );

    return true;
}

async function updatePassword(userId, newPassword) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, userId]
    );

    return true;
}

async function verifyPassword(newPassword, oldHashedPassword) {
    return await bcrypt.compare(newPassword, oldHashedPassword);
}

//4.others
function markSelectedAvatar(avatars, userAvatarUrl) {
    return avatars.map(avatar => ({
        ...avatar,
        selected: avatar.icon_path === userAvatarUrl
    }));
}

function buildSessionObject(user) {
    return {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url
    };
}

module.exports = {
    findByUsername,
    findById,
    getActiveAvatars,
    isUsernameTaken,
    create,
    updateProfile,
    updatePassword,
    markSelectedAvatar,
    verifyPassword,
    buildSessionObject
};