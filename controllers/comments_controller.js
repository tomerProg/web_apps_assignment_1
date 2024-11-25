import { StatusCodes } from 'http-status-codes';
import commentModel from '../models/comments_model.js';

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
