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

export const createComment = async (req, res) => {
    const commentBody = req.body;

    try {
        const comment = await commentModel.create(commentBody);
        res.status(StatusCodes.CREATED).send(comment);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(error.message);
    }
};

export const updateComment = async (req, res) => {
    const {
        params: { commentId },
        body: commentUpdate,
    } = req;

    try {
        const { modifiedCount } = await commentModel.updateOne({ _id: commentId }, commentUpdate);

        if (modifiedCount === 0) {
            res.status(StatusCodes.NOT_FOUND).send('comment is not exist');
        } else {
            res.sendStatus(StatusCodes.OK);
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

export const deleteComment = async (req, res) => {
    const { commitId } = req.params;

    try {
        await commentModel.deleteOne({ _id: commitId });
        res.sendStatus(StatusCodes.OK);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};
