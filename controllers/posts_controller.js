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

export const getPosts = async (req, res) => {
    const { sender  } = req.query;
    try {
        const posts = await postModel.find(sender ? { owner: sender } : {});
        res.send(posts);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
};

export const updatePost = async (req, res) => {
    const {
        params: { postId },
        body: postUpdate,
    } = req;

    try {
        const { modifiedCount } = await postModel.updateOne({ _id: postId }, postUpdate);
        
        if (modifiedCount === 0) {
            res.status(StatusCodes.NOT_FOUND).send('post is not exist');
        } else {
            res.sendStatus(StatusCodes.OK);
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
}
