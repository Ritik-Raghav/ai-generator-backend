import express from 'express';
const router = express.Router();
import fileController from '../controllers/file.js';
import authenticate from '../middlewares/auth.js'

router.post('/api/save-response', authenticate, fileController.saveFile);
router.post('/api/save-code', authenticate, fileController.saveExtractedCode);

export default router;