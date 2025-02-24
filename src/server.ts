import bodyParser from 'body-parser';
import express, { Express } from 'express';
import authRouter from './routes/auth_route';
import commentsRouter from './routes/comments_route';
import postsRouter from './routes/posts_route';
import swaggerUI from "swagger-ui-express"
import specs from './swagger'

export const createApp = (): Express => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/auth', authRouter);
    app.use('/posts', postsRouter);
    app.use('/comments', commentsRouter);
    
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));    
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

