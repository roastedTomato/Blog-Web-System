const express = require('express');
const router = express.Router();
const articleDAO = require('../modules/articles-dao');

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

router.get('/:id', async (req, res) => {
    const article = await articleDAO.getArticleById(req.params.id);

    if (!article) {
        return res.status(404).send('Article not found');
    }

    res.render('articles/article', {
        title: article.title,
        article: article
    });
});

module.exports = router;
