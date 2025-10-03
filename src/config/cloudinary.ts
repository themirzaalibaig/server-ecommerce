import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from '../types/cloudinary';
import { logger } from '../utils/logger';

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  logger.error('Cloudinary credentials are not set');
  throw new Error('Cloudinary credentials are not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'products'
): Promise<CloudinaryResponse> => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    logger.error('Error uploading to Cloudinary:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteImage = async (
  public_id: string
): Promise<CloudinaryResponse> => {
  try {
    await cloudinary.uploader.destroy(public_id);
    return { success: true };
  } catch (error: any) {
    logger.error('Error deleting image from Cloudinary:', error.message);
    return { success: false, error: error.message };
  }
};

export const getImageUrl = async (public_id: string): Promise<string> => {
  return cloudinary.url(public_id, {
    width: 100,
    height: 100,
    crop: 'fill',
  });
};
