import express from 'express';
import { getAllComments } from '../controllers/comments_controller.js';

const router = express.Router();

router.get('/', getAllComments);

export default router;
