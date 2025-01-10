import { Request, Response } from 'express';
import commentModel, {IComment} from '../models/comments_model';
import BaseController from "./base_controller";

class CommentController extends BaseController<IComment>{
    constructor(){
        super(commentModel)
    }
}

export default new CommentController();