import { Request, Response } from "express";

class BaseController {
    model:any;
    constructor(model:any){
        this.model = model;
    }

async getAll (req: Request, res: Response){
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
}

async createItem (req: Request, res: Response){
  const data = req.body;
  try {
    const newItem = await this.model.create(data);
    res.status(201).send(newItem);
  } catch (error) {
    res.status(400).send(error);
  }
}

async getDataById (req: Request, res: Response) {
  const dataId = req.params.id;
  try {
    const data = await this.model.findById(dataId);
    if (!data) {
      console.log("data not found");

      return res.status(404).send("data not found");
    }
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send(error);
  }
}

async updateItem (req: Request, res: Response) {
  const itemId = req.params.id;
  try {
    const item = await this.model.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });
    res.status(200).send(item);
  } catch (error) {
    res.status(400).send(error);
  }
}
}



export = BaseController;
