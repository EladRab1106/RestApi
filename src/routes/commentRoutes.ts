import express, { Request, Response } from "express";
const router = express.Router();
import commentController from "../controllers/comment";
import exp from "constants";
// Get all comments
router.get("/", (req: Request, res: Response) => {
  commentController.getAllComments(req, res);
});
// Update a comment by ID
router.put("/:id", (req: Request, res: Response) => {
  commentController.updateComment(req, res);
});

// Create a new comment
router.post("/", (req: Request, res: Response) => {
  commentController.createComment(req, res);
});

// Delete a comment by ID
router.delete("/:id", (req: Request, res: Response) => {
  commentController.deleteComment(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  commentController.getAllCommentsById(req, res);
});

export = router;
