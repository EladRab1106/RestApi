import request from "supertest";
import { Express } from "express";
import initApp, { closeConnection } from "../server";
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
  if (!app) {
    throw new Error("App initialization failed");
  }
  await commentModel.deleteMany();
});

afterAll(async () => {
  console.log("afterAll");
  closeConnection();
});

beforeEach(async () => {
  await Promise.all([commentModel.deleteMany({}), postsModel.deleteMany({})]);
});

describe("comments", () => {
  test("should get all comments", async () => {
    await commentModel.insertMany(comments); // Seed the comments
    const response = await request(app).get("/comment");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(comments.length); // Ensure the seeded data is returned
  });

  test("should not allow unauthenticated users to create comments", async () => {
    const newComment = {
      title: "Unauthorized comment",
      content: "This should fail",
      postId: new mongoose.Types.ObjectId().toString(),
      owner: "dan",
    };
    const response = await request(app).post("/comment").send(newComment);

    expect(response.statusCode).toBe(401); // Unauthenticated users should be rejected
  });

  test("should allow authenticated users to create comments", async () => {
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    const newComment = {
      title: "Valid comment",
      content: "This should succeed",
      postId: new mongoose.Types.ObjectId().toString(),
      owner: "dan",
    };
    const response = await request(app)
      .post("/comment")
      .set("Authorization", `Bearer ${token}`)
      .send(newComment);

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newComment.title);
  });

  test("should not allow unauthenticated users to update a comment by id", async () => {
    await commentModel.insertMany(comments);
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }

    const response = await request(app)
      .put(`/comment/${comment._id}`)
      .send({ title: "updated title" });

    expect(response.statusCode).toBe(401); // Unauthenticated users should be rejected
  });

  test("should allow authenticated users to update a comment by id", async () => {
    // Create and login a user
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    // Insert comments into the database
    await commentModel.insertMany(comments);
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }

    // Send update request with a valid token
    const response = await request(app)
      .put(`/comment/${comment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "updated title" });

    expect(response.statusCode).toBe(200); // Authenticated users should succeed
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

  test("should not allow unauthenticated users to delete a comment by id", async () => {
    await commentModel.insertMany(comments);
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }

    const response = await request(app).delete(`/comment/${comment._id}`);
    expect(response.statusCode).toBe(401); // Unauthenticated users should be rejected
  });

  test("should allow authenticated users to delete a comment by id", async () => {
    // Create and login a user
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    // Insert comments into the database
    await commentModel.insertMany(comments);
    const comment = await commentModel.findOne();
    if (!comment) {
      throw new Error("No comments found");
    }

    // Send delete request with a valid token
    const response = await request(app)
      .delete(`/comment/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200); // Authenticated users should succeed

    // Verify the comment was deleted
    const deletedComment = await commentModel.findById(comment._id);
    expect(deletedComment).toBeNull();
  });
});
