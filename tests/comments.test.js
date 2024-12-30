const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const commentModel = require('../models/commentModel');
const postsModel = require('../models/postModel');
comments=[{
    title: 'first post',
    content: 'this is the first post',
    postId: '1',
    owner: 'elad'
},{
    title: 'second post',
    content: 'this is the second post',
    postId: '2',
    owner: 'roie'
}]

beforeAll(async () => {
    console.log('beforeAll')
    await commentModel.deleteMany();
})

afterAll(() => {
    console.log('afterAll')
    mongoose.connection.close();
})

describe('comments', () => {
    test('should get all comments',async () => {
        const response = await request(app).get('/comment');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
    
    test('should create a new post', async () => {
        const post = await postsModel.create({title: 'first post', content: 'this is the first post', owner: 'elad'});
        const response = await request(app).post('/comment').send({title: 'first comment', content: 'this is the first comment', postId: post._id, owner: 'elad'});
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('first comment');
        expect(response.body.content).toBe('this is the first comment');
        expect(response.body.owner).toBe('elad');
        expect(response.body.postId).toBe(post._id.toString());

    
    })

    test('should update a comment by id', async () => {

        const post = await postsModel.create({title: 'first post', content: 'this is the first post', owner: 'elad'});
        const comment = await commentModel.create({title: 'first comment', content: 'this is the first comment', postId: post._id, owner: 'elad'});
        const response = await request(app).put(`/comment/${comment._id}`).send({title: 'updated title'});
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('updated title');
    });

    test('should find a comment by post id', async () => {
        const post = await postsModel.create({title: 'first post', content: 'this is the first post', owner: 'elad'});
        const comment = await commentModel.create({title: 'first comment', content: 'this is the first comment', postId: post._id, owner: 'elad'});
        const response = await request(app).get(`/comment/${post._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body[0].title).toBe('first comment');
        expect(response.body[0].content).toBe('this is the first comment');
        expect(response.body[0].owner).toBe('elad');
        expect(response.body[0].postId).toBe(post._id.toString());
    });

    test('should delete a comment by id', async () => {
        const post = await postsModel.create({title: 'first post', content: 'this is the first post', owner: 'elad'});
        const comment = await commentModel.create({title: 'first comment', content: 'this is the first comment', postId: post._id, owner: 'elad'});
        const response = await request(app).delete(`/comment/${comment._id}`);
        expect(response.statusCode).toBe(200);
    });

})

    