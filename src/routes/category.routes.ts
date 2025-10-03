import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validations/category.validation';
import { validate } from '../middleware/validation.middleware';

const router: Router = Router();

router.post('/', validate(createCategorySchema), createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export { router as categoryRoutes };
