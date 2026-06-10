const express = require('express');
const router = express.Router();
const commentDAO = require('../modules/comments-dao');

// get comments
router.get('/article/:articleId', async (req, res) => {
    try {
        const comments = await commentDAO.getCommentsByArticleId(req.params.articleId);
        res.json({ comments });
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ error: 'Failed to load comments' });
    }
});

//create/reply comment
router.post('/',async (req,res)=>{
    if (!req.session.user) {
        return res.status(401).json({ error: 'Login required' });
    }
    const { content, articleId, parentId } = req.body;

    if (!content || !articleId) {
        return res.status(400).json({ error: 'Content and articleId are required' });
    }

    const commentId = await commentDAO.createComment(
        content,
        req.session.user.id,
        articleId,
        parentId || null
    );

    res.json({ success: true, commentId: Number(commentId) });
})

// delete comments
router.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Login required' });
    }

    try {
        await commentDAO.deleteComment(req.params.id, req.session.user.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }
});

module.exports = router;
