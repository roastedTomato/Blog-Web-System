const express = require('express');
const router = express.Router()
const articleDAO = require('../modules/articles-dao');

router.get('/', async (req, res) => {
    const sortBy = req.query.sort || 'date';
    const order = req.query.order || 'DESC';

    const articles = await articleDAO.getAllArticles(sortBy, order);

    res.render('index', {
        title: 'Home',
        articles: articles,
        currentSort: sortBy,
        currentOrder: order
    });
});

module.exports = router;