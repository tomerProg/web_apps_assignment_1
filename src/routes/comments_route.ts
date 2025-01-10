import {Router} from 'express';
import CommentController from '../controllers/comments_controller';
import { authMiddleware } from '../controllers/auth_controller';

const router = Router();

router.get('/', CommentController.getAll.bind(CommentController));
router.get('/:id', CommentController.getById.bind(CommentController));
router.post('/', authMiddleware, CommentController.create.bind(CommentController));
router.put('/:id', authMiddleware, CommentController.update.bind(CommentController));
router.delete('/:id', authMiddleware, CommentController.deleteItem.bind(CommentController));

export default router;
