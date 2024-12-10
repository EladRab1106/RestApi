const CommentModel = require('../models/commentModel');
const PostModel=require('../models/postModel')

// const getAllComments = async (req, res) => {
//     try {
//         // Attempt to retrieve all comments from the database
//         const comments = await Comments.find();
        
//         // Send the comments as the response
//         res.status(200).send(comments);
//     } catch (error) {
//         // Handle errors and send an error response
//         console.error("Error fetching comments:", error.message);
//         res.status(500).send({ error: "An error occurred while retrieving comments." });
//     }
// };
const getAllComments = async(req,res) => {
    const ownerFilter = req.query.owner;
    try {
        if (ownerFilter) {
            const comments = await CommentModel.find({owner: ownerFilter});
            if (!comments || comments.length === 0) {
                return res.status(404).send('No comments found for the given owner.');
            }
                
            res.status(200).send(comments);
            
        } else {
        const comments = await CommentModel.find();
        if (!comments || comments.length === 0) {
            return res.status(404).send('No comments found.');
        }
        res.status(200).send(comments);
        }
    } catch (error) {
        res.status(400).send(error.message);    
    }
}

const updateComment = async (req, res) => {
    try {
        const post=await PostModel.findById(req.body.postId);
        if (!post) {
            return res.status(404).send('The post with the given ID was not found.');
        }
        const comment = await CommentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) {
            return res.status(404).send('The comment with the given ID was not found.');
        }
        res.status(200).send(comment);
    } catch (error) {
        res.status(500).send('An error occurred while updating the comment.');
        console.error(error);
    }
};

// const getCommentById = async (req, res) => {

//     try {
//         const comment = await CommentModel.findById(req.params.id);
//         if (!comment) {
//             return res.status(404).send('The comment with the given ID was not found.');
//         }
//         res.status(200).send(comment);
//     } catch (error) {
//         res.status(500).send('An error occurred while retrieving the comment.');
//         console.error(error);
//     }


// }


const createComment = async (req, res) => {
    try {
        const comment = new CommentModel(req.body); 
        await comment.save(); 
        res.status(201).send(comment); 
    } catch (error) {
        console.error(error); 
        res.status(500).send({ error: "Failed to create the comment." }); 
    }
};

const deleteComment = async (req, res) => {
    try {
      const commentId = req.params.id;
      if (!commentId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid comment ID format' });
      }
  
      const deletedComment = await CommentModel.findByIdAndDelete(commentId);
      if (!deletedComment) {
        return res.status(404).json({ message: 'comment not found' });
      }
  
      res.status(200).json({ message: 'comment deleted successfully', comment: deletedComment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getAllCommentsById = async (req, res) => {
    try {
        const post = await PostModel.find({ postId: req.params.id });
        if (!post) {
            return res.status(404).send('No posts were found for the given post ID.');
        }
        const comments=await CommentModel.find({postId:req.params.id});
        if (!comments || comments.length === 0) {
            return res.status(404).send('No comments were found for the given post ID.');
        }
        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send('An error occurred while retrieving the comments.');
        console.error(error);
    }
};


module.exports = {
    createComment,
    getAllComments,
    updateComment,
    deleteComment,
    getAllCommentsById
};