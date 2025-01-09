import { IPost } from '../models/posts_model';

export const firstOwner = 'owner1';
export const firstOwnerPosts: IPost[] = [
    {
        title: 'test post 1',
        content: 'content 1',
        owner: firstOwner
    },
    {
        title: 'test post 2',
        content: 'content 2',
        owner: firstOwner
    }
];

export const secondOwner = 'owner2';
export const secondOwnerPosts: IPost[] = [
    {
        title: 'test post 3',
        content: 'content 3',
        owner: secondOwner
    },
    {
        title: 'test post 4',
        content: 'content 4',
        owner: secondOwner
    }
];

export const allTestPosts = firstOwnerPosts.concat(secondOwnerPosts);
