const storageService = require("../services/storage.service");

async function getImageKitAuth(req, res) {
  try {
    const authenticationParameters =
      await storageService.getAuthenticationParameters();

    return res.status(200).json({
      ...authenticationParameters,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("ImageKit authentication error:", error);

    return res.status(500).json({
      message: "Unable to generate upload authentication",
    });
  }
}

module.exports = {
  getImageKitAuth,
};