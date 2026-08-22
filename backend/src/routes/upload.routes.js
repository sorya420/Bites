const express = require("express");
const uploadController = require("../controllers/upload.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/imagekit-auth",
  authMiddleware.authFoodPartnerMiddleware,
  uploadController.getImageKitAuth
);

module.exports = router;