import { ResponseUtil } from '../utils/response';
import {
  deleteImage as deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from '../config/cloudinary';
import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { folder } = req.body;
    const file = req.file as Express.Multer.File;
    const result = await uploadImageToCloudinary(file, folder);
    if (!result.success) {
      ResponseUtil.badRequest(res, 'Image uploaded failed');
      return;
    }
    ResponseUtil.success(res, result, 'Image uploaded successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Error uploading image', error as Error);
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { public_id } = req.body;
    const result = await deleteImageFromCloudinary(public_id);
    if (!result.success) {
      ResponseUtil.badRequest(res, 'Image deleted failed');
      return;
    }
    ResponseUtil.success(res, result, 'Image deleted successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Error deleting image', error as Error);
  }
};
