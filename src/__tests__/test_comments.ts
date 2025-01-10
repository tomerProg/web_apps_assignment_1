import { IComment } from '../models/comments_model';

export const firstOwner = 'owner1';
export const secondOwner = 'owner2';
export const firstPostId = 'post1';
export const secondPostId = 'post2';

export const firstOwnerComments: IComment[] = [
    {
        owner: firstOwner,
        postId: firstPostId,
        content: 'comment 1'
    },
    {
        owner: firstOwner,
        postId: secondPostId,
        content: 'comment 2'
    },
];

export const secondOwnerComments: IComment[] = [
    {
        owner: secondOwner,
        postId: firstPostId,
        content: 'comment 1'
    },
    {
        owner: secondOwner,
        postId: secondPostId,
        content: 'comment 2'
    },
];

export const allTestComments = firstOwnerComments.concat(secondOwnerComments);
