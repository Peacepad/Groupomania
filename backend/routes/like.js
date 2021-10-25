const express = require('express');
const router = express.Router();
const likeCtrl = require('../controllers/like');
const auth = require('../middleware/auth');



router.post('/', auth, likeCtrl.create); //penser à mettre auth en middleware
router.get('/:id', auth, likeCtrl.getOne);



module.exports = router;