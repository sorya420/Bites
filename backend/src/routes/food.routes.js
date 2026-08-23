const express = require("express");

const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.createFood
);

router.get(
  "/",
  authMiddleware.authUserMiddleware,
  foodController.getFoodItem
);

router.patch(
  "/:foodId/like",
  authMiddleware.authUserMiddleware,
  foodController.toggleLike
);

router.post(
  "/:foodId/order",
  authMiddleware.authUserMiddleware,
  foodController.placeOrder
);

router.post(
  "/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.addComment
);

router.get(
  "/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.getComments
);

router.get(
  "/partner/:partnerId",
  authMiddleware.authUserMiddleware,
  foodController.getFoodPartner
);

module.exports = router;