import express from "express";
const router = express.Router();
import Post from "../controllers/post";
import { authMiddleware } from "../controllers/auth_controller";

router.get("/",authMiddleware, Post.getAllPosts);

router.post("/",authMiddleware, Post.createPost);

router.get("/:id",authMiddleware, Post.getPostById);

router.put("/:id",authMiddleware, Post.updatePost);

router.delete("/:id",authMiddleware, Post.deletePost);

export = router;
