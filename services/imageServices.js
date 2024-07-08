const cloudinary = require('../config/cloudinaryConfig');

// Upload image to Cloudinary
const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });
    stream.end(buffer);
  });
};

// Delete image from Cloudinary
const deleteImage = async (url) => {
  if (!url) return;

  const publicId = url.split('/').pop().split('.')[0]; // Extract public_id from URL
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error.message);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };