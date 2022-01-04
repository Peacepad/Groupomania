const express = require('express');
const router = express.Router();
const likeCtrl = require('../controllers/like');
const auth = require('../middleware/auth');



router.post('/:id', auth, likeCtrl.create); //penser à mettre auth en middleware




module.exports = router;