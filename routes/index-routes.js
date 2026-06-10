const express = require('express');
const router = express.Router()
const articleDAO = require('../modules/articles-dao');

/**
 * Shows the home page with recent article data.
 * Also supports JSON output when called by AJAX sorting code.
 */
router.get('/', async (req, res) => {
    const sortBy = req.query.sort || 'date';
    const order = req.query.order || 'DESC';

    try {
        const articles = await articleDAO.getAllArticles(sortBy, order);

        if (req.query.json) {
            return res.json({ articles });
        }

        res.render('index', {
            title: 'Home',
            articles: articles,
            currentSort: sortBy,
            currentOrder: order
        });
    } catch (err) {
        console.error('Home page error:', err);
        res.status(500).send('Failed to load home page');
    }
});

module.exports = router;
