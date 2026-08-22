const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authFoodPartnerMiddleware(req, res, next) {
  const token = req.cookies?.foodPartnerToken;

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foodPartner = await foodPartnerModel.findById(decoded.id);
    if (!foodPartner) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    req.foodPartner = foodPartner;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
}

async function authUserMiddleware(req, res, next) {
  const token = req.cookies?.userToken;
  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
}

module.exports = {
  authFoodPartnerMiddleware,
  authUserMiddleware,
};
