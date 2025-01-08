import postModel, { IPost } from '../models/posts_model';
import BaseController from './base_controller';

class PostController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }
}

export default new PostController();
