import dotenv from 'dotenv';
import { Database } from './database.js';
import { Server } from './server.js';

dotenv.config();
const { PORT: serverPort, DB_CONNECT: dbConnectionString } = process.env;

const startSystem = async () => {
    if (!dbConnectionString) {
        throw new Error('missing config DB_CONNECT');
    }
    if (!serverPort) {
        throw new Error('missing config PORT');
    }

    const database = new Database(dbConnectionString);
    const server = new Server(serverPort);

    await database.start();
    await server.start();
};

startSystem().catch((error) => {
    console.log(error);
    process.exit(1);
});
