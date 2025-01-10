import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import {
    createUserForDb,
    generateTokens
} from '../controllers/auth_controller';
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

    const loginUser = async (user: User) => {
        const response = await request(app)
            .post(routeInAuthRouter('/login'))
            .send(user);
        expect(response.status).toBe(StatusCodes.OK);

        return response;
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

        const registerUser = (user: User) =>
            request(app).post(routeInAuthRouter('/register')).send(user);

        test('register new user shold create user', async () => {
            const response = await registerUser(testUser);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        // TODO: remove skip ! ONLY ! after creating unique index for email field
        test.skip('register exisitng user shold return BAD_REQUEST', async () => {
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
            const response = await loginUser(testUser);
            const { accessToken, refreshToken } = response.body;

            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(response.body._id).toBeDefined();
        });

        test('login should return different tokens for each login', async () => {
            const firstLogin = await loginUser(testUser);
            const secondLogin = await loginUser(testUser);

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

    describe('refresh token', () => {
        const createPostRequest = (accessToken: string) =>
            request(app)
                .post('/posts')
                .set({ authorization: 'JWT ' + accessToken })
                .send({
                    title: 'Test Post',
                    content: 'Test Content',
                    owner: 'sdfSd'
                });

        test('not existing refresh token should return BAD_REQUEST and empty user refresh tokens', async () => {
            const loginResponse = await loginUser(testUser);
            const userId = loginResponse.body._id;
            const tokens = generateTokens(userId)!;
            expect(tokens).toBeDefined();
            const { refreshToken } = tokens!;

            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });

            const user = await usersModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.BAD_REQUEST);
            expect(user?.refreshToken?.length).toBe(0);
        });

        test('refresh should insert new refresh token to user', async () => {
            const loginResponse = await loginUser(testUser);
            const { _id: userId, refreshToken } = loginResponse.body;
            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });

            const user = await usersModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.OK);
            expect(user?.refreshToken?.length).toBeGreaterThan(0);
            expect(user?.refreshToken).not.toContain(refreshToken);
        });

        test('refresh expired token should return valid token', async () => {
            const loginResponse = await loginUser(testUser);
            const { refreshToken, accessToken } = loginResponse.body;
            // wait for the token to expire
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const createPostResponse = await createPostRequest(accessToken);
            expect(createPostResponse.status).toBe(StatusCodes.UNAUTHORIZED);

            const refreshResponse = await request(app)
                .post(routeInAuthRouter('/refresh'))
                .send({ refreshToken });
            expect(refreshResponse.status).toBe(StatusCodes.OK);
            const newAccessToken = refreshResponse.body.accessToken;

            const createPostResponseWithValidToken = await createPostRequest(
                newAccessToken
            );
            expect(createPostResponseWithValidToken.status).toBe(
                StatusCodes.CREATED
            );
        }, 10_000);
    });
});
