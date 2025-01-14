import request from "supertest";
import { Express } from "express";
import initApp from "../server";
import mongoose from "mongoose";
import postModel, { IPost } from "../models/postModel";
import commentModel from "../models/commentModel";
import userModel, { Iuser } from "../models/userModel";

const posts: IPost[] = [
  { title: "first post", content: "this is the first post", owner: "elad" },
  { title: "second post", content: "this is the second post", owner: "roie" },
  { title: "third post", content: "this is the third post", owner: "eliav" },
];

type User = Iuser & { accessToken?: string };

const testUser: User = {
  email: "test@user.com",
  password: "testPassword",
};

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await commentModel.deleteMany();
  await userModel.deleteMany();
  await postModel.insertMany(posts);
  const registerResponse = await request(app)
    .post("/auth/register")
    .send(testUser);
  testUser.accessToken = registerResponse.body.accessToken;
  testUser._id = registerResponse.body._id;
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close(); // Close the connection
});

describe("posts", () => {
  test("should get all posts", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(posts.length);
  });

  test("should not allow unauthenticated users to create a new post", async () => {
    const newPost = {
      title: "fourth post",
      content: "this is the fourth post",
      owner: "dan",
    };
    const response = await request(app).post("/post").send(newPost);

    expect(response.statusCode).toBe(401);
  });

  test("should allow authenticated users to create a new post", async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();

    const accessToken = loginResponse.body.accessToken;

    const postResponse = await request(app)
      .post("/posts")
      .set("authorization", "Bearer " + accessToken) 
      .send({
        title: "Test Post",
        content: "This is a test post",
        owner: "testUserId", 
      });

    // Validate the post creation
    expect(postResponse.statusCode).toBe(201);
    expect(postResponse.body).toHaveProperty("title", "Test Post");
    expect(postResponse.body).toHaveProperty("content", "This is a test post");
    expect(postResponse.body).toHaveProperty("owner", "testUserId"); // Adjust based on your app
  });

  test("should get a post by id", async () => {
    const post = await postModel.findOne({ title: "first post" }); // Find one post from the database
    if (!post) {
      throw new Error("Post not found");
    }
    const response = await request(app).get(`/post/${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(post.title);
    expect(response.body.content).toBe(post.content);
    expect(response.body.owner).toBe(post.owner);
  });

  test("should not allow unauthenticated users to update a post by id", async () => {
    const post = await postModel.findOne({ title: "second post" });
    if (!post) {
      throw new Error("Post not found");
    }

    const response = await request(app)
      .put(`/post/${post._id}`)
      .send({ title: "updated title" });

    expect(response.statusCode).toBe(401); // Unauthenticated users should be rejected
  });

  test("should allow authenticated users to update a post by id", async () => {
    // Create and login a user
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    const post = await postModel.findOne({ title: "second post" });
    if (!post) {
      throw new Error("Post not found");
    }

    const response = await request(app)
      .put(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "updated title" });

    expect(response.statusCode).toBe(200); // Authenticated users should succeed
    expect(response.body.title).toBe("updated title");
  });

  test("should not allow unauthenticated users to delete a post by id", async () => {
    const post = await postModel.findOne({ title: "third post" });
    if (!post) {
      throw new Error("Post not found");
    }

    const response = await request(app).delete(`/post/${post._id}`);
    expect(response.statusCode).toBe(401); // Unauthenticated users should be rejected
  });

  test("should allow authenticated users to delete a post by id", async () => {
    // Create and login a user
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    const post = await postModel.findOne({ title: "third post" });
    if (!post) {
      throw new Error("Post not found");
    }

    const response = await request(app)
      .delete(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200); // Authenticated users should succeed

    // Verify the post was deleted
    const deletedPost = await postModel.findById(post._id);
    expect(deletedPost).toBeNull();
  });

  test("should delete a post and its associated comments", async () => {
    const user = { email: "test@test.com", password: "password" };
    await request(app).post("/auth/register").send(user);
    const loginResponse = await request(app).post("/auth/login").send(user);
    const token = loginResponse.body.token;

    const post = await postModel.create({
      title: "Test Post",
      content: "Test Content",
      owner: user.email,
    });

    await commentModel.create({
      title: "Comment 1",
      content: "First comment",
      postId: post._id,
      owner: "user1",
    });
    await commentModel.create({
      title: "Comment 2",
      content: "Second comment",
      postId: post._id,
      owner: "user2",
    });

    const deleteResponse = await request(app)
      .delete(`/post/${post._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    const deletedPost = await postModel.findById(post._id);
    expect(deletedPost).toBeNull();

    const remainingComments = await commentModel.find({ postId: post._id });
    expect(remainingComments.length).toBe(0);
  });

  test("should get all posts by owner", async () => {
    const response = await request(app).get("/post?owner=elad");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1); // Only one post with owner "elad"
    expect(response.body[0].owner).toBe("elad");
  });
});
