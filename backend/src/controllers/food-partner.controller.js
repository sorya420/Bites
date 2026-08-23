const foodPartnerModel = require("../models/foodpartner.model");
const foodModel = require("../models/food.model");

function formatFoodItem(food) {
  const item = food.toObject ? food.toObject() : food;

  return {
    ...item,
    comments: Array.isArray(item.comments) ? item.comments.length : 0,
  };
}

async function getCurrentFoodPartner(req, res) {
  const foodItems = await foodModel.find({
    foodPartner: req.foodPartner._id,
  });

  return res.status(200).json({
    message: "Food partner retrieved successfully",
    foodPartner: req.foodPartner,
    foodItems: foodItems.map(formatFoodItem),
  });
}

async function getfoodPartnerById(req, res) {
  const foodPartnerId = req.params.id;

  const foodPartner = await foodPartnerModel
    .findById(foodPartnerId)
    .select("name email contactName phone address status");
  if (!foodPartner) {
    return res.status(400).json({ message: "Food Partner not Found" });
  }

  const foodItems = await foodModel.find({ foodPartner: foodPartner._id });

  res.status(200).json({
    message: "food partner retrieved successfully",
    foodPartner,
    foodItems: foodItems.map(formatFoodItem),
    isFollowing: req.user.followingFoodPartners.some((id) =>
      id.equals(foodPartner._id),
    ),
  });
}

module.exports  = {
  getCurrentFoodPartner,
    getfoodPartnerById,
    
}