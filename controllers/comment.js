const Comments = require('../models/commentModel');

const getAllComments = async (req, res) => {
    try {
        // Attempt to retrieve all comments from the database
        const comments = await Comments.find();
        
        // Send the comments as the response
        res.status(200).send(comments);
    } catch (error) {
        // Handle errors and send an error response
        console.error("Error fetching comments:", error.message);
        res.status(500).send({ error: "An error occurred while retrieving comments." });
    }
};
const updateComment = async (req, res) => {
    try {
        const comment = await Comments.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            return res.status(404).send('The comment with the given ID was not found.');
        }
        res.send(comment);
    } catch (error) {
        res.status(500).send('An error occurred while updating the comment.');
        console.error(error);
    }
};
