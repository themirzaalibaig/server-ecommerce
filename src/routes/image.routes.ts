import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/image.controller';
import multer from 'multer';

const router: Router = Router();

const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload', upload.single('file'), uploadImage);
router.post('/delete', deleteImage);

export { router as imageRoutes };
