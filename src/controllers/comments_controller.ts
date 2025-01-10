import commentModel, {IComment} from '../models/comments_model';
import BaseController from "./base_controller";

const commentsController = new BaseController<IComment>(commentModel);

export default commentsController