const express = require('express');
const router = express.Router();
const articleDAO = require('../modules/articles-dao');
const likesDAO = require('../modules/likes.dao')
const multer = require('multer')
const fs = require('fs');
const path = require('path');

const uploadDir = './public/uploads/';

/**
 * Sends API errors in one consistent JSON format.
 * Frontend fetch helpers can read data.error for every failed request.
 */
function sendJsonError(res, status, message) {
    return res.status(status).json({ success: false, error: message });
}

//1.for image: ensure upload directory exists, create it if not
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
}

//2.for image: configure file storage rules
const storage = multer.diskStorage({
    /**
     * Selects the folder where uploaded article images are saved.
     */
    destination: function(req,file,cb){
        // callback(error, path) - pass null as first parameter to indicate no error
        cb(null,uploadDir)
    },
    /**
     * Builds a safe unique filename for each uploaded image.
     */
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '-');
        const uniqueName = Date.now() + '-' + safeBaseName + ext;
        cb(null, uniqueName);
    }
});

//3.for image: upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    /**
     * Allows image files only and rejects other file types.
     */
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

/**
 * Shows all articles, or returns article JSON for AJAX sorting.
 */
router.get('/', async (req, res) => {
    const sortBy = req.query.sort || 'date';
    const order = req.query.order || 'DESC';

    try {
        const articles = await articleDAO.getAllArticles(sortBy, order);

        if (req.query.json) {
            return res.json({ articles });
        }

        res.render('articles/list', {
            title: 'All Articles',
            articles: articles,
            currentSort: sortBy,
            currentOrder: order
        });
    } catch (err) {
        console.error('Get articles error:', err);
        res.status(500).send('Failed to load articles');
    }
});

/**
 * Shows articles written by the logged-in user.
 * The same route also returns JSON for AJAX sorting on the My Articles page.
 */
router.get('/my', async (req, res) => {
    //check if login
    if (!req.session.user) {
        return res.redirect('/user/login');
    }

    const sortBy = req.query.sort || 'date';
    const order = req.query.order || 'DESC';

    try {
        const articles = await articleDAO.getArticlesByUserId(
            req.session.user.id,
            sortBy,
            order
        );

        if (req.query.json) {
            return res.json({ articles });
        }

        res.render('articles/my-articles', {
            title: 'My Articles',
            articles: articles,
            currentSort: sortBy,
            currentOrder: order
        });
    } catch (err) {
        console.error('Get my articles error:', err);
        res.status(500).send('Failed to load your articles');
    }
});

/**
 * Renders the create article form for logged-in users.
 */
router.get('/create', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }

    res.render('articles/create', {
        title: 'Create Article',
        isEdit: false,
        article: {}
    });
});

/**
 * Renders the edit form after checking that the logged-in user owns the article.
 */
router.get('/:id/edit', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }

    try {
        const article = await articleDAO.getArticleById(req.params.id);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        if (article.author_id !== req.session.user.id) {
            return res.status(403).send('You can only edit your own articles');
        }

        res.render('articles/create', {
            title: 'Edit Article',
            isEdit: true,
            article: article
        });
    } catch (err) {
        console.error('Load edit article error:', err);
        res.status(500).send('Failed to load article');
    }
});

/**
 * Creates a new article and optional image upload.
 * Returns JSON because the create form submits with fetch.
 */
router.post('/',upload.single('image'), async (req,res)=>{
    if(!req.session.user){
        return sendJsonError(res, 401, 'Login required');
    }
    const {title,content} = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}`: null;

    if (!title || !content) {
        return sendJsonError(res, 400, 'Title and content are required');
    }

    console.log('Creating article:',{title,imageUrl})

    try{
        const articleId = await articleDAO.createArticle(
            title,
            content,
            imageUrl,
            req.session.user.id
        )
        res.json({success:true, articleId:Number(articleId)});
    } catch (err){
        console.error('Create article error:', err);
        return sendJsonError(res, 500, 'Failed to create article');
    }
})

/**
 * Updates an existing article after validating ownership.
 * It can keep, replace, or remove the article image.
 */
router.put('/:id', upload.single('image'), async(req,res)=>{
    if(!req.session.user){
        return sendJsonError(res, 401, 'Login required');
    }

    try {
        const article = await articleDAO.getArticleById(req.params.id);

        if(!article){
            return sendJsonError(res, 404, 'Article not found');
        }

        if(article.author_id !== req.session.user.id){
            return sendJsonError(res, 403, 'You can only edit your own articles');
        }

        const {title,content,removeImage} = req.body;
        let imageUrl = article.image_url;

        if (!title || !content) {
            return sendJsonError(res, 400, 'Title and content are required');
        }

        if(removeImage==='true'){
            imageUrl = null;
        } else if(req.file){
            imageUrl = `/uploads/${req.file.filename}`
        }

        await articleDAO.updateArticle(req.params.id,title,content,imageUrl);
        res.json({success:true});
    }catch (err){
        console.error('Update article error:', err);
        return sendJsonError(res, 500, 'Failed to update article');
    }
})

/**
 * Deletes an article after checking that the logged-in user is the author.
 */
router.delete('/:id',async(req,res)=>{
    if(!req.session.user){
        return sendJsonError(res, 401, 'Login required');
    }

    try {
        const article = await articleDAO.getArticleById(req.params.id);

        if (!article) {
            return sendJsonError(res, 404, 'Article not found');
        }

        if (article.author_id !== req.session.user.id) {
            return sendJsonError(res, 403, 'You can only delete your own articles');
        }

        await articleDAO.deleteArticle(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete article error:', err);
        return sendJsonError(res, 500, 'Failed to delete article');
    }
})

/**
 * Shows one full article page and marks whether the current user has liked it.
 */
router.get('/:id', async (req, res) => {
    try {
        const article = await articleDAO.getArticleById(req.params.id);

        if (!article) {
            return res.status(404).send('Article not found');
        }

        let userLiked = false;
        if (req.session.user) {
            const existingLike = await likesDAO.existingLike(req.session.user.id, article.id);
            userLiked = existingLike.length > 0;
        }

        res.render('articles/article', {
            title: article.title,
            article: article,
            userLiked: userLiked
        });
    } catch (err) {
        console.error('Get article detail error:', err);
        res.status(500).send('Failed to load article');
    }
});

/**
 * Toggles the current user's like for an article.
 * Returns the new like count so the page can update without reloading.
 */
router.post('/:id/like', async(req,res)=>{
    if(!req.session.user){
        return sendJsonError(res, 401, 'Login required');
    }

    try{
        const articleId = req.params.id;
        const userId = req.session.user.id;

        const existingLike = await likesDAO.existingLike(userId,articleId);

        if(existingLike.length > 0){
            await likesDAO.unlike(userId, articleId)
        } else{
            await likesDAO.addLike(userId,articleId)
        }

        const likeCountResult = await likesDAO.likeCount(articleId);

        const likesCount = likeCountResult.length > 0 ? likeCountResult[0].count : 0;

        res.json({
            success:true,
            likeCount:likesCount,
            liked:existingLike.length===0
        })
    } catch (err) {
        console.error('Like error:', err);
        return sendJsonError(res, 500, 'Failed to process like');
    }
})

module.exports = router;
