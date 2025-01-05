import express from 'express';
import { createComment, deleteComment, updateComment, getComments } from '../controllers/comments_controller.js';

const router = express.Router();

router.get('/', getComments);
router.post('/', createComment);
router.put('/:commentId', updateComment);
router.delete('/:commitId', deleteComment);

export default router;
