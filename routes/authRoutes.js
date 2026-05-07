const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// we will access now via the prefix /auth/register 
// the logic will be in the authController.register function
// we will create the authController in the controllers folder
router.route("/register").post( authController.register);
router.route("/login").post( authController.login);
router.route("/refresh").get( authController.refresh);
router.route("/logout").post( authController.logout);



module.exports = router;