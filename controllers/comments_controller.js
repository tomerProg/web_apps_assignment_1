import { StatusCodes } from 'http-status-codes';
import commentModel from '../models/comments_model.js';

export const createComment = async (req, res) => {
    const commentBody = req.body;

    try {
        const comment = await commentModel.create(commentBody);
        res.status(StatusCodes.CREATED).send(comment);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(error.message);
    }
};