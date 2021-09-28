const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const userCtrl = require('../controllers/user');


router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.put('/:id', multer, userCtrl.update);
router.get('/:id', userCtrl.getOneUser);

module.exports = router;