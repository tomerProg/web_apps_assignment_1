import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import startDatabase, { Database } from '../database';
import CommentModel, { IComment } from '../models/comments_model';
import { createApp } from '../server';
import { allTestComments, firstOwnerComments, firstOwner, secondOwnerComments } from './test_comments'

describe('Comments Router', () => {
    let database: Database;
    const app = createApp();

    beforeAll(async () => {
        database = await startDatabase();
        await CommentModel.deleteMany();
    });
    afterAll(async () => {
        database.disconnect();
    });

    beforeEach(async () => {
        await CommentModel.insertMany(allTestComments)
    });
    afterEach(async () => {
        await CommentModel.deleteMany();
    });

    describe('get all comments', () => {
        test('get all comments should return all comments', async () => {
            const response = await request(app).get('/comments');

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                expect.arrayContaining(allTestComments.map((comment) => expect.objectContaining(comment)))
            );
        });

        test('get all comments with owner should return owner comments', async () => {
            const response = await request(app).get('/comments').query({ owner: firstOwner });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(firstOwnerComments.map((comment) => expect.objectContaining(comment)));
            secondOwnerComments.forEach((comment) => {
                expect(response.body).not.toContainEqual(expect.objectContaining(comment));
            });
        });

        test('not existing comment should return NOT_FOUND', async () => {
            const response = await request(app).get('/comments/000000000000000000000000');

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
        });
        
        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await request(app).get('/comments/randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('delete comment by id', () => {
        test('existing comment should return the comment and delete it', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(expectedComment).lean())!;
            const response = await request(app).delete(`/comments/${_id}`);
            const doc = await CommentModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(doc).toBeNull();
        });

        test('id not in ObjectId format should return BAD_REQUEST', async () => {
            const response = await request(app).delete('/comments/randomId');

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('not existing comment should return OK', async () => {
            const response = await request(app).delete('/comments/000000000000000000000000');

            expect(response.status).toBe(StatusCodes.OK);
        });
    });
    
    describe('update comment by id', () => {
        test('valid update should update the comment', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(expectedComment).lean())!;
            const update = { content: 'updated content' };
            const response = await request(app).put(`/comments/${_id}`).send(update);
            const updatedComment = await CommentModel.findById(_id);

            expect(response.status).toBe(StatusCodes.OK);
            expect(updatedComment).toBeDefined();
            expect(updatedComment).toStrictEqual(expect.objectContaining(update));
        });

        test('id not in ObjectId format should return INTERNAL_SERVER_ERROR status', async () => {
            const response = await request(app).put('/comments/randomId');

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });

        test('invalid update field should return INTERNAL_SERVER_ERROR status', async () => {
            const expectedComment = allTestComments[1];
            const { _id } = (await CommentModel.findOne(expectedComment).lean())!;
            const update = { content: { field: 'field' } };
            const response = await request(app).put(`/comments/${_id}`).send(update);

            expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });

    describe('create comment', () => {
        test('valid new comment should create new comment', async () => {
            const newComment: IComment = {
                content: 'content',
                owner: 'new owner',
                postId: 'new post'
            };
            const response = await request(app).post('/comments').send(newComment);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(expect.objectContaining(newComment));
        });

        test('missing comment field should return BAD_REQUEST', async () => {
            const newComment = {
                content: 'content',
                owner: 'new owner',
            };
            const response = await request(app).post('/comments').send(newComment);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
