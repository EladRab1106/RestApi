import { Request, Response } from "express";
import postModel from "../models/postModel";
import commentsModel from "../models/commentModel";

const getAllPosts = async (req: Request, res: Response) => {
  const ownerFilter = req.query.owner;
  try {
    if (ownerFilter) {
      const posts = await postModel.find({ owner: ownerFilter });

      res.status(200).send(posts);
    } else {
      const posts = await postModel.find();
      res.status(200).send(posts);
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

const createPost = async (req: Request, res: Response) => {
  const post = req.body;
  try {
    const newPost = await postModel.create(post);
    res.status(201).send(newPost);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      console.log("Post not found");

      return res.status(404).send("Post not found");
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    const post = await postModel.findByIdAndUpdate(postId, req.body, {
      new: true,
    });
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id;
  try {
    if (postId) {
      await commentsModel.deleteMany({ postId: postId });
    }
    const post = await postModel.findByIdAndDelete(postId);
    res.status(200).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

export = { getAllPosts, createPost, getPostById, updatePost, deletePost };
