const express = require('express');
const router = express.Router();
const Post = require('../controllers/post');

router.get('/', Post.getAllPosts);