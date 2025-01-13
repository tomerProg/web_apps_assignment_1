import { Router } from 'express';
import { authMiddleware } from '../controllers/auth_controller';
import postController from '../controllers/posts_controller';

const router = Router();
/**
* @swagger
* tags:
*   name: Posts
*   description: The Posts API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         owner:
 *           type: string
 *           description: The owner id of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *       example:
 *         _id: 6744ca14e07639a1261b32db
 *         title: My first Post
 *         owner: fb08fc404da19e1eec22168715de8c9c
 *         content: amazing post content
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts
 *     description: Retrieve a list of all posts or all owner posts
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: owner
 *         in: query
 *         description: owner filter for posts (optional)
 *         required: false
 *         schema:
 *           type: string
 *           example: fb08fc404da19e1eec22168715de8c9c
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.get('/', postController.getAll.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single psot by its ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', postController.getById.bind(postController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *                 example: My great post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *                 example: My great post content
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, postController.create.bind(postController));

/**
 * @swagger
 * /posts/{id}: 
 *   put:
 *     summary: Update an existing post
 *     description: Update an existing post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *                 description: The owner of the post
 *               title:
 *                 type: string
 *                 description: The title of the post
 *                 example: Change the title
 *               content:
 *                 type: string
 *                 description: I love Coolman
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, postController.update.bind(postController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: Delete a single post by its ID
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    authMiddleware,
    postController.deleteItem.bind(postController)
);

export default router;
