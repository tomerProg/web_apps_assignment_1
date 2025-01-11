import { Request, Response } from 'express';
import commentModel, { IComment } from '../models/comments_model';
import BaseController from './base_controller';

class CommentController extends BaseController<IComment> {
    constructor() {
        super(commentModel);
    }

    create(req: Request, res: Response) {
        const userId = req.params.userId;
        req.body = {
            ...req.body,
            owner: userId
        };

        return super.create(req, res);
    }
}

export default new CommentController();
