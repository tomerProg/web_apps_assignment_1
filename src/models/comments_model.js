import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
    user: { type: String, required: true },
    postId: { type: String, required: true },
    content: String
});

export default model('Comments', commentSchema);
