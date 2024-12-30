import express, { Request, Response } from "express";
const router = express.Router();
import PostController from "../controllers/post";
import exp from "constants";

router.get("/", (req: Request, res: Response) => {
  PostController.getAllPosts(req, res);
});

router.post("/", (req: Request, res: Response) => {
  PostController.createPost(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  PostController.getPostById(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  PostController.updatePost(req, res);
});
router.delete("/:id", (req: Request, res: Response) => {
  PostController.deletePost(req, res);
});

export = router;
