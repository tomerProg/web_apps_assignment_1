import { Router } from 'express';
import BasicController from '../controllers/base_controller';

const createBasicRouter = <T>(basicContorller: BasicController<T>): Router => {
    const router = Router();

    router.get('/', basicContorller.getAll);
    router.get('/:id', basicContorller.getById);
    router.post('/', basicContorller.create);
    router.put('/:id', basicContorller.update);
    router.delete('/:id', basicContorller.deleteItem);

    return router;
};

export default createBasicRouter;
