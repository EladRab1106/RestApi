import request from "supertest";
import { Express } from "express";
import initApp from "../server";
import mongoose from "mongoose";
import userModel, { Iuser } from "../models/userModel";
// import postModel from "../models/postModel";

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany(); // Clear the collection
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close(); // Close the connection
});

const baseUrl = "/auth";

type User = Iuser & { token?: string };

const testUser: User = {
  email: "test@user.com",
  password: "testPassword",
};

describe("Auth Tests", () => {
  test("Auth Test register", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/register")
      .send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth Test login", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.id).toBeDefined();
    testUser.token = response.body.token;
    testUser._id = response.body.id;
  });

  test("Auth Test login fail", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "wrongPassword",
    });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app).post("/auth/login").send({
      email: "wrongEmail",
      password: testUser.password,
    });
    expect(response2.statusCode).not.toBe(200);
    const response3 = await request(app).post("/auth/login").send({
      email: "wrongEmail",
      password: "wrongPassword",
    });
    expect(response3.statusCode).not.toBe(200);
  });

  test("create a post", async () => {
    const response = await request(app).post("/post").send({
      title: "first post",
      content: "this is the first post",
      owner: "elad",
    });
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app)
      .post("/post")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        title: "first post",
        content: "this is thee first post",
        owner: "elad",
      });
    expect(response2.statusCode).toBe(201);
  });
});
