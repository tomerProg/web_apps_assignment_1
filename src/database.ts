import mongoose, { Connection } from 'mongoose';

export class Database {
    private databaseConnection: Connection | null = null;

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
