import { Schema, model } from 'mongoose';

const postSchema = new Schema({
    title: { type: String, required: true },
    content: String,
    owner: { type: String, required: true },
});

export default model('Posts', postSchema);
