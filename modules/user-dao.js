const db = require('./database');
const bcrypt = require('bcryptjs');

//User Data Access Object (DAO)

/**
 * Finds one user by username.
 * Used during login and registration duplicate-name checks.
 */
async function findByUsername(username) {
    const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return users.length > 0 ? users[0] : null;
}

/**
 * Finds one user by id and formats the birthday for HTML date inputs.
 * Returns null when the user no longer exists.
 */
async function findById(userId) {
    const users = await db.query(
        'SELECT id, username, full_name, birthday, bio, avatar_url, password_hash, created_at FROM users WHERE id = ?',
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

/**
 * Gets all preset avatars that can be selected by users.
 */
async function getActiveAvatars() {
    return await db.query('SELECT * FROM avatars ORDER BY display_order');
}

/**
 * Converts an avatar id from the form into the stored avatar image path.
 * Falls back to the default avatar when no valid id is supplied.
 */
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

/**
 * Checks whether a username already exists.
 * excludeUserId allows the current user to keep their own username while editing.
 */
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

/**
 * Creates a new user with a bcrypt hashed password.
 * Returns the new user's database id.
 */
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

/**
 * Updates editable profile fields for a user.
 * Password changes are handled separately by changePassword.
 */
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

/**
 * Compares a plain text password with a stored bcrypt hash.
 */
async function verifyPassword(inputPassword, oldHashedPassword) {
    return await bcrypt.compare(inputPassword, oldHashedPassword);
}

/**
 * Validates and changes a user's password.
 * It checks the current password before saving the new bcrypt hash.
 */
async function changePassword(userId, currentPassword,newPassword, confirmPassword) {
    if ( !currentPassword||!newPassword || !confirmPassword) {
        throw new Error('All password fields are required');
    }

    if (newPassword.length < 6 ) {
        throw new Error('New password must be at least 6 characters long');
    }

    if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
    }

    const user = await findById(userId);
    const isPasswordValid = await verifyPassword(currentPassword,user.password_hash);
    if(!isPasswordValid){
        throw new Error('Current password is incorrect');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, userId]
    );

    return true;
}

/**
 * Deletes a user account.
 * Related articles, comments, and likes are removed by database cascade rules.
 */
async function deleteUser(userId) {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return true;
}

/**
 * Adds a selected flag to the avatar list for the profile form.
 */
function markSelectedAvatar(avatars, userAvatarUrl) {
    return avatars.map(avatar => ({
        ...avatar,
        selected: avatar.icon_path === userAvatarUrl
    }));
}

/**
 * Builds the small user object stored in the session.
 * This avoids storing the password hash in the session.
 */
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
    deleteUser,
    changePassword,
    markSelectedAvatar,
    verifyPassword,
    buildSessionObject
};
