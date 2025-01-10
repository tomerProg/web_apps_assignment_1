import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { createUserForDb } from '../controllers/auth_controller';
import startDatabase, { Database } from '../database';
import usersModel, { User } from '../models/users_model';
import { createApp } from '../server';

describe('authentication tests', () => {
    let database: Database;
    const app = createApp();

    const routeInAuthRouter = (route: string) => '/auth' + route;
    const testUser: User & { _id?: string } = {
        email: 'tomercpc01@gmail.com',
        password: '123456'
    };

    beforeAll(async () => {
        database = await startDatabase();
    });
    afterAll(async () => {
        database.disconnect();
    });
    beforeEach(async () => {
        const { email, password } = testUser;
        const user = await createUserForDb(email, password);
        const { _id } = await usersModel.create(user);
        testUser._id = _id;
    });
    afterEach(async () => {
        await usersModel.deleteMany();
    });

    describe('register', () => {
        beforeEach(async () => {
            await usersModel.deleteMany();
        });

        test('register new user shold create user', async () => {
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(testUser);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        // TODO: remove skip ! ONLY ! after creating unique index for email field
        test.skip('register exisitng user shold return BAD_REQUEST', async () => {
            const registerUser = (user: User) =>
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
            const user: Partial<User> = {
                password: '123456'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing password shold return BAD_REQUEST', async () => {
            const user: Partial<User> = {
                email: 'tomercpc01@gmail.com'
            };
            const response = await request(app)
                .post(routeInAuthRouter('/register'))
                .send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('login', () => {
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

    describe('logout', () => {
        const loginUser = (user: User) =>
            request(app).post(routeInAuthRouter('/login')).send(user);

        test('logout should remove all user refresh tokens', async () => {
            const loginResponse = await loginUser(testUser);
            expect(loginResponse.statusCode).toBe(StatusCodes.OK);
            const { refreshToken, _id: userId } = loginResponse.body;

            const logoutResponse = await request(app)
                .post(routeInAuthRouter('/logout'))
                .send({ refreshToken });
            expect(logoutResponse.statusCode).toBe(StatusCodes.OK);

            const user = await usersModel.findById(userId);
            expect(user).toBeDefined();
            expect(user!.refreshToken?.length).toBe(0);
        });
    });
});
