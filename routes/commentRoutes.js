const express = require('express');
const router= express.Router();
const commentController = require('../controllers/comment');
// Get all comments
router.get('/', commentController.getAllComments);

//get a comment by ID
// router.get('/:id', commentController.getCommentById);


// Update a comment by ID
router.put('/:id', commentController.updateComment);

// Create a new comment
router.post('/', commentController.createComment);

// Delete a comment by ID
router.delete('/:id', commentController.deleteComment);

router.get('/:id', commentController.getAllCommentsById);

module.exports = router;

