import { Request, Response } from "express";
import postModel from "../models/postModel";
import commentsModel from "../models/commentModel";
import base_controller from "./base_controller";

const BaseController = new base_controller(postModel);

const getAllPosts =  (req: Request, res: Response) => {
  return BaseController.getAll(req, res);
  
};

const createPost =  (req: Request, res: Response) => {
  return BaseController.createItem(req, res);
};

const getPostById =  (req: Request, res: Response) => {
  return BaseController.getDataById(req, res);
};

const updatePost =  (req: Request, res: Response) => {
  return BaseController.updateItem(req, res);
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
