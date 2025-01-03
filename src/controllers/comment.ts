import { Request, Response } from "express";
import Comments from "../models/commentModel";
import base_controller from "./base_controller";

const BaseController = new base_controller(Comments);

const getAllComments =  (req: Request, res: Response) => {
  return BaseController.getAll(req, res);
};

const updateComment =  (req: Request, res: Response) => {
  return BaseController.updateItem(req, res);
};

const createComment =  (req: Request, res: Response) => {
  return BaseController.createItem(req, res);
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;

    // Validate MongoDB ObjectId
    if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid comment ID format" });
    }

    const deletedComment = await Comments.findByIdAndDelete(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "comment not found" });
    }

    res.status(200).json({
      message: "comment deleted successfully",
      comment: deletedComment,
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const getAllCommentsById = async (req: Request, res: Response) => {
  try {
    const comments = await Comments.find({ postId: req.params.id });
    if (!comments || comments.length === 0) {
      return res.status(404).send("No comments found for the given post ID.");
    }
    res.send(comments);
  } catch (error) {
    res.status(500).send("An error occurred while retrieving the comments.");
    console.error(error);
  }
};

export = {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
  getAllCommentsById,
};
