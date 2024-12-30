import Comments from "../models/commentModel";
import { Request, Response } from "express";

const getAllComments = async (req: Request, res: Response) => {
  try {
    // Attempt to retrieve all comments from the database
    const comments = await Comments.find();

    // Send the comments as the response
    res.status(200).send(comments);
  } catch (error) {
    // Handle errors and send an error response
    console.error("Error fetching comments:", error.message);
    res
      .status(500)
      .send({ error: "An error occurred while retrieving comments." });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comments.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!comment) {
      return res
        .status(404)
        .send("The comment with the given ID was not found.");
    }
    res.send(comment);
  } catch (error) {
    res.status(500).send("An error occurred while updating the comment.");
    console.error(error);
  }
};

const createComment = async (req: Request, res: Response) => {
  try {
    const comment = new Comments(req.body); // Create a new comment using the request body
    await comment.save(); // Save the comment to the database
    res.status(201).send(comment); // Send the saved comment with a 201 status (Created)
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send({ error: "Failed to create the comment." }); // Send a 500 status with an error message
  }
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

    res
      .status(200)
      .json({
        message: "comment deleted successfully",
        comment: deletedComment,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
