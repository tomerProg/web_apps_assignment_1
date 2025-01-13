import {Router} from 'express';
import CommentController from '../controllers/comments_controller';
import { authMiddleware } from '../controllers/auth_controller';

const router = Router();
/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - owner
 *         - postId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         owner:
 *           type: string
 *           description: The owner id of the comment
 *         postId:
 *           type: string
 *           description: The post id of the comment
 *         content:
 *           type: string
 *           description: The content of the comment
 *       example:
 *         _id: 6744ca14e07639a1261b32db
 *         owner: fb08fc404da19e1eec22168715de8c9c
 *         postId: ae33a5c0b0301b0f2c7ff57660a4db85
 *         content: First content 
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     description: Retrieve a list of all comments
 *     tags:
 *       - Comments
 *     parameters:
 *       - name: owner
 *         in: query
 *         description: owner filter for comments (optional)
 *         required: false
 *         schema:
 *           type: string
 *           example: fb08fc404da19e1eec22168715de8c9c
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Server error
 */
router.get('/', CommentController.getAll.bind(CommentController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     description: Retrieve a single comment by its ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', CommentController.getById.bind(CommentController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The post id of the comment
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *             required:
 *               - postId
 *               - content
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, CommentController.create.bind(CommentController));


/**
 * @swagger
 * /comments/{id}: 
 *   put:
 *     summary: Update an existing comment
 *     description: Update an existing comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *                 description: The owner of the comment
 *               postId:
 *                 type: string
 *                 description: The post id of the comment
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, CommentController.update.bind(CommentController));


/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     description: Delete a single comment by its ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, CommentController.deleteItem.bind(CommentController));

export default router;
