import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { Request, Response } from 'express';
import { createValidationError, ResponseUtil } from '../utils/response';

const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, tags, color, thumbnail, images, stock, category: categoryId, size } = req.body;

    // Check if category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      ResponseUtil.badRequest(res, 'Category not found', [
        createValidationError('category', 'Invalid category ID'),
      ]);
      return;
    }

    // Check for duplicate name (slug will be unique via model)
    const nameExists = await ProductModel.findOne({ name });
    if (nameExists) {
      ResponseUtil.badRequest(res, 'Product name already exists', [
        createValidationError('name', 'Product name already exists'),
      ]);
      return;
    }

    const product = await ProductModel.create({
      name,
      slug: generateSlug(name),
      description,
      price,
      tags: tags || [],
      color: color || [],
      thumbnail,
      images,
      stock,
      category: categoryId,
      size: size || [],
    });

    // Populate category for response
    await product.populate('category');

    ResponseUtil.success(res, { product }, 'Product created successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categories, minPrice, maxPrice, sizes, inStock } = req.query;

    // Build filter object
    const filter: any = {};

    // Category filter
    if (categories) {
      const categoryIds = typeof categories === 'string' ? categories.split(',') : categories;
      filter.category = { $in: categoryIds };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Size filter
    if (sizes) {
      const sizeArray = typeof sizes === 'string' ? sizes.split(',') : sizes;
      filter.size = { $in: sizeArray };
    }

    // In stock filter
    if (inStock === 'true') {
      filter.inStock = true;
    }

    const products = await ProductModel.find(filter).populate('category').sort({ createdAt: -1 });
    ResponseUtil.success(res, { products }, 'Products fetched successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug }).populate('category');
    if (!product) {
      ResponseUtil.badRequest(res, 'Product not found', [
        createValidationError('slug', 'Product not found'),
      ]);
      return;
    }
    ResponseUtil.success(res, { product }, 'Product fetched successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id).populate('category');
    if (!product) {
      ResponseUtil.badRequest(res, 'Product not found', [
        createValidationError('id', 'Product not found'),
      ]);
      return;
    }
    ResponseUtil.success(res, { product }, 'Product fetched successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, tags, color, thumbnail, images, stock, category: categoryId, size } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      ResponseUtil.badRequest(res, 'Product not found', [
        createValidationError('id', 'Product not found'),
      ]);
      return;
    }

    // Check category if provided
    if (categoryId && categoryId !== product.category.toString()) {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        ResponseUtil.badRequest(res, 'Category not found', [
          createValidationError('category', 'Invalid category ID'),
        ]);
        return;
      }
    }

    // Check for duplicate name if changed
    if (name && name !== product.name) {
      const nameExists = await ProductModel.findOne({ name });
      if (nameExists && nameExists._id.toString() !== id) {
        ResponseUtil.badRequest(res, 'Product name already exists', [
          createValidationError('name', 'Product name already exists'),
        ]);
        return;
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (name !== undefined) updateData.slug = generateSlug(name);
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (tags !== undefined) updateData.tags = tags;
    if (color !== undefined) updateData.color = color;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (images !== undefined) updateData.images = images;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.category = categoryId;
    if (size !== undefined) updateData.size = size;

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    ResponseUtil.success(res, { product: updatedProduct }, 'Product updated successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      ResponseUtil.badRequest(res, 'Product not found', [
        createValidationError('id', 'Product not found'),
      ]);
      return;
    }
    ResponseUtil.success(res, {}, 'Product deleted successfully');
  } catch (error) {
    ResponseUtil.internalError(res, 'Internal server error', error as Error);
  }
};