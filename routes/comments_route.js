import express from 'express';
import { deleteComment } from '../controllers/comments_controller.js';

const router = express.Router();

router.delete('/:commitId', deleteComment);

export default router;
