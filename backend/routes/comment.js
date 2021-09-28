const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.post('/create', commentCtrl.create); //penser à mettre auth en middleware




module.exports = router;