const express = require('express');
const router = express.Router();
const commentDAO = require('../modules/comments-dao');

/**
 * Sends comment API errors in one format for the article page fetch helper.
 */
function sendJsonError(res, status, message) {
    return res.status(status).json({ success: false, error: message });
}

/**
 * Returns all comments for one article as JSON.
 * The article page uses this endpoint to render and refresh comments with fetch.
 */
router.get('/article/:articleId', async (req, res) => {
    try {
        const comments = await commentDAO.getCommentsByArticleId(req.params.articleId);
        res.json({ comments });
    } catch (err) {
        console.error('Get comments error:', err);
        return sendJsonError(res, 500, 'Failed to load comments');
    }
});

/**
 * Creates a new top-level comment or a reply.
 * It also checks the two-level nesting rule before saving replies.
 */
router.post('/',async (req,res)=>{
    if (!req.session.user) {
        return sendJsonError(res, 401, 'Login required');
    }
    const { content, articleId, parentId } = req.body;

    if (!content || !articleId) {
        return sendJsonError(res, 400, 'Content and articleId are required');
    }

    try {
        const normalizedParentId = parentId || null;

        // Server-side depth validation keeps the two-level rule even if the UI is bypassed.
        if (normalizedParentId) {
            const depth = await commentDAO.getCommentDepth(normalizedParentId);
            if (depth >= 2) {
                return sendJsonError(res, 400, 'Replies can only be nested two levels deep');
            }
        }

        const commentId = await commentDAO.createComment(
            content,
            req.session.user.id,
            articleId,
            normalizedParentId
        );

        res.json({ success: true, commentId: Number(commentId) });
    } catch (err) {
        console.error('Create comment error:', err);
        return sendJsonError(res, 500, 'Failed to post comment');
    }
})

/**
 * Deletes a comment when the current user has permission.
 * Permission is checked in the DAO by comparing commenter and article author ids.
 */
router.delete('/:id', async (req, res) => {
    if (!req.session.user) {
        return sendJsonError(res, 401, 'Login required');
    }

    try {
        await commentDAO.deleteComment(req.params.id, req.session.user.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete comment error:', err);
        return sendJsonError(res, 403, 'Unauthorized to delete this comment');
    }
});

module.exports = router;
