import { StatusCodes } from 'http-status-codes';
import commentModel from '../models/comments_model.js';

export const deleteComment = async (req, res) => {
    const { commitId } = req.params;

    try {
        await commentModel.deleteOne({ _id: commitId });
        res.sendStatus(StatusCodes.OK);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};
