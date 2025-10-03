import mongoose, { Schema, Model } from 'mongoose';
import { Image, Product, Size } from '../types/models';

export interface ProductDocument
  extends Omit<Product, 'category'>,
    mongoose.Document {
  _id: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: Object,
      default: {
        url: '',
        public_id: '',
      },
      required: [true, 'Product thumbnail is required'],
    },
    images: {
      type: [
        {
          url: { type: String },
          public_id: { type: String },
        },
      ],
      default: [],
      validate: {
        validator: function (images: Image[]) {
          return Array.isArray(images) && images.length <= 10;
        },
        message: 'Cannot upload more than 10 images',
      },
      required: [true, 'Product images are required'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    size: {
      type: [String],
      enum: Object.values(Size),
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    totalStock: {
      type: Number,
      default: 0,
      min: [0, 'Total stock cannot be negative'],
    },
    totalSold: {
      type: Number,
      default: 0,
      min: [0, 'Total sold cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = (this.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Update inStock based on stock
  this.inStock = (this.stock as number) > 0;

  next();
});

// Virtual for average rating (if you add reviews)
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Indexes
// Note: slug index is automatically created by 'unique: true'
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search
productSchema.index({ category: 1 }); // Filter by category
productSchema.index({ price: 1 }); // Sort by price
productSchema.index({ inStock: 1 }); // Filter by stock availability
productSchema.index({ createdAt: -1 }); // Sort by newest

export const ProductModel: Model<ProductDocument> =
  mongoose.model<ProductDocument>('Product', productSchema);
