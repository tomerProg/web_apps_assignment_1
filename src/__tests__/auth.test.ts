import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import startDatabase, { Database } from '../database';
import usersModel, { User } from '../models/users_model';
import { createApp } from '../server';

describe('authentication tests', () => {
    let database: Database;
    const app = createApp();

    beforeAll(async () => {
        database = await startDatabase();
    });
    afterAll(async () => {
        database.disconnect();
    });
    afterEach(async () => {
        await usersModel.deleteMany();
    });

    const routeInAuthRouter = (route: string) => '/auth' + route;

    describe('register', () => {
        const user: User = {
            email: 'tomercpc01@gmail.com',
            password: '123456'
        };

        test('register new user shold create user', async () => {
            const response = await request(app).post(routeInAuthRouter('/register')).send(user);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        test('register exisitng user shold return BAD_REQUEST', async () => {
            const registerUser = () => request(app).post(routeInAuthRouter('/register')).send(user);
            const registerResponse = await registerUser();
            const registerExistingResponse = await registerUser();

            expect(registerResponse.status).toBe(StatusCodes.ACCEPTED);
            expect(registerExistingResponse.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing email shold return BAD_REQUEST', async () => {
            const user: Partial<User> = {
                password: '123456'
            };
            const response = await request(app).post(routeInAuthRouter('/register')).send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing password shold return BAD_REQUEST', async () => {
            const user: Partial<User> = {
                email: 'tomercpc01@gmail.com'
            };
            const response = await request(app).post(routeInAuthRouter('/register')).send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
