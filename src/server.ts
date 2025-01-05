import bodyParser from 'body-parser';
import express, { Express } from 'express';
import * as http from 'http';
import commentsRouter from './routes/comments_route.js';
import postsRouter from './routes/posts_route';
import { Service } from './service';

export class Server extends Service {
    private readonly app: Express;
    private readonly server: http.Server;

    constructor(private readonly port: number | string) {
        super();

        this.app = express();
        this.useMiddlwares();
        this.useRoutes();
        this.server = http.createServer(this.app);
    }

    useMiddlwares() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    useRoutes() {
        this.app.use('/posts', postsRouter);
        this.app.use('/comments', commentsRouter);
    }

    start() {
        return new Promise<void>((resolve, reject) => {
            this.server
                .listen(this.port, () => {
                    console.log(`server listening on port ${this.port}`);
                    resolve();
                })
                .once('error', reject);
        });
    }

    stop() {
        return new Promise<void>((resolve, reject) => {
            this.server
                .close(() => {
                    console.log('server closed');
                    resolve();
                })
                .once('error', reject);
        });
    }
}
