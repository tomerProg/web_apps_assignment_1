import express from 'express';
import { createPost } from '../controllers/posts_controller.js';

const router = express.Router();

router.post('/', createPost);

export default router;
