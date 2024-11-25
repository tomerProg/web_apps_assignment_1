import express from 'express';
import { createPost, getPosts, updatePost } from '../controllers/posts_controller.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:postId', updatePost);

export default router;
