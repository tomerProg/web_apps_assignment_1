import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import startDatabase, { Database } from '../database';
import usersModel, { IUser } from '../models/users_model';
import { createApp } from '../server';

describe('authentication tests', () => {
    let database: Database;
    const app = createApp();

    beforeAll(async () => {
        database = await startDatabase();
    });
    afterAll(async () => {
        await database.disconnect();
    });
    afterEach(async () => {
        await usersModel.deleteMany();
    });

    const routeInAuthRouter = (route: string) => '/auth' + route;

    describe('register', () => {
        const user: IUser = {
            email: 'tomercpc01@gmail.com',
            password: '123456'
        };

        test('register new user shold create user', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        test('register exisitng user shold return BAD_REQUEST', async () => {
            const registerUser = (user: IUser) =>
                request(app).post(routeInAuthRouter('/register')).send(user);
            const registerResponse = await registerUser(user);
            const registerExistingResponse = await registerUser({
                ...user,
                password: 'otherPassword'
            });

            expect(registerResponse.status).toBe(StatusCodes.CREATED);
            expect(registerExistingResponse.status).toBe(
                StatusCodes.BAD_REQUEST
            );
        });

        test('missing email shold return BAD_REQUEST', async () => {
            const user: Partial<IUser> = {
                password: '123456'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing password shold return BAD_REQUEST', async () => {
            const user: Partial<IUser> = {
                email: 'tomercpc01@gmail.com'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
