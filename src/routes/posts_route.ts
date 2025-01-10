import { Router } from 'express';
import { authMiddleware } from '../controllers/auth_controller';
import postController from '../controllers/posts_controller';

const router = Router();

router.get('/', postController.getAll.bind(postController));
router.get('/:id', postController.getById.bind(postController));
router.post('/', authMiddleware, postController.create.bind(postController));
router.put('/:id', authMiddleware, postController.update.bind(postController));
router.delete(
    '/:id',
    authMiddleware,
    postController.deleteItem.bind(postController)
);

export default router;
