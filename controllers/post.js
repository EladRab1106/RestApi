const postModel = require('../models/postsModel');


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


module.exports = {getAllPosts, createPost};