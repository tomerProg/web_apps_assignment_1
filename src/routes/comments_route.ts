import {Router} from 'express';
import CommentController from '../controllers/comments_controller';

const router = Router();

router.get('/', CommentController.getAll.bind(CommentController));
router.get('/:id', CommentController.getById.bind(CommentController));
router.post('/', CommentController.create.bind(CommentController));
router.put('/:commentId', CommentController.update.bind(CommentController));
router.delete('/:commitId', CommentController.deleteItem.bind(CommentController));

export default router;
