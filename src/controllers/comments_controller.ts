import { Request, Response } from 'express';
import commentModel, {IComment} from '../models/comments_model';
import BaseController from "./base_controller";
class commentsController extends BaseController<IComment>{
    constructor(){
        super(commentModel)
    }
    
    async getByPostId(req: Request, res: Response) {
        const filter = req.query.postId ? {postId: req.query.postId} : {};
        return this.getByFilter(req, res, filter);
    }
}


export default commentsController