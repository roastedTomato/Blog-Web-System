const express = require('express');
const router = express.Router();
const userDAO = require('../modules/user-dao');

/**
 * Middleware that protects routes requiring a logged-in user.
 * Users who are not logged in are sent to the login page.
 */
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    next();
}

/**
 * Sends username-check API errors in a predictable JSON structure.
 * The register page reads available/message from this response.
 */
function sendJsonError(res, status, message) {
    return res.status(status).json({ success: false, available: false, message, error: message });
}

/**
 * Loads the current user's profile page with avatar selection data.
 * Optional success or error messages are displayed after profile actions.
 */
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


/**
 * Shows the registration form and loads preset avatars.
 */
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

/**
 * Validates registration input, creates the user, and logs them in.
 * Password hashing is handled inside userDAO.create().
 */
router.post('/register', async (req, res) => {
    const { username, password, confirmPassword, fullName, birthday, bio, avatarId } = req.body;

    // 1. Validation: Check required fields
    if (!username || !password || !confirmPassword || !fullName || !birthday || !bio) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/register', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Username, password, full name, birthday, and biography are required'
        });
    }

    // 2. Validation: Check password length
    if (password.length < 6) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/register', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Password must be at least 6 characters long'
        });
    }

    // 3. Validation: Check passwords match
    if (password !== confirmPassword) {
        const avatars = await userDAO.getActiveAvatars();
        return res.status(400).render('users/register', {
            title: 'User Registration',
            avatars: avatars,
            formData: { username, fullName, birthday, bio },
            error: 'Passwords do not match'
        });
    }

    try {
        // 4. Check if username already exists
        const isTaken = await userDAO.isUsernameTaken(username);

        if (isTaken) {
            const avatars = await userDAO.getActiveAvatars();
            return res.status(400).render('users/register', {
                title: 'User Registration',
                avatars: avatars,
                formData: { username, fullName, birthday, bio },
                error: 'Username already exists. Please choose a different one.'
            });
        }

        // 5. Create new user
        const userId = await userDAO.create({
            username,
            password,
            fullName,
            birthday,
            bio,
            avatarId
        });

        // 6. Create session (auto login)
        const user = await userDAO.findById(userId);
        req.session.user = userDAO.buildSessionObject(user);

        // 7. Redirect to home page
        res.redirect('/');

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Registration failed');
    }
});

/**
 * Shows the login form.
 * Already logged-in users are redirected to the home page.
 */
router.get('/login',async(req,res)=>{
    if(req.session.user){
        return res.redirect('/');
    }

    res.render('users/login',{
        title:'User Login',
        error:null
    });
});

/**
 * Verifies login credentials and stores a safe user object in the session.
 */
router.post('/login',async(req,res)=>{
    const {username,password} = req.body;

    //1.Validation null
    if(!username || !password){
        return res.status(400).render('users/login',{
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

/**
 * Logs the user out by destroying the session and clearing the session cookie.
 */
router.get('/logout',async (req,res)=>{
    req.session.destroy(()=>{
        //clear also the cookie in the web
        res.clearCookie('connect.sid')
        res.redirect('/');
    })
})

/**
 * Shows the logged-in user's profile form.
 */
router.get('/profile',requireLogin, async(req,res)=>{
    const{error= null, success = null} = req.query;
    await renderProfilePage(req, res,{error,success})
});

/**
 * Updates profile fields and refreshes the session user data.
 */
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

/**
 * Changes the logged-in user's password after validating the current password.
 */
router.post('/change-password', requireLogin, async (req, res) => {
    const {currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    try {
        await userDAO.changePassword(userId, currentPassword, newPassword, confirmPassword);
        return res.redirect('/user/profile?success=Password+changed+successfully');
    } catch (err) {
        return res.redirect(`/user/profile?error=${encodeURIComponent(err.message)}`);
    }
});

/**
 * Deletes the logged-in user's account and then logs them out.
 * Database cascade rules remove their related articles, comments, and likes.
 */
router.post('/delete', requireLogin, async (req, res) => {
    const userId = req.session.user.id;

    try {
        await userDAO.deleteUser(userId);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    } catch (err) {
        console.error('Delete account error:', err);
        return res.redirect('/user/profile?error=Failed+to+delete+account');
    }
});

/**
 * Checks username availability for the registration page AJAX validation.
 */
router.get('/check-username',async(req,res)=>{
    const {username} = req.query;

    if(!username || username.trim() === ''){
        return sendJsonError(res, 400, 'Username cannot be empty');
    }

    try {
        const isTaken = await userDAO.isUsernameTaken(username);
        if(isTaken){
            return res.json({success: true, available:false,message:"Username is already taken"})
        } else{
            return res.json({success: true, available:true,message:"Username is available"})
        }
    } catch (err) {
        console.error('Check username error:', err);
        return sendJsonError(res, 500, 'Failed to check username');
    }
})

/**
 * Fallback user route that renders the home page.
 */
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
