import mongoose, { Connection } from 'mongoose';

export class Database {
    private databaseConnection: Connection;

    constructor(private readonly connectionString: string) {
        this.databaseConnection = mongoose.connection;
        this.databaseConnection.on('error', (error) => console.error(error));
        this.databaseConnection.once('open', () => console.log('Connected to database'));
    }

    connect() {
        return mongoose.connect(this.connectionString);
    }

    disconnect() {
        return mongoose.disconnect();
    }
}

const startDatabase = async () => {
    const { DB_CONNECT: dbConnectionString } = process.env;
    if (!dbConnectionString) {
        throw new Error('missing config DB_CONNECT');
    }
    const database = new Database(dbConnectionString);
    await database.connect();

    return database;
};

export default startDatabase;
