const foodModel = require("../models/food.model");
const foodPartnerModel = require("../models/foodpartner.model");
const orderController = require("./order.controller");

async function createFood(req, res) {
  try {
    const { name, description, video } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Food name is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        message: "Food description is required",
      });
    }

    if (!video?.trim()) {
      return res.status(400).json({
        message: "Food video is required",
      });
    }

    const foodItem = await foodModel.create({
      name: name.trim(),
      description: description.trim(),
      video: video.trim(),
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

async function getFoodItem(req, res) {
  try {
    const foodItems = await foodModel
      .find({})
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .populate(
        "foodPartner",
        "name email contactName phone address status"
      );

    const userId = req.user?._id?.toString();

    const formattedFood = foodItems.map((food) => {
      const item = food.toObject();

      return {
        ...item,

        comments: Array.isArray(food.comments)
          ? food.comments.length
          : 0,

        isLiked: Boolean(
          userId &&
            Array.isArray(food.likedBy) &&
            food.likedBy.some(
              (id) => id.toString() === userId
            )
        ),
      };
    });

    return res.status(200).json({
      message: "Food items fetched successfully",
      foodItems: formattedFood,
    });
  } catch (error) {
    console.error("getFoodItem error:", error);

    return res.status(500).json({
      message: "Unable to fetch food items",
    });
  }
}

async function toggleLike(req, res) {
  try {
    const foodItem = await foodModel.findById(
      req.params.foodId
    );

    if (!foodItem) {
      return res.status(404).json({
        message: "Food item not found",
      });
    }

    const userId = req.user._id;

    const alreadyLiked = foodItem.likedBy.some((id) =>
      id.equals(userId)
    );

    if (alreadyLiked) {
      foodItem.likedBy.pull(userId);

      if (req.user.likedFoodItems) {
        req.user.likedFoodItems.pull(foodItem._id);
      }
    } else {
      foodItem.likedBy.addToSet(userId);

      if (req.user.likedFoodItems) {
        req.user.likedFoodItems.addToSet(foodItem._id);
      }
    }

    foodItem.likes = foodItem.likedBy.length;

    const operations = [foodItem.save()];

    if (req.user.likedFoodItems) {
      operations.push(req.user.save());
    }

    await Promise.all(operations);

    return res.status(200).json({
      liked: !alreadyLiked,
      likes: foodItem.likes,
    });
  } catch (error) {
    console.error("toggleLike error:", error);

    return res.status(500).json({
      message: "Unable to update like",
    });
  }
}

async function placeOrder(req, res) {
  req.body = {
    items: [
      {
        food: req.params.foodId,
        quantity: 1,
      },
    ],
  };

  return orderController.createOrder(req, res);
}

async function addComment(req, res) {
  try {
    const text = req.body?.text?.trim();

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        message: "Comment cannot exceed 500 characters",
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

    const newComment =
      foodItem.comments[
        foodItem.comments.length - 1
      ];

    const populatedFood = await foodModel
      .findById(foodItem._id)
      .populate(
        "comments.user",
        "name firstname lastname fullName email"
      );

    const populatedComment =
      populatedFood?.comments[
        populatedFood.comments.length - 1
      ];

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment || newComment,
      comments: foodItem.comments.length,
    });
  } catch (error) {
    console.error("addComment error:", error);

    return res.status(500).json({
      message: "Unable to add comment",
    });
  }
}

async function getComments(req, res) {
  try {
    const foodItem = await foodModel
      .findById(req.params.foodId)
      .populate(
        "comments.user",
        "name firstname lastname fullName email"
      );

    if (!foodItem) {
      return res.status(404).json({
        message: "Food item not found",
      });
    }

    const comments = Array.isArray(foodItem.comments)
      ? foodItem.comments
      : [];

    return res.status(200).json({
      message: "Comments fetched successfully",
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error("getComments error:", error);

    return res.status(500).json({
      message: "Unable to load comments",
    });
  }
}

async function getFoodPartner(req, res) {
  try {
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

        comments: Array.isArray(food.comments)
          ? food.comments.length
          : 0,
      })),
    });
  } catch (error) {
    console.error("getFoodPartner error:", error);

    return res.status(500).json({
      message: "Unable to fetch food partner",
    });
  }
}

module.exports = {
  createFood,
  getFoodItem,
  getFoodPartner,
  toggleLike,
  placeOrder,
  addComment,
  getComments,
};