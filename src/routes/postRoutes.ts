import express from "express";
const router = express.Router();
import Post from "../controllers/post";

router.get("/", Post.getAllPosts);

router.post("/", Post.createPost);

router.get("/:id", Post.getPostById);

router.put("/:id", Post.updatePost);

router.delete("/:id", Post.deletePost);

export = router;
