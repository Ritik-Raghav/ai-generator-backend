import express from 'express';
const router = express.Router();
import authController from '../controllers/server.js';

router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);



export default router;