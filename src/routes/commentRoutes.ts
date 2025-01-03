import express from "express";
const router = express.Router();
import commentController from "../controllers/comment";
import { authMiddleware } from "../controllers/auth_controller";
router.get("/",authMiddleware, commentController.getAllComments);

router.put("/:id",authMiddleware, commentController.updateComment);

router.post("/",authMiddleware, commentController.createComment);

router.delete("/:id",authMiddleware, commentController.deleteComment);

router.get("/:id",authMiddleware, commentController.getAllCommentsById);

export = router;
