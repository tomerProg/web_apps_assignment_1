import { StatusCodes } from 'http-status-codes';
import { Types as MongooseTypes } from 'mongoose';
import request from 'supertest';
import startDatabase, { Database } from '../database';
import CommentModel from '../models/comments_model';
import usersModel, { IUser } from '../models/users_model';
import { createApp } from '../server';
import { createUserAuthenticationToken } from './auth.test';
import {
    allTestComments,
    firstOwner,
    firstOwnerComments,
    secondOwnerComments
} from './test_comments';

describe('Comments Router', () => {
    let database: Database;
    const app = createApp();

    const user: IUser = {
        email: 'userEmail',
        password: '123456'
    };
    let authenticationToken: string;

    beforeAll(async () => {
        database = await startDatabase();
        await CommentModel.deleteMany();
        authenticationToken = await createUserAuthenticationToken(app, user);
    });
    afterAll(async () => {
        await usersModel.deleteMany();
        await database.disconnect();
    });

    beforeEach(async () => {
        await CommentModel.insertMany(allTestComments);
    });
    afterEach(async () => {
        await CommentModel.deleteMany();
    });

    describe('get all comments', () => {
        test('get all comments should return all comments', async () => {
            const response = await request(app).get('/comments');

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                expect.arrayContaining(
                    allTestComments.map((comment) =>
                        expect.objectContaining(comment)
                    )
                )
            );
        });

        test('get all comments with owner should return owner comments', async () => {
            const response = await request(app)
                .get('/comments')
                .query({ owner: firstOwner });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                firstOwnerComments.map((comment) =>
                    expect.objectContaining(comment)
                )
            );
            secondOwnerComments.forEach((comment) => {
                expect(response.body).not.toContainEqual(
                    expect.objectContaining(comment)
                );
            });
        });

        test('not existing comment should return NOT_FOUND', async () => {
            const response = await request(app).get(
                '/comments/000000000000000000000000'
            );

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
        });

        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await request(app).get('/comments/randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('delete comment by id', () => {
        const requestDeleteComment = (_id: string | MongooseTypes.ObjectId) =>
            request(app)
                .delete(`/comments/${_id}`)
                .set({ authorization: 'JWT ' + authenticationToken });

        test('existing comment should return the comment and delete it', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(
                expectedComment
            ).lean())!;
            const response = await requestDeleteComment(_id);
            const doc = await CommentModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(doc).toBeNull();
        });

        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await requestDeleteComment('randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('not existing comment should return OK', async () => {
            const response = await requestDeleteComment(
                '000000000000000000000000'
            );

            expect(response.status).toBe(StatusCodes.OK);
        });
    });

    describe('update comment by id', () => {
        const requestUpdateComment = (_id: string | MongooseTypes.ObjectId) =>
            request(app)
                .put(`/comments/${_id}`)
                .set({ authorization: 'JWT ' + authenticationToken });

        test('valid update should update the comment', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(
                expectedComment
            ).lean())!;
            const update = { content: 'updated content' };
            const response = await requestUpdateComment(_id).send(update);
            const updatedComment = await CommentModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(updatedComment).toBeDefined();
            expect(updatedComment).toStrictEqual(
                expect.objectContaining(update)
            );
        });

        test('id not in ObjectId format should return INTERNAL_SERVER_ERROR status', async () => {
            const response = await requestUpdateComment('randomId');

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        test('invalid update field should return INTERNAL_SERVER_ERROR status', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(
                expectedComment
            ).lean())!;
            const update = { content: { field: 'field' } };
            const response = await requestUpdateComment(_id).send(update);

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('create comment', () => {
        const requestUpdateComment = () =>
            request(app)
                .post('/comments')
                .set({ authorization: 'JWT ' + authenticationToken });

        test('valid new comment should create new comment', async () => {
            const newComment = {
                content: 'content',
                postId: 'new post'
            };
            const response = await requestUpdateComment().send(newComment);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining(newComment)
            );
        });

        test('missing comment field should return BAD_REQUEST', async () => {
            const newComment = {
                content: 'content',
                owner: 'new owner'
            };
            const response = await requestUpdateComment().send(newComment);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
