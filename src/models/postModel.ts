import mongoose, { Schema, Model } from "mongoose";

// Define the interface for the Post document
export interface IPost {
  title: string;
  content: string;
  owner: string;
}

// Define the schema for the posts collection
const postSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: String, required: true },
});

// Create the Mongoose model for the Post schema
const PostModel: Model<IPost> = mongoose.model<IPost>("posts", postSchema);

export default PostModel;
