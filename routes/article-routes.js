const express = require('express');
const router = express.Router();
const articleDAO = require('../modules/articles-dao');
const likesDAO = require('../modules/likes.dao')
const multer = require('multer')
const fs = require('fs');
const path = require('path');

const uploadDir = './public/uploads/';

//1.for image: ensure upload directory exists, create it if not
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
}

//2.for image: configure file storage rules
const storage = multer.diskStorage({
    // Set the directory where uploaded files will be stored
    destination: function(req,file,cb){
        // callback(error, path) - pass null as first parameter to indicate no error
        cb(null,uploadDir)
    },
    // Set the filename generation rule
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
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});


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

router.get('/:id/edit', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }

    const article = await articleDAO.getArticleById(req.params.id);

    if (!article) {
        return res.status(404).send('Article not found');
    }

    res.render('articles/create', {
        title: 'Edit Article',
        isEdit: true,
        article: article
    });
});

//create new article in database
router.post('/',upload.single('image'), async (req,res)=>{
    if(!req.session.user){
        return res.status(401).send('Unauthorized');
    }
    const {title,content} = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}`: null;

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
        res.status(500).send("Failed to create article")
    }
})

//update new article in database
router.put('/:id', upload.single('image'), async(req,res)=>{
    if(!req.session.user){
        return res.status(401).send('Unauthorized');
    }

    const article = await articleDAO.getArticleById(req.params.id);

    if(!article){
        return res.status(404).send('Article not found');
    }

    if(article.author_id !== req.session.user.id){
        return res.status(403).send('Unauthorized');
    }

    const {title,content,removeImage} = req.body;
    let imageUrl = article.image_url;

    if(removeImage==='true'){
        imageUrl = null;
    } else if(req.file){
        imageUrl = `/uploads/${req.file.filename}`
    }

    try{
        await articleDAO.updateArticle(req.params.id,title,content,imageUrl);
        res.json({success:true});
    }catch (err){
        res.status(500).send("Failed to update article ")
    }
})

//delete article in database
router.delete('/:id',async(req,res)=>{
    if(!req.session.user){
        return res.status(401).send('Unauthorized');
    }

    const article = await articleDAO.getArticleById(req.params.id);

    if (!article) {
        return res.status(404).send('Article not found');
    }

    if (article.author_id !== req.session.user.id) {
        return res.status(403).send('Unauthorized');
    }

    try {
        await articleDAO.deleteArticle(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send('Failed to delete article');
    }
})


router.get('/:id', async (req, res) => {
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
});

router.post('/:id/like', async(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({ error: 'Login required' });
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
        res.status(500).json({ error: 'Failed to process like' });
    }
})

module.exports = router;
