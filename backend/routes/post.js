const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');



router.post('/create', auth, multer, postCtrl.create); //penser à mettre auth en middleware
router.put('/:id', auth, multer,postCtrl.update);
router.delete('/:id', auth, postCtrl.delete);
router.get('/', postCtrl.getPost);
router.get('/:id/likes', postCtrl.getLikes);
//




module.exports = router;