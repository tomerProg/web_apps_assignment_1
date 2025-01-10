import {Schema, model } from 'mongoose'

export interface IComment {
    user: string,
    postId: string,
    content: string
}

const commentSchema = new Schema<IComment>({
    user: {type: String, required: true},
    postId: { type: String, required: true },
    content: String,
});

export default model('Comments', commentSchema);
