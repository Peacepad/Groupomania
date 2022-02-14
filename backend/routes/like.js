const express = require('express');
const router = express.Router();
const likeCtrl = require('../controllers/like');
const auth = require('../middleware/auth');



router.post('/:id', auth, likeCtrl.create); 
router.get('/:id', auth, likeCtrl.getLikes);



module.exports = router;