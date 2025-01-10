import { Request, Response } from 'express';
import postModel, { IPost } from '../models/posts_model';
import BaseController from './base_controller';

class PostController extends BaseController<IPost> {
    constructor() {
        super(postModel);
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

export default new PostController();
