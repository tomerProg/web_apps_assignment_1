import express from 'express';
import { createComment, updateComment } from '../controllers/comments_controller.js';

const router = express.Router();

router.post('/', createComment);
router.put('/:commentId', updateComment);

export default router;
