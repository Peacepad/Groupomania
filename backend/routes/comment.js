const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');



router.post('/create', commentCtrl.create); //penser à mettre auth en middleware





module.exports = router;