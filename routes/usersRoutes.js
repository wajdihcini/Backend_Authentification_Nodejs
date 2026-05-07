const express = require('express');
const router = express.Router();
const userController = require('../controller/usersController');
const verifyJwt = require('../middleware/verifyJwt');

// we will access now via the prefix /users/
router.use(verifyJwt); // Apply the JWT verification middleware to all routes in this router

router.route("/").get(userController.getALLUsers);

module.exports = router;