import express from 'express';
import { createPost, getPosts, updatePost, deletePost } from '../controllers/posts_controller.js';

const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;
