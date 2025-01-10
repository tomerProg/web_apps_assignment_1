import bodyParser from 'body-parser';
import express, { Express } from 'express';
import commentsRouter from './routes/comments_route';
import postsRouter from './routes/posts_route';

export const createApp = (): Express => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/posts', postsRouter);
    app.use('/comments', commentsRouter);

    return app;
};

const startServer = async () => {
    const { PORT: port } = process.env;
    if (!port) {
        throw new Error('missing config PORT');
    }
    const app = createApp();

    return new Promise<Express>((resolve, reject) => {
        app.listen(port, () => {
            console.log(`server listening on port ${port}`);
            resolve(app);
        });

        app.once('error', reject);
    });
};

export default startServer;
