import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  createProductSchema,
  updateProductSchema,
} from '../validations/product.validation';
import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';

const router: Router = Router();

router.post('/', validate(createProductSchema), createProduct);
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export { router as productRoutes };
