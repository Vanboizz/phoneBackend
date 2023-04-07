const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.APP_CLOUDNAME,
  api_key: process.env.APP_APIKEY,
  api_secret: process.env.APP_APISECRET,
});

module.exports = cloudinary;
