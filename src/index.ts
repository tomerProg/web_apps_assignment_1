import dotenv from 'dotenv';
import startDatabase from './database';
import startServer from './server';

dotenv.config();

const startSystem = async () => {
    const database = await startDatabase();
    const app = await startServer();

    return { app, database };
};

startSystem().catch((error) => {
    console.log(error);
    process.exit(1);
});
