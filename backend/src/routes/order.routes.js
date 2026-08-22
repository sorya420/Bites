const express = require("express");
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware.authUserMiddleware, orderController.createOrder);
router.get("/mine", authMiddleware.authUserMiddleware, orderController.getMyOrders);
router.get(
  "/received",
  authMiddleware.authFoodPartnerMiddleware,
  orderController.getReceivedOrders,
);
router.patch(
  "/:orderId/status",
  authMiddleware.authFoodPartnerMiddleware,
  orderController.updateOrderStatus,
);

module.exports = router;