import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const register = async (_req: Request, res: Response) => {
    res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};

export default {
    register
};
