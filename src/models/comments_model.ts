import {Schema, model } from 'mongoose'

export interface IComment {
    owner: string,
    postId: string,
    content: string
}

const commentSchema = new Schema<IComment>({
    owner: {type: String, required: true},
    postId: { type: String, required: true },
    content: {type: String, required: true},
});

export default model('Comments', commentSchema);
