const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

console.log("authUserMiddleware:", typeof authMiddleware.authUserMiddleware);
console.log(
  "authFoodPartnerMiddleware:",
  typeof authMiddleware.authFoodPartnerMiddleware
);

console.log("createOrder:", typeof orderController.createOrder);
console.log("getMyOrders:", typeof orderController.getMyOrders);
console.log(
  "getReceivedOrders:",
  typeof orderController.getReceivedOrders
);
console.log(
  "updateOrderStatus:",
  typeof orderController.updateOrderStatus
);

const router = express.Router();

router.post(
  "/",
  authMiddleware.authUserMiddleware,
  orderController.createOrder
);

router.get(
  "/mine",
  authMiddleware.authUserMiddleware,
  orderController.getMyOrders
);

router.get(
  "/received",
  authMiddleware.authFoodPartnerMiddleware,
  orderController.getReceivedOrders
);

router.patch(
  "/:orderId/status",
  authMiddleware.authFoodPartnerMiddleware,
  orderController.updateOrderStatus
);

module.exports = router;