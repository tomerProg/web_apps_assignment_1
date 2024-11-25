import { StatusCodes } from 'http-status-codes';
import postModel from '../models/posts_model.js';

export const createPost = async (req, res) => {
    const postBody = req.body;

    try {
        const post = await postModel.create(postBody);
        res.status(StatusCodes.CREATED).send(post);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(error.message);
    }
};
