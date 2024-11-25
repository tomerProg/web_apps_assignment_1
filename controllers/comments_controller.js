import { StatusCodes } from 'http-status-codes';
import commentModel from '../models/comments_model.js';

export const getAllComments = async (_req, res) => {
    try {
        const comments = await commentModel.find();
        res.send(comments);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};
