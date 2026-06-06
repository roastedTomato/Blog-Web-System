const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../modules/database');
const {query} = require("express");

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

// GET /user/login - Show login form
router.get('/login',async(req,res)=>{
    if(req.session.user){
        return res.redirect('/');
    }

    res.render('users/login',{
        title:'User Login',
        error:null
    });
});

// POST /user/login - Verify login
router.post('/login',async(req,res)=>{
    const {username,password} = req.body;

    //1.Validation null
    if(!username || !password){
        return res.status(400).render('/users/login',{
            title:'User Login',
            error:'Username and Password are required'
        })
    }

    try{
        //2.Find user by username
        const users = await db.query('SELECT * FROM users WHERE username = ?',[username]);
        if(users.length === 0){
            return res.status(401).render('users/login',{
                title:'User Login',
                error:'Invalid username or password'
            });
        }
        const user = users[0];

        //3.Verify password using bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).render('users/login',{
                title:'User Login',
                error:'Invalid username or password'
            })
        }

        //4.Create session
        req.session.user = {
            id:user.id,
            username:user.username,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl
        }

        //5.Redirect to home page
        res.redirect('/');
    }catch (err){
        console.error('Login error:', err);
        res.status(500).render('users/login', {
            title: 'User Login',
            error: 'Login failed. Please try again.'
        });
    }
})

// GET /user/logout - Destroy Session
router.get('./logout',async (req,res)=>{
    req.session.destroy(()=>{
        //clear also the cookie in the web
        res.clearCookie('connect.sid')
        res.redirect('/');
    })
})

router.get('/', (req, res) => {
    res.send('User routes');
});

module.exports = router;
