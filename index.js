import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import commentsRouter from './routes/comments_route.js';
import postsRouter from './routes/posts_route.js';

dotenv.config();
const { PORT: serverPort, DB_CONNECT: dbServer } = process.env;

mongoose.connect(dbServer);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);

app.listen(serverPort, () => {
    console.log(`server listening on port ${serverPort}`);
});
