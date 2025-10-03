import { Request, Response } from 'express';
import { CategoryModel } from '../models/category.model';
import { createValidationError, ResponseUtil } from '../utils/response';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image } = req.body;

    const nameExists = await CategoryModel.findOne({ name });
    if (nameExists) {
      ResponseUtil.badRequest(res, 'Category name already exists', [
        createValidationError('name', 'Category name already exists'),
      ]);
      return;
    }
    const slugExists = await CategoryModel.findOne({ slug });
    if (slugExists) {
      ResponseUtil.badRequest(res, 'Category slug already exists', [
        createValidationError('slug', 'Category slug already exists'),
      ]);
      return;
    }

    const category = await CategoryModel.create({
      name,
      slug,
      description: description || '',
      image: image || { url: '', public_id: '' },
    });

    ResponseUtil.success(res, { category }, 'Category created successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error',error as Error);
  }
};

export const getCategories = async (_: Request, res: Response): Promise<void> => {
  try {
    const categories = await CategoryModel.find({}).sort({ createdAt: -1 });
    ResponseUtil.success(res, { categories }, 'Categories fetched successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error',error as Error);
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      ResponseUtil.badRequest(res, 'Category not found', [
        createValidationError('id', 'Category not found'),
      ]);
      return;
    }
    ResponseUtil.success(res, { category }, 'Category fetched successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error',error as Error);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, slug } = req.body;

    const category = await CategoryModel.findById(id);
    if (!category) {
      ResponseUtil.badRequest(res, 'Category not found', [
        createValidationError('id', 'Category not found'),
      ]);
      return;
    }

    // Check for duplicate name if name is being updated
    if (name && name !== category.name) {
      const nameExists = await CategoryModel.findOne({ name });
      if (nameExists && nameExists._id.toString() !== id) {
        ResponseUtil.badRequest(res, 'Category name already exists', [
          createValidationError('name', 'Category name already exists'),
        ]);
        return;
      }
    }

    // Check for duplicate slug if slug is being updated
    if (slug && slug !== category.slug) {
      const slugExists = await CategoryModel.findOne({ slug });
      if (slugExists && slugExists._id.toString() !== id) {
        ResponseUtil.badRequest(res, 'Category slug already exists', [
          createValidationError('slug', 'Category slug already exists'),
        ]);
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (slug !== undefined) updateData.slug = slug;

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    ResponseUtil.success(res, { category: updatedCategory }, 'Category updated successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) {
      ResponseUtil.badRequest(res, 'Category not found', [
        createValidationError('id', 'Category not found'),
      ]);
      return;
    }
    ResponseUtil.success(res, {}, 'Category deleted successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error',error as Error);
  }
};