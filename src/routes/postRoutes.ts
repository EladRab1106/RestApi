import express from "express";
import BaseController from "../controllers/post";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the post
 *           example: "64d65f2e0f1c4a2b8c79d73f"
 *         title:
 *           type: string
 *           description: The title of the post
 *           example: "My First Post"
 *         content:
 *           type: string
 *           description: The content of the post
 *           example: "This is the content of my first post."
 *         owner:
 *           type: string
 *           description: The owner of the post
 *           example: "john_doe"
 */

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
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
 *                 example: "My First Post"
 *               content:
 *                 type: string
 *                 description: The content of the post
 *                 example: "This is the content of my first post."
 *               owner:
 *                 type: string
 *                 description: The owner of the post
 *                 example: "john_doe"
 *     responses:
 *       201:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: The post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
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
 *                 example: "Updated Post Title"
 *               content:
 *                 type: string
 *                 description: The content of the post
 *                 example: "This is the updated content of the post."
 *               owner:
 *                 type: string
 *                 description: The owner of the post
 *                 example: "john_doe"
 *     responses:
 *       200:
 *         description: The updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: The deleted post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *     security:
 *       - bearerAuth: []
 */
router.get("/", BaseController.getAll);
router.post("/", authMiddleware, BaseController.createItem);
router.get("/:id", BaseController.getDataById);
router.put("/:id", authMiddleware, BaseController.updateItem);
router.delete("/:id", authMiddleware, BaseController.deleteItem);

export = router;
