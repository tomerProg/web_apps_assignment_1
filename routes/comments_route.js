import express from 'express';
import { createComment } from '../controllers/comments_controller.js';

const router = express.Router();
router.post('/', createComment);

export default router;
