const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({

    title:String,
    content:String,
    postId: String,
    owner:String,

 }
)

module.exports = mongoose.model('Comment', commentSchema);