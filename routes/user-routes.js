const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../modules/database');

// GET /user/register - Show registration form
router.get('/register', async (req, res) => {
    try {
        const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');

        if (avatars.length > 0) {
            avatars[0].selected = true;
        }

        res.render('users/register', {
            title: 'User Registration',
            avatars: avatars,
            formData: {},
            error: null
        });
    } catch (err) {
        console.error('Error fetching avatars:', err);
        res.status(500).render('users/register', {
            title: 'User Registration',
            avatars: [],
            formData: {},
            error: 'Failed to load registration form'
        });
    }
});

// POST /user/register - Process registration
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword, fullName, birthday, bio, avatarId } = req.body;

    // 1. Validation: Check required fields
    if (!username || !password || !confirmPassword) {
        const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Username, password, and confirm password are required'
        });
    }

    // 2. Validation: Check passwords match
    if (password !== confirmPassword) {
        const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Passwords do not match'
        });
    }

    // 3. Validation: Check password length
    if (password.length < 6) {
        const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Password must be at least 6 characters long'
        });
    }

    // 4. Validation: Check username length
    if (username.length < 3 || username.length > 50) {
        const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Username must be between 3 and 50 characters'
        });
    }

    try {
        // 5. Check if username already exists
        const existingUser = await db.query('SELECT id FROM users WHERE username = ?', [username]);

        if (existingUser.length > 0) {
            const avatars = await db.query('SELECT * FROM avatars WHERE is_active = 1 ORDER BY display_order');
            return res.status(400).render('users/create', {
                title: 'User Registration',
                avatars: avatars,
                formData: { username, fullName, birthday, bio },
                error: 'Username already exists. Please choose a different one.'
            });
        }

        // 6. Hash password with bcrypt (hash + salt)
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 7. Get avatar URL
        let avatarUrl = '/public/avatarImages/default.png';
        if (avatarId) {
            const avatar = await db.query('SELECT icon_path FROM avatars WHERE id = ? AND is_active = 1', [avatarId]);
            if (avatar.length > 0) {
                avatarUrl = avatar[0].icon_path;
            }
        }

        // 8. Insert new user into database
        const result = await db.query(
            'INSERT INTO users (username, password_hash, full_name, birthday, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
            [username, passwordHash, fullName || null, birthday || null, bio || null, avatarUrl]
        );

        // 9. Create session (auto login)
        req.session.user = {
            id: result.insertId,
            username: username,
            fullName: fullName,
            avatarUrl: avatarUrl
        };

        // 10. Redirect to home page
        res.redirect('/');

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Registration failed');
    }
});

router.get('/', (req, res) => {
    res.send('User routes');
});

module.exports = router;
