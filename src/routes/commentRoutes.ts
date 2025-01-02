import express from "express";
const router = express.Router();
import commentController from "../controllers/comment";

router.get("/", commentController.getAllComments);

router.put("/:id", commentController.updateComment);

router.post("/", commentController.createComment);

router.delete("/:id", commentController.deleteComment);

router.get("/:id", commentController.getAllCommentsById);

export = router;
