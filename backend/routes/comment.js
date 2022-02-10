const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



router.post('/:commentId', auth, multer, commentCtrl.create); 
router.delete('/:commentId', auth, multer, commentCtrl.delete);
router.put('/:commentId', auth, multer, commentCtrl.update)




module.exports = router;