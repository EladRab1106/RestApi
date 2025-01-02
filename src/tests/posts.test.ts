import request from "supertest";
import { Express } from "express";
import initApp from "../server";  
import mongoose from "mongoose";
import postModel, {IPost} from "../models/postModel";

const posts:IPost[] = [
  { title: "first post", content: "this is the first post", owner: "elad" },
  { title: "second post", content: "this is the second post", owner: "roie" },
  { title: "third post", content: "this is the third post", owner: "eliav" },
];

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany(); // Clear the collection
  await postModel.insertMany(posts); // Seed the database with test data
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close(); // Close the connection
});

describe("posts", () => {
  test("should get all posts", async () => {
    const response = await request(app).get("/post");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(posts.length); // Should match the number of seeded posts
  });

  test("should create a new post", async () => {
    const newPost = {
      title: "fourth post",
      content: "this is the fourth post",
      owner: "dan",
    };
    const response = await request(app).post("/post").send(newPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newPost.title);
    expect(response.body.content).toBe(newPost.content);
    expect(response.body.owner).toBe(newPost.owner);
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

  test("should update a post by id", async () => {
    const post = await postModel.findOne({ title: "second post" });
    if (!post) {
      throw new Error("Post not found");
    }
    const response = await request(app)
      .put(`/post/${post._id}`)
      .send({ title: "updated title" });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("updated title");
  });

  test("should delete a post by id", async () => {
    const post = await postModel.findOne({ title: "third post" });
    if (!post) {
      throw new Error("Post not found");
    }
    const response = await request(app).delete(`/post/${post._id}`);
    expect(response.statusCode).toBe(200);
    const deletedPost = await postModel.findById(post._id); // Verify it's deleted
    expect(deletedPost).toBeNull();
  });

  test("should get all posts by owner", async () => {
    const response = await request(app).get("/post?owner=elad");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1); // Only one post with owner "elad"
    expect(response.body[0].owner).toBe("elad");
  });
});
