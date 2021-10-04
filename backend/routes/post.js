const express = require('express');
const router = express.Router();
const postCtrl = require('../controllers/post');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.post('/create', postCtrl.create); //penser à mettre auth en middleware
router.put('/:id', multer, postCtrl.update);
router.delete('/:id', postCtrl.delete);
router.get('/', postCtrl.getPost);


module.exports = router;