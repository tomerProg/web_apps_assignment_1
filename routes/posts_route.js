import express from 'express';
import { createPost, getPostBySender } from '../controllers/posts_controller.js';

const router = express.Router();

router.get('/', getPostBySender);
router.post('/', createPost);

export default router;
