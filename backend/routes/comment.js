const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



router.post('/:postId', auth, multer, commentCtrl.create); 
router.delete('/:commentId', auth, commentCtrl.delete);




module.exports = router;