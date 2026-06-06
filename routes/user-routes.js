const express = require('express');
const router = express.Router();
const userDAO = require('../modules/users-dao');

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    next();
}

async function renderProfilePage(req, res, options = {}) {
    const { error = null, success = null } = options;
    const userId = req.session.user.id;

    try {
        const user = await userDAO.findById(userId);

        if (!user) {
            req.session.destroy();
            return res.redirect('/user/login');
        }

        const avatars = await userDAO.getActiveAvatars();
        const avatarsWithSelection = userDAO.markSelectedAvatar(avatars, user.avatar_url);

        res.render('users/profile', {
            title: 'Edit Profile',
            user: user,
            avatars: avatarsWithSelection,
            error: error,
            success: success
        });
    } catch (err) {
        console.error('Render profile page error:', err);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load profile page'
        });
    }
}

//Change password
async function handleChangePassword(userId, currentPassword,newPassword, confirmPassword) {
    // 1. Validation: Check if all password fields are provided
    if ( !newPassword || !confirmPassword) {
        throw new Error('All password fields are required');
    }

    // 2. Validation: Check new password length
    if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
    }

    // 3. Validation: Check if new passwords match
    if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
    }

    //4. Validation: Check current password
    const isPasswordValid = await userDAO.verifyPassword(confirmPassword,newPassword);
    if(!isPasswordValid){
        throw new Error('Current password is incorrect');
    }

    // 5. Update password
    await userDAO.updatePassword(userId, newPassword);

    return true;
}

// GET /user/register - Show registration form
router.get('/register', async (req, res) => {
    try {
        const avatars = await userDAO.getActiveAvatars();

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
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Username, password, and confirm password are required'
        });
    }

    // 2. Validation: Check passwords match
    if (password !== confirmPassword) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Passwords do not match'
        });
    }

    // 3. Validation: Check password length
    if (password.length < 6) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Password must be at least 6 characters long'
        });
    }

    // 4. Validation: Check username length
    if (username.length < 3 || username.length > 50) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/create', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Username must be between 3 and 50 characters'
        });
    }

    try {
        // 5. Check if username already exists
        const existingUser = await userDAO.isUsernameTaken(username);

        if (existingUser.length > 0) {
            const avatars = await userDAO.getActiveAvatars();
            return res.status(400).render('users/create', {
                title: 'User Registration',
                avatars: avatars,
                formData: { username, fullName, birthday, bio },
                error: 'Username already exists. Please choose a different one.'
            });
        }

        // 6. Create new user
        const userId = await userDAO.create({
            username,
            password,
            fullName,
            birthday,
            bio,
            avatarId
        });

        //7. Create session (auto login)
        const user = await userDAO.findById(userId);
        req.session.user = userDAO.buildSessionObject(user);

        //8. Redirect to home page
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
        const user = await userDAO.findByUsername(username);
        if(!user){
            return res.status(401).render('users/login',{
                title:'User Login',
                error:'Invalid username or password'
            });
        }

        //3.Verify password using bcrypt.compare
        const isPasswordValid = await userDAO.verifyPassword(password,user.password_hash);
        if(!isPasswordValid){
            return res.status(401).render('users/login',{
                title:'User Login',
                error:'Invalid username or password'
            })
        }

        //4.Create session
        req.session.user = userDAO.buildSessionObject(user);

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
router.get('/logout',async (req,res)=>{
    req.session.destroy(()=>{
        //clear also the cookie in the web
        res.clearCookie('connect.sid')
        res.redirect('/');
    })
})

// GET /user/profile - Show user profile
router.get('/profile',requireLogin, async(req,res)=>{
    await renderProfilePage(req, res)
});

router.post('/profile',requireLogin, async(req,res)=>{
    const {username, fullName, birthday, bio, avatarId} = req.body;
    const userId = req.session.user.id;

    try{
        //1.check if username is being changed and if it's already taken
        if(username !== req.session.user.username){
            const usernameExists = await userDAO.isUsernameTaken(username,userId);

            if(usernameExists){
                return await renderProfilePage(req,res,{
                    error:'Username already exists. Please choose a different one.'
                });
            }
        }

        //2.update user profile
        await userDAO.updateProfile(userId,{
            username,
            fullName,
            birthday,
            bio,
            avatarId
        })

        //3.update session
        const updatedUser = await userDAO.findById(userId);
        req.session.user = userDAO.buildSessionObject(updatedUser);

        //4. Render profile with success message
        await renderProfilePage(req,res,{
            success:'Profile updated successfully'
        });
    }catch (err) {
        console.error('Update profile error:', err);
        res.status(500).render('users/profile',{
            error: 'Edit profile failed. Please try again.'
        });
    }
})

// POST /user/change-password - Change password (separate route)
router.post('/change-password', requireLogin, async (req, res) => {
    const {currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    try {
        await handleChangePassword(userId, currentPassword, newPassword, confirmPassword);
        return res.redirect('/user/profile?success=Password+changed+successfully');
    } catch (err) {
        return res.redirect(`/user/profile?error=${encodeURIComponent(err.message)}`);
    }
});

router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
