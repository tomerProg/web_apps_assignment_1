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

export const getPostBySender = async (req, res) => {
    const { sender  } = req.query;
    try {
        if(sender) {
            const posts = await postModel.find({ owner: sender });
            res.send(posts);
        } else {
            res.status(StatusCodes.NOT_IMPLEMENTED).send('not implemented get all posts')
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};
