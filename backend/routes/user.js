const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.put("/:id", auth, multer, userCtrl.update);
router.delete("/:id", auth, multer, userCtrl.delete);
router.get("/:id", auth, userCtrl.getOneUser);

module.exports = router;
