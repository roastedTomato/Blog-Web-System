const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Comment routes');
});

module.exports = router