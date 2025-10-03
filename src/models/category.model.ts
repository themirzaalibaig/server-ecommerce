import mongoose, { Schema, Model } from 'mongoose';
import { Category } from '../types/models';

export interface CategoryDocument extends Category, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    image: {
      type: Object,
      default: {
        url: '',
        public_id: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = (this.name as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Note: Indexes for name and slug are automatically created by 'unique: true'

export const CategoryModel: Model<CategoryDocument> =
  mongoose.model<CategoryDocument>('Category', categorySchema);
