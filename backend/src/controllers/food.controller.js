const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const foodPartnerModel = require("../models/foodpartner.model");
const orderController = require("./order.controller");


// ==========================================
// GET IMAGEKIT UPLOAD AUTH
// ==========================================

async function getImageKitUploadAuth(req, res) {
  try {
    const authParams = await storageService.getUploadAuthParams();

    return res.status(200).json(authParams);
  } catch (error) {
    console.error("ImageKit auth error:", error);

    return res.status(500).json({
      message: "Unable to generate upload authentication",
    });
  }
}


// ==========================================
// CREATE FOOD
// ==========================================

async function createFood(req, res) {
  try {
    const {
      name,
      description,
      video,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Food name is required",
      });
    }

    if (!video) {
      return res.status(400).json({
        message: "Food video is required",
      });
    }

    const foodItem = await foodModel.create({
      name: name.trim(),
      description: description?.trim(),
      video,
      foodPartner: req.foodPartner._id,
    });

    return res.status(201).json({
      message: "Food created successfully",
      food: foodItem,
    });

  } catch (error) {
    console.error("createFood error:", error);

    return res.status(500).json({
      message: "Unable to create food",
    });
  }
}


// ==========================================
// GET FOOD
// ==========================================

async function getFoodItem(req, res) {
  const foodItems = await foodModel
    .find({})
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .populate(
      "foodPartner",
      "name email contactName phone address"
    );

  const userId = req.user?._id?.toString();

  return res.status(200).json({
    message: "Food items fetched Successfully",

    foodItems: foodItems.map((food) => ({
      ...food.toObject(),

      comments: food.comments.length,

      isLiked: Boolean(
        userId &&
        food.likedBy.some(
          (id) => id.toString() === userId
        )
      ),
    })),
  });
}


// ==========================================
// TOGGLE LIKE
// ==========================================

async function toggleLike(req, res) {
  const foodItem = await foodModel.findById(
    req.params.foodId
  );

  if (!foodItem) {
    return res.status(404).json({
      message: "Food item not found",
    });
  }

  const userId = req.user._id;

  const alreadyLiked = foodItem.likedBy.some(
    (id) => id.equals(userId)
  );

  if (alreadyLiked) {
    foodItem.likedBy.pull(userId);
    req.user.likedFoodItems.pull(foodItem._id);
  } else {
    foodItem.likedBy.addToSet(userId);
    req.user.likedFoodItems.addToSet(foodItem._id);
  }

  foodItem.likes = foodItem.likedBy.length;

  await Promise.all([
    foodItem.save(),
    req.user.save(),
  ]);

  return res.status(200).json({
    liked: !alreadyLiked,
    likes: foodItem.likes,
  });
}


// ==========================================
// PLACE ORDER
// ==========================================

async function placeOrder(req, res) {
  req.body = {
    items: [
      {
        food: req.params.foodId,
        quantity: 1,
      },
    ],
  };

  const originalJson = res.json.bind(res);

  res.json = (payload) =>
    originalJson({
      ...payload,

      orderCount: payload.order?.items?.[0]
        ? undefined
        : payload.orderCount,
    });

  return orderController.createOrder(req, res);
}


// ==========================================
// ADD COMMENT
// ==========================================

async function addComment(req, res) {
  const text = req.body.text?.trim();

  if (!text) {
    return res.status(400).json({
      message: "Comment text is required",
    });
  }

  const foodItem = await foodModel.findById(
    req.params.foodId
  );

  if (!foodItem) {
    return res.status(404).json({
      message: "Food item not found",
    });
  }

  foodItem.comments.push({
    user: req.user._id,
    text,
  });

  await foodItem.save();

  return res.status(201).json({
    message: "Comment added successfully",
    comments: foodItem.comments.length,
  });
}


// ==========================================
// GET FOOD PARTNER
// ==========================================

async function getFoodPartner(req, res) {
  const foodPartner =
    await foodPartnerModel
      .findById(req.params.partnerId)
      .select(
        "name email contactName phone address status"
      );

  if (!foodPartner) {
    return res.status(404).json({
      message: "Food partner not found",
    });
  }

  const foodItems = await foodModel
    .find({
      foodPartner: foodPartner._id,
    })
    .sort({
      createdAt: -1,
      _id: -1,
    });

  return res.status(200).json({
    foodPartner,

    foodItems: foodItems.map((food) => ({
      ...food.toObject(),
      comments: food.comments.length,
    })),
  });
}


module.exports = {
  getImageKitUploadAuth,
  createFood,
  getFoodItem,
  getFoodPartner,
  toggleLike,
  placeOrder,
  addComment,
};