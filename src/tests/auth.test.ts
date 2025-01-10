import request from "supertest";
import { Express } from "express";
import initApp from "../server";
import mongoose from "mongoose";
import userModel, { Iuser } from "../models/userModel";

let app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});

const baseUrl = "/auth";

type User = Iuser & { accessToken?: string };

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

  test("Auth Test login fail", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: testUser.email,
        password: "wrongPassword",
      });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/login")
      .send({
        email: "wrongEmail",
        password: testUser.password,
      });
    expect(response2.statusCode).not.toBe(200);
  });

  test("Auth Test login", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    const refreshToken = response.body.refreshToken;
    const id = response.body._id;
    expect(refreshToken).toBeDefined();
    expect(accessToken).toBeDefined();
    expect(id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = id;
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
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "first post",
        content: "this is thee first post",
        owner: "elad",
      });
    expect(response2.statusCode).toBe(201);
  });

  test("Test refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test("Double use refresh token", async () => {
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response.statusCode).toBe(200);
    const refreshTokenNew = response.body.refreshToken;

    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response2.statusCode).not.toBe(200);

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: refreshTokenNew,
      });
    expect(response3.statusCode).toBe(200);

    const response4 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: refreshTokenNew,
      });
    expect(response4.statusCode).not.toBe(200);
  });

  test("Test logout", async () => {
    const login = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(login.statusCode).toBe(200);
    const accessToken = login.body.accessToken;
    const refreshToken = login.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    const response = await request(app)
      .post(baseUrl + "/logout")
      .send({
        refreshToken: refreshToken,
      });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response2.statusCode).not.toBe(200);
  });

  jest.setTimeout(10000);
  test("Test token expiration", async () => {
    const response = await request(app)
      .post(baseUrl + "/login")
      .send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "Bearer " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
        owner: "sdfSd",
      });
    expect(response2.statusCode).not.toBe(201);

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;

    const response4 = await request(app)
      .post("/posts")
      .set("authorization", "Bearer " + testUser.accessToken) 
      .send({
        title: "Test Post",
        content: "Test Content",
        owner: "sdfSd",
      });
    expect(response4.statusCode).toBe(201);
  });
});
