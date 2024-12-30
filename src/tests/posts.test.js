import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import postModel, { PostDocument } from '../models/postModel';

// Mock posts data
const posts = [
  {
    title: 'first post',
    content: 'this is the first post',
    owner: 'elad',
  },
  {
    title: 'second post',
    content: 'this is the second post',
    owner: 'roie',
  },
];

// Setup and teardown
beforeAll(async () => {
  console.log('beforeAll');
  await postModel.deleteMany();
});

afterAll(async () => {
  console.log('afterAll');
  await mongoose.connection.close();
});

// Tests
describe('Posts API', () => {
  test('should get all posts', async () => {
    const response = await request(app).get('/post');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test('should create a new post', async () => {
    const response = await request(app).post('/post').send(posts[0]);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(posts[0].title);
    expect(response.body.content).toBe(posts[0].content);
    expect(response.body.owner).toBe(posts[0].owner);
  });

  test('should get a post by id', async () => {
    const post = await postModel.create(posts[1] as PostDocument);
    const response = await request(app).get(`/post/${post._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(posts[1].title);
    expect(response.body.content).toBe(posts[1].content);
    expect(response.body.owner).toBe(posts[1].owner);
  });

  test('should update a post by id', async () => {
    const post = await postModel.create(posts[1] as PostDocument);
    const response = await request(app)
      .put(`/post/${post._id}`)
      .send({ title: 'updated title' });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('updated title');
  });

  test('should delete a post by id', async () => {
    const post = await postModel.create(posts[1] as PostDocument);
    const response = await request(app).delete(`/post/${post._id}`);
    expect(response.statusCode).toBe(200);
  });

  test('should get all posts by owner', async () => {
    await postModel.create(posts); // Ensure posts are created
    const response = await request(app).get('/post?owner=elad');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].owner).toBe('elad');
  });
});
