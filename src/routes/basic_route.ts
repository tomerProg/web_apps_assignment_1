import { Router } from 'express';
import BasicController from '../controllers/base_controller';

const createBasicRouter = <T>(basicContorller: BasicController<T>): Router => {
    const router = Router();

    router.get('/', basicContorller.getAll.bind(basicContorller));
    router.get('/:id', basicContorller.getById.bind(basicContorller));
    router.post('/', basicContorller.create.bind(basicContorller));
    router.put('/:id', basicContorller.update.bind(basicContorller));
    router.delete('/:id', basicContorller.deleteItem.bind(basicContorller));

    return router;
};

export default createBasicRouter;
