const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require("multer");

const router = express.Router();
const uploadProfileImage = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (file.mimetype.startsWith("image/")) {
			return callback(null, true);
		}
		return callback(new Error("Only image files are allowed"));
	},
});

//user auth api
router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);
router.get("/user/logout", authController.logoutUser);
router.get("/user/me", authMiddleware.authUserMiddleware, authController.getCurrentUser);
router.patch(
	"/user/profile-image",
	authMiddleware.authUserMiddleware,
	uploadProfileImage.single("profileImage"),
	authController.updateUserProfileImage,
);
router.patch(
	"/user/follow/:partnerId",
	authMiddleware.authUserMiddleware,
	authController.toggleFollowFoodPartner,
);

//food partner auth api
router.post("/food-partner/register", authController.registerFoodPartner);
router.post("/food-partner/login", authController.loginfoodPartner);
router.get("/food-partner/logout", authController.logoutFoodPartner);
router.get("/food-partner/me", authMiddleware.authFoodPartnerMiddleware, authController.getCurrentFoodPartner);
router.patch("/food-partner/status", authMiddleware.authFoodPartnerMiddleware, authController.updateFoodPartnerStatus);

module.exports = router;
