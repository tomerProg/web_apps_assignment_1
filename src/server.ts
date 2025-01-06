import bodyParser from 'body-parser';
import express, { Express } from 'express';
import { Database } from './database';
import commentsRouter from './routes/comments_route.js';
import postsRouter from './routes/posts_route';

const createApp = (): Express => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/posts', postsRouter);
    app.use('/comments', commentsRouter);

    return app;
};

const initApp = async () => {
    const { DB_CONNECT: dbConnectionString } = process.env;
    if (!dbConnectionString) {
        throw new Error('missing config DB_CONNECT');
    }
    const database = new Database(dbConnectionString);
    await database.connect();

    return createApp();
};

export default initApp;
