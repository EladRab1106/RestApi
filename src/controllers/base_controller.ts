import { Request, Response } from "express";
import { Model } from "mongoose";
import commentsModel from "../models/commentModel";
import PostModel from "../models/postModel";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  getAll = async (req: Request, res: Response) => {
    const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const data = await this.model.find({ owner: ownerFilter });

        res.status(200).send(data);
      } else {
        const data = await this.model.find();
        res.status(200).send(data);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  };

  createItem = async (req: Request, res: Response) => {
    const data = req.body;
    try {
      const newItem = await this.model.create(data);
      res.status(201).send(newItem);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  getDataById = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
      if(this.model.modelName==="Comment"){
        const post=await PostModel.findById(id);
        if(post==null){
          res.status(404).send("not found");
          return
        }
        const comments=await this.model.find({postId:id});
        res.status(200).send(comments);

      }
      const item = await this.model.findById(id);
      if (item != null) {
        res.status(200).send(item);
      } else {
        res.status(404).send("not found");
      }
    } catch (error) {
      res.status(400);
    }
  };

  updateItem = async (req: Request, res: Response) => {
    const itemId = req.params.id;
    try {
      const item = await this.model.findByIdAndUpdate(itemId, req.body, {
        new: true,
      });
      res.status(200).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  deleteItem = async (req: Request, res: Response) => {
    const itemId = req.params.id;
    try {
      const item = await this.model.findByIdAndDelete(itemId);

      if (!item) {
        return res.status(404).send({ message: "Item not found" });
      }

      if (this.model.modelName === "Post") {
        await commentsModel.deleteMany({ postId: itemId });
      }

      res.status(200).send(item);
    } catch (error) {
      res.status(400).send(error);
    }
  };
}

export = BaseController;
