import dotenv from 'dotenv';
import initApp from './server';

dotenv.config();
const { PORT: port } = process.env;

if (!port) {
    console.log('missing config PORT');
    process.exit(1);
}

const startSystem = async () => {
    const app = await initApp();

    return new Promise<void>((resolve, reject) => {
        app.listen(port, () => {
            console.log(`server listening on port ${port}`);
            resolve();
        });

        app.once('error', reject);
    });
};

startSystem()
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
