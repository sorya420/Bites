const express = require("express");

const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

//create food

router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.createFood
);

//get all food

router.get(
  "/",
  authMiddleware.authUserMiddleware,
  foodController.getFoodItem
);
//likes

router.patch(
  "/:foodId/like",
  authMiddleware.authUserMiddleware,
  foodController.toggleLike
);

//orders

router.post(
  "/:foodId/order",
  authMiddleware.authUserMiddleware,
  foodController.placeOrder
);

//comments write
router.post(
  "/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.addComment
);

//comment read


router.get(
  "/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.getComments
);

//food partner

router.get(
  "/partner/:partnerId",
  authMiddleware.authUserMiddleware,
  foodController.getFoodPartner
);

module.exports = router;