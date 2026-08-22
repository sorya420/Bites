const express = require("express");
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

/*POST /api/food/[protected] */
router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"),
  foodController.createFood,
);

/*GET /api/food[protected] */

router.get("/",
  authMiddleware.authUserMiddleware,
  foodController.getFoodItem,
)

router.patch("/:foodId/like",
  authMiddleware.authUserMiddleware,
  foodController.toggleLike,
)

router.post("/:foodId/order",
  authMiddleware.authUserMiddleware,
  foodController.placeOrder,
)

router.post("/:foodId/comments",
  authMiddleware.authUserMiddleware,
  foodController.addComment,
)

router.get("/partner/:partnerId",
  authMiddleware.authUserMiddleware,
  foodController.getFoodPartner, 
)



module.exports = router;
