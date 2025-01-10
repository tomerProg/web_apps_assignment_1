import {Router} from 'express';
import CommentController from '../controllers/comments_controller';

const router = Router();

router.get('/', CommentController.getAll.bind(CommentController));
router.get('/:id', CommentController.getById.bind(CommentController));
router.post('/', CommentController.create.bind(CommentController));
router.put('/:id', CommentController.update.bind(CommentController));
router.delete('/:id', CommentController.deleteItem.bind(CommentController));

export default router;
