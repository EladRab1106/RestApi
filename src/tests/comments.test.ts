import request from "supertest";
import { Express } from "express";
import initApp from "../server";
import mongoose from "mongoose";
import commentModel, { IComment } from "../models/commentModel";
import postsModel from "../models/postModel";

const comments: IComment[] = [
  {
    title: "first comment",
    content: "this is the first comment",
    postId: "1",
    owner: "elad",
  },
  {
    title: "second comment",
    content: "this is the second comment",
    postId: "1",
    owner: "roie",
  },
  {
    title: "third comment",
    content: "this is the third comment",
    postId: "2",
    owner: "eliav",
  },
];

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await commentModel.deleteMany();
  await commentModel.insertMany(comments); // Seed the comments
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});

describe("comments", () => {
  test("should get all comments", async () => {
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(comments.length); // Ensure the seeded data is returned
  });

  test("should create new comments", async () => {
    const newComment = {
      title: "fourth comment",
      content: "this is the fourth comment",
      postId: new mongoose.Types.ObjectId().toString(),
      owner: "dan",
    };
    const response = await request(app).post("/comment").send(newComment);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newComment.title);
    expect(response.body.content).toBe(newComment.content);
    expect(response.body.owner).toBe(newComment.owner);
    expect(response.body.postId).toBe(newComment.postId);
  });

  test("should update a comment by id", async () => {
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }
    const response = await request(app)
      .put(`/comment/${comment._id}`)
      .send({ title: "updated title" });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("updated title");
  });

  test("should find a comment by post id", async () => {
    const post = await postsModel.create({
      title: "first post",
      content: "this is the first post",
      owner: "elad",
    });
    const comment = await commentModel.create({
      title: "first comment",
      content: "this is the first comment",
      postId: post._id,
      owner: "roie",
    });
    const response = await request(app).get(`/comment/${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body[0].title).toBe(comment.title);
    expect(response.body[0].content).toBe(comment.content);
    expect(response.body[0].owner).toBe(comment.owner);
    expect(response.body[0].postId).toBe(post._id.toString());
  });

  test("should delete a comment by id", async () => {
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }
    const response = await request(app).delete(`/comment/${comment._id}`);
    expect(response.statusCode).toBe(200);
    const deletedComment = await commentModel.findById(comment._id);
    expect(deletedComment).toBeNull();
  });
});
