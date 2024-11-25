import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config();
const { PORT: serverPort, DB_CONNECT: dbServer } = process.env;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(serverPort, () => {
    console.log(`server listening on port ${serverPort}`);
});

app.use('/comments', commentsRouter)
