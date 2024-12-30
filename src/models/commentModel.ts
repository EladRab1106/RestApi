import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({

    title:String,
    content:String,
    postId: String,
    owner:String,

 }
)

export = mongoose.model('Comment', commentSchema);