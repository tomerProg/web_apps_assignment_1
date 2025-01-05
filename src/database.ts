import mongoose, { Connection } from 'mongoose';
import { Service } from './service';

export class Database extends Service {
    private databaseConnection: Connection | null = null;

    constructor(private readonly connectionString: string) {
        super();
    }

    async start() {
        await mongoose.connect(this.connectionString);

        this.databaseConnection = mongoose.connection;
        this.databaseConnection.on('error', (error) => console.error(error));
        this.databaseConnection.once('open', () => console.log('Connected to database'));
    }

    stop() {
        return mongoose.disconnect();
    }
}
