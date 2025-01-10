import { StatusCodes } from 'http-status-codes';
import { Types as MongooseTypes } from 'mongoose';
import request from 'supertest';
import startDatabase, { Database } from '../database';
import postsModel from '../models/posts_model';
import usersModel, { IUser } from '../models/users_model';
import { createApp } from '../server';
import { createUserAuthenticationToken } from './auth.test';
import {
    allTestPosts,
    firstOwner,
    firstOwnerPosts,
    secondOwnerPosts
} from './test_posts';

describe('Posts Router', () => {
    let database: Database;
    const app = createApp();

    const user: IUser = {
        email: 'userEmail',
        password: '123456'
    };
    let authenticationToken: string;

    beforeAll(async () => {
        database = await startDatabase();
        await postsModel.deleteMany();
        authenticationToken = await createUserAuthenticationToken(app, user);
    });
    afterAll(async () => {
        await usersModel.deleteMany();
        await database.disconnect();
    });

    beforeEach(async () => {
        await postsModel.insertMany(allTestPosts);
    });
    afterEach(async () => {
        await postsModel.deleteMany();
    });

    describe('get all posts', () => {
        test('get all posts should return all posts', async () => {
            const response = await request(app).get('/posts');

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                expect.arrayContaining(
                    allTestPosts.map((post) => expect.objectContaining(post))
                )
            );
        });

        test('get all posts with owner should return owner posts', async () => {
            const response = await request(app)
                .get('/posts')
                .query({ owner: firstOwner });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                firstOwnerPosts.map((post) => expect.objectContaining(post))
            );
            secondOwnerPosts.forEach((post) => {
                expect(response.body).not.toContainEqual(
                    expect.objectContaining(post)
                );
            });
        });
    });

    describe('get post by id', () => {
        test('existing post should return the post', async () => {
            const expectedPost = allTestPosts[1];
            const { _id } = (await postsModel.findOne(expectedPost).lean())!;
            const response = await request(app).get(`/posts/${_id}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                expect.objectContaining(expectedPost)
            );
        });

        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await request(app).get('/posts/randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('not existing post should return NOT_FOUND', async () => {
            const response = await request(app).get(
                '/posts/000000000000000000000000'
            );

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
        });
    });

    describe('delete post by id', () => {
        const requestDeletePost = (postId: string | MongooseTypes.ObjectId) =>
            request(app)
                .delete(`/posts/${postId}`)
                .set({ authorization: 'JWT ' + authenticationToken });

        test('existing post should return the post and delete it', async () => {
            const expectedPost = allTestPosts[1];
            const { _id } = (await postsModel.findOne(expectedPost).lean())!;
            const response = await requestDeletePost(_id);
            const doc = await postsModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(doc).toBeNull();
        });

        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await requestDeletePost('randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('not existing post should return OK', async () => {
            const response = await requestDeletePost(
                '000000000000000000000000'
            );

            expect(response.status).toBe(StatusCodes.OK);
        });
    });

    describe('update post by id', () => {
        const requestUpdatePost = (postId: string | MongooseTypes.ObjectId) =>
            request(app)
                .put(`/posts/${postId}`)
                .set({ authorization: 'JWT ' + authenticationToken });

        test('valid update should update the post', async () => {
            const expectedPost = allTestPosts[1];
            const { _id } = (await postsModel.findOne(expectedPost).lean())!;
            const update = { title: 'updated title' };
            const response = await requestUpdatePost(_id).send(update);
            const updatedPost = await postsModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(updatedPost).toBeDefined();
            expect(updatedPost).toStrictEqual(expect.objectContaining(update));
        });

        test('id not in ObjectId format should return INTERNAL_SERVER_ERROR status', async () => {
            const response = await requestUpdatePost('randomId');

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        test('invalid update field should return INTERNAL_SERVER_ERROR status', async () => {
            const expectedPost = allTestPosts[1];
            const { _id } = (await postsModel.findOne(expectedPost).lean())!;
            const update = { title: { field: 'field' } };
            const response = await requestUpdatePost(_id).send(update);

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('create post', () => {
        const requestCreatePost = () =>
            request(app)
                .post('/posts')
                .set({ authorization: 'JWT ' + authenticationToken });

        test('valid new post should create new post', async () => {
            const newPost = {
                title: 'new title',
                content: 'content'
            };
            const response = await requestCreatePost().send(newPost);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining(newPost)
            );
        });

        test('missing post field should return BAD_REQUEST', async () => {
            const newPost = {
                content: 'content'
            };
            const response = await requestCreatePost().send(newPost);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
