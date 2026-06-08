const express = require('express');
const router = express.Router()
const articleDAO = require('../modules/articles-dao');

router.get('/',async (req, res) => {
    const allArticles = await articleDAO.getAllArticles();

    res.render('index', {
        title: 'Home',
        articles: allArticles
    });
})

module.exports = router;