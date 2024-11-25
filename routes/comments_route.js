import express from 'express';
import { createComment, deleteComment, updateComment, getAllComments } from '../controllers/comments_controller.js';

const router = express.Router();

router.get('/', getAllComments);
router.post('/', createComment);
router.put('/:commentId', updateComment);
router.delete('/:commitId', deleteComment);

export default router;
