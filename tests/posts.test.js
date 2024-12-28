const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const postModel = require('../models/postModel');

posts=[{
    title: 'first post',
    content: 'this is the first post',
    owner: 'elad'
},{
    title: 'second post',
    content: 'this is the second post',
    owner: 'roie'
}]

beforeAll(async () => {
    console.log('beforeAll')
    await postModel.deleteMany();
})

afterAll(() => {
    console.log('afterAll')
    mongoose.connection.close();
})

describe('posts', () => {
    test('should get all posts',async () => {
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

    
    })

    test('should get a post by id', async () => {
        const post = await postModel.create(posts[1]);
        const response = await request(app).get(`/post/${post._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(posts[1].title);
        expect(response.body.content).toBe(posts[1].content);
        expect(response.body.owner).toBe(posts[1].owner);
    })

    test('should update a post by id', async () => {
        const post = await postModel.create(posts[1]);
        const response = await request(app).put(`/post/${post._id}`).send({title: 'updated title'});
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('updated title');
    })

    test('should delete a post by id', async () => {
        const post = await postModel.create(posts[1]);
        const response = await request(app).delete(`/post/${post._id}`);
        expect(response.statusCode).toBe(200);
    })

    test('should get all posts by owner', async () => {
        const response = await request(app).get('/post?owner=elad');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    })


})

    