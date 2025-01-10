import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { createUserForDb } from '../controllers/auth_controller';
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
    const testUser: IUser = {
        email: 'tomercpc01@gmail.com',
        password: '123456'
    };

    describe('register', () => {
        test('register new user shold create user', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(testUser);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        test('register exisitng user shold return BAD_REQUEST', async () => {
            const registerUser = (user: IUser) =>
                request(app).post(routeInAuthRouter('/register')).send(user);
            const registerResponse = await registerUser(testUser);
            const registerExistingResponse = await registerUser({
                ...testUser,
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

    describe('login', () => {
        beforeEach(async () => {
            const { email, password } = testUser;
            const user = await createUserForDb(email, password);
            await usersModel.create(user);
        });

        test('user login should return tokens', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/login'))
                .send(testUser);
            const { accessToken, refreshToken } = response.body;

            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(response.body._id).toBeDefined();
        });

        test('login should return different tokens for each login', async () => {
            const loginUser = () =>
                request(app).post(routeInAuthRouter('/login')).send(testUser);

            const firstLogin = await loginUser();
            expect(firstLogin.status).toBe(StatusCodes.OK);

            const secondLogin = await loginUser();
            expect(secondLogin.status).toBe(StatusCodes.OK);

            const {
                accessToken: firstLoginAccesToken,
                refreshToken: firstLoginRefreshToken
            } = firstLogin.body;
            const {
                accessToken: secondLoginAccesToken,
                refreshToken: secondLoginRefreshToken
            } = secondLogin.body;
            expect(firstLoginAccesToken).not.toBe(secondLoginAccesToken);
            expect(firstLoginRefreshToken).not.toBe(secondLoginRefreshToken);
        });

        test('incorrect password should return BAD_REQUEST', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/login'))
                .send({
                    ...testUser,
                    password: 'randomPassword'
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('incorrect email should return BAD_REQUEST', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/login'))
                .send({
                    ...testUser,
                    email: 'randomEmail'
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
