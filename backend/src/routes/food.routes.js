const express = require("express");

const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


// ==========================================
// IMAGEKIT UPLOAD AUTH
// ==========================================

router.get(
  "/upload-auth",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.getImageKitUploadAuth
);


// ==========================================
// CREATE FOOD
// ==========================================

router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.createFood
);


// ==========================================
// GET FOOD
// ==========================================

router.get(
  "/",
  authMiddleware.authUserMiddleware,
  foodController.getFoodItem
);


// ==========================================
// LIKE
// ==========================================

router.patch(
  "/:foodId/like",
  authMiddleware.authUserMiddleware,
  foodController.toggleLike
);


// ==========================================
// ORDER
// ==========================================

router.post(
  "/:foodId/order",
  authMiddleware.authUserMiddleware,
  foodController.placeOrder
);


// ==========================================
// COMMENT
// ==========================================

router.post(
  "/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.addComment
);


// ==========================================
// FOOD PARTNER
// ==========================================

router.get(
  "/partner/:partnerId",
  authMiddleware.authUserMiddleware,
  foodController.getFoodPartner
);


module.exports = router;