import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import userModel, { IUser } from '../models/users_model';
import BaseController from './base_controller';

class UserController extends BaseController<IUser> {
    constructor() {
        super(userModel);
    }

    override async getAll(req: Request, res: Response){
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
}

export default new UserController();
