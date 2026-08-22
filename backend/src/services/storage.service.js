const ImageKit = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function getUploadAuthParams() {
  const { token, expire, signature } =
    imagekit.helper.getAuthenticationParameters();

  return {
    token,
    expire,
    signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  };
}

module.exports = {
  getUploadAuthParams,
};