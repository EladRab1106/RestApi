const postModel = require('../models/postModel');
const commentsModel = require('../models/commentModel');


const getAllPosts = async(req,res) => {
    const ownerFilter = req.query.owner;
    try {
        if (ownerFilter) {
            const posts = await postModel.find({owner: ownerFilter});
                
            res.status(200).send(posts);
            
        } else {
        const posts = await postModel.find();
        res.status(200).send(posts);
        }
    } catch (error) {
        res.status(400).send(error.message);    
    }
}

const createPost = async (req,res) => {
    const post = req.body;
    try {
        const newPost = await postModel.create(post);
        res.status(200).send(newPost);
    } catch (error) {
        res.status(400).send(error);
    }
}

const getPostById = async (req,res) => {
    
    const postId = req.params.id;
    try {
        const post = await postModel.findById(postId);
        if (!post) {
            console.log('Post not found');
            
            return res.status(404).send('Post not found');
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updatePost = async (req,res) => {
    const postId = req.params.id;
    try {
        const post = await postModel.findByIdAndUpdate(postId, req.body, {new: true});
        if (!post) {
            return res.status(404).send('Post not found');
        };
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deletePost = async(req,res) => {
    const postId = req.params.id;
    try {
        if (postId) {
            await commentsModel.deleteMany({postId: postId});   
        }
        const post = await postModel.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {getAllPosts, createPost, getPostById, updatePost, deletePost};