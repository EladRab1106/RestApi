import express from "express";
import BaseController from "../controllers/comment";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the comment
 *           example: "64d65f2e0f1c4a2b8c79d73f"
 *         title:
 *           type: string
 *           description: The title of the comment
 *           example: "My First Comment"
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: "This is the content of my first comment."
 *         owner:
 *           type: string
 *           description: The owner of the comment
 *           example: "john_doe"
 *         postId:
 *           type: string
 *           description: The post ID the comment belongs to
 *           example: "64d65f2e0f1c4a2b8c79d73f"
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Get all comments
 *     tags:
 *       - Comments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Create a new comment
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
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the related post
 *                 example: "64d65f2e0f1c4a2b8c79d73f"
 *               title:
 *                 type: string
 *                 description: The title of the comment
 *                 example: "My Comment Title"
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *                 example: "This is a comment"
 *               owner:
 *                 type: string
 *                 description: The author of the comment
 *                 example: "john_doe"
 *     responses:
 *       201:
 *         description: The created comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comment/{postId}:
 *   get:
 *     summary: Get all comments for a specific post
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: A list of comments for the specified post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the comment
 *                 example: "Updated Comment Title"
 *               content:
 *                 type: string
 *                 description: The updated content of the comment
 *                 example: "This is the updated comment"
 *     responses:
 *       200:
 *         description: The updated comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: The deleted comment
 *       404:
 *         description: Comment not found
 *       401:
 *         description: Unauthorized
 */



router.get("/", BaseController.getAll);
router.post("/",authMiddleware, BaseController.createItem);
router.get("/:id", BaseController.getDataById);
router.put("/:id",authMiddleware, BaseController.updateItem);
router.delete("/:id",authMiddleware, BaseController.deleteItem);

export default router;
