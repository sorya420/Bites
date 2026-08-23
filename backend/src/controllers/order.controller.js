const foodModel = require("../models/food.model");
const orderModel = require("../models/order.model");

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      food: item.food,
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.food && Number.isInteger(item.quantity) && item.quantity > 0);
}

async function createOrder(req, res) {
  const items = normalizeItems(req.body.items);
  if (!items.length) {
    return res.status(400).json({ message: "Add at least one food item" });
  }

  const foodItems = await foodModel.find({
    _id: { $in: items.map((item) => item.food) },
  });
  if (foodItems.length !== items.length) {
    return res.status(400).json({ message: "One or more food items were not found" });
  }

  const partnerIds = new Set(foodItems.map((food) => food.foodPartner.toString()));
  if (partnerIds.size !== 1) {
    return res.status(400).json({ message: "Order items must come from one food partner" });
  }

  const foodById = new Map(foodItems.map((food) => [food._id.toString(), food]));
  const order = await orderModel.create({
    user: req.user._id,
    foodPartner: foodItems[0].foodPartner,
    items: items.map((item) => ({
      food: item.food,
      name: foodById.get(item.food.toString()).name,
      quantity: item.quantity,
    })),
  });

  await foodModel.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.food },
        update: { $inc: { orderCount: item.quantity } },
      },
    })),
  );

  return res.status(201).json({ message: "Order placed successfully", order });
}

async function getMyOrders(req, res) {
  const orders = await orderModel
    .find({ user: req.user._id })
    .populate("foodPartner", "name address")
    .sort({ createdAt: -1 });
  return res.status(200).json({ orders });
}

async function getReceivedOrders(req, res) {
  const orders = await orderModel
    .find({ foodPartner: req.foodPartner._id })
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });
  return res.status(200).json({ orders });
}

async function updateOrderStatus(req, res) {
  const allowedStatuses = ["placed", "preparing", "delivered", "cancelled"];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const order = await orderModel.findOneAndUpdate(
    { _id: req.params.orderId, foodPartner: req.foodPartner._id },
    { status: req.body.status },
    { new: true },
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.status(200).json({ order });
}

module.exports = {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
};