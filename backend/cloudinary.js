const cloudinary = require("cloudinary");

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
const missingConfig = Object.entries(cloudinaryConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length) {
  throw new Error(
    `Missing Cloudinary configuration: ${missingConfig.join(", ")}`,
  );
}

cloudinary.config(cloudinaryConfig);

module.exports = cloudinary;
