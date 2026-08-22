const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");

async function getCurrentUser(req, res) {
  const user = await userModel.findById(req.user._id)
    .populate("likedFoodItems", "name video description")
    .populate("followingFoodPartners", "name status address")
    .populate("orders.food", "name video");
  const followedPartners = await foodPartnerModel.find({
    _id: { $in: user.followingFoodPartners.map((partner) => partner._id) },
  })
    .select("name status address");

  return res.status(200).json({
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      followingFoodPartners: user.followingFoodPartners,
      likedVideos: user.likedFoodItems,
      orders: user.orders,
      livePartners: followedPartners,
    },
  });
}

async function toggleFollowFoodPartner(req, res) {
  const partner = await foodPartnerModel.findById(req.params.partnerId);
  if (!partner) {
    return res.status(404).json({ message: "Food partner not found" });
  }

  const alreadyFollowing = req.user.followingFoodPartners.some((id) =>
    id.equals(partner._id),
  );

  if (alreadyFollowing) {
    req.user.followingFoodPartners.pull(partner._id);
  } else {
    req.user.followingFoodPartners.addToSet(partner._id);
  }
  await req.user.save();

  return res.status(200).json({ following: !alreadyFollowing });
}

async function updateUserProfileImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "A profile image is required" });
  }

  try {
    const fileUploadResult = await storageService.uploadFile(
      req.file.buffer,
      `profile-${uuid()}`,
    );

    req.user.profileImage = fileUploadResult.url;
    await req.user.save();

    return res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: req.user.profileImage,
    });
  } catch (error) {
    console.error("updateUserProfileImage error:", error);
    return res.status(500).json({ message: "Unable to update profile image" });
  }
}

async function getCurrentFoodPartner(req, res) {
  const foodItems = await require("../models/food.model")
    .find({ foodPartner: req.foodPartner._id })
    .sort({ createdAt: -1, _id: -1 });

  return res.status(200).json({
    foodPartner: {
      id: req.foodPartner._id,
      name: req.foodPartner.name,
      email: req.foodPartner.email,
      contactName: req.foodPartner.contactName,
      phone: req.foodPartner.phone,
      address: req.foodPartner.address,
      status: req.foodPartner.status,
    },
    foodItems,
  });
}

async function updateFoodPartnerStatus(req, res) {
  const status = req.body.status;
  if (!["Open", "Closed"].includes(status)) {
    return res.status(400).json({ message: "Status must be Open or Closed" });
  }

  req.foodPartner.status = status;
  await req.foodPartner.save();
  return res.status(200).json({
    message: "Food partner status updated",
    status: req.foodPartner.status,
  });
}

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });
    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    res.cookie("userToken", token);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("userToken", token);
    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

function logoutUser(req, res) {
  res.clearCookie("userToken");
  res.status(200).json({
    message: "User Logout Successfully",
  });
}

async function registerFoodPartner(req, res) {
  try {
    const {
      businessName: name,
      email,
      password,
      contactNumber: phone,
      address,
      contactName,
    } = req.body;

    const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
    if (isAccountAlreadyExists) {
      return res.status(400).json({ message: "Food partner account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const foodPartner = await foodPartnerModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      contactName,
    });

    const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
    res.cookie("foodPartnerToken", token);
    return res.status(201).json({
      message: "Food partner registered successfully",
      foodPartner: {
        id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
        phone: foodPartner.phone,
        address: foodPartner.address,
        contactName: foodPartner.contactName,
      },
    });
  } catch (error) {
    console.error("registerFoodPartner error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function loginfoodPartner(req, res) {
  const { email, password } = req.body;
  const foodPartner = await foodPartnerModel.findOne({
    email,
  });
  if (!foodPartner) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }

  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("foodPartnerToken", token);
  res.status(200).json({
    message: "Food Partner LogedIn Successfully",
    foodPartner: {
      id: foodPartner._id,
      email: foodPartner.email,
      fullName: foodPartner.name,
    },
  });
}

function logoutFoodPartner(req, res) {
  res.clearCookie("foodPartnerToken");
  res.status(200).json({
    message: "Food partner logged out successfully",
  });
}

module.exports = {
  getCurrentUser,
  getCurrentFoodPartner,
  updateFoodPartnerStatus,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfileImage,
  toggleFollowFoodPartner,
  registerFoodPartner,
  loginfoodPartner,
  logoutFoodPartner,
};
