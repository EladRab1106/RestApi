const express = require('express');
const router= express.Router();
const commentController = require('../controllers/comment');
// Get all comments
router.get('/', commentController.getAllComments);


// Update a comment by ID
router.put('/:id', commentController.updateComment);

// Create a new comment
router.post('/', commentController.createComment);

