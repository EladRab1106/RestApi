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
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }
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

  test("Auth test register fail (duplicate email)", async () => {
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

  test("Create a post without auth", async () => {
    const response = await request(app).post("/post").send({
      title: "first post",
      content: "this is the first post",
      owner: "elad",
    });
    expect(response.statusCode).not.toBe(201); // Unauthorized

    const response2 = await request(app)
      .post("/post")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "first post",
        content: "this is the first post",
        owner: "elad",
      });
    expect(response2.statusCode).toBe(201); // Created
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
    expect(response2.statusCode).not.toBe(200); // Old refresh token should be invalid after use

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: refreshTokenNew,
      });
    expect(response3.statusCode).toBe(200); // New refresh token

    const response4 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: refreshTokenNew,
      });
    expect(response4.statusCode).not.toBe(200); // New refresh token should also expire
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
    expect(response2.statusCode).not.toBe(200); // Should fail after logout
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
      .post("/post")
      .set({ authorization: "Bearer " + testUser.accessToken })
      .send({
        title: "Test Post",
        content: "Test Content",
        owner: "sdfSd",
      });
    expect(response2.statusCode).not.toBe(201); // Should fail due to token expiration

    const response3 = await request(app)
      .post(baseUrl + "/refresh")
      .send({
        refreshToken: testUser.refreshToken,
      });
    expect(response3.statusCode).toBe(200); // Refresh token should work
    testUser.accessToken = response3.body.accessToken;
    console.log("New access token after refresh:", testUser.accessToken);


    const response4 = await request(app)
      .post("/post")
      .set("authorization", "Bearer " + testUser.accessToken)
      .send({
        title: "Test Post",
        content: "Test Content",
        owner: "sdfSd",
      });
    expect(response4.statusCode).toBe(201); // Should succeed with new access token
  });

  test("Register with missing fields", async () => {
    const response = await request(app).post(baseUrl + "/register").send({
      email: "missing@fields.com",
    }); // No password
    expect(response.statusCode).toBe(400);
  });
  
  test("Login with missing fields", async () => {
    const response = await request(app).post(baseUrl + "/login").send({
      email: testUser.email,
    }); // No password
    expect(response.statusCode).toBe(400);
  });
  
  test("Use invalid access token", async () => {
    const response = await request(app)
      .post("/post")
      .set({ authorization: "Bearer invalidToken" })
      .send({
        title: "Invalid Access",
        content: "This should not work",
        owner: "testOwner",
      });
    expect(response.statusCode).toBe(401); // Unauthorized
  });
  
  test("Login with tampered refresh token", async () => {
    const tamperedToken = testUser.refreshToken + "tamper";
    const response = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: tamperedToken });
    expect(response.statusCode).not.toBe(200); // Should fail
  });
  
  test("Missing JWT_SECRET environment variable", async () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
  
    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(500);
  
    const response2 = await request(app)
      .post(baseUrl + "/refresh")
      .send({ refreshToken: testUser.refreshToken });
    expect(response2.statusCode).toBe(500);
  
    // Restore JWT_SECRET for subsequent tests
    process.env.JWT_SECRET = originalSecret;
  });
  
});
