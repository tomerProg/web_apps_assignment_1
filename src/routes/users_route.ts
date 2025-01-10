import {Router} from 'express';
import UserController from '../controllers/users_controller';

const router = Router();

router.get('/:id', UserController.getById.bind(UserController));
router.post('/', UserController.create.bind(UserController));
router.put('/:id', UserController.update.bind(UserController));
router.delete('/:id', UserController.deleteItem.bind(UserController));

export default router;
