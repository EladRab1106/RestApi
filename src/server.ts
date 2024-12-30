// Elad Rabinovitch 315409334
// Roie Raz 322713389

import express, { Application } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import postsRoutes from './routes/postRoutes';
import commentsRoutes from './routes/commentRoutes';


dotenv.config();

const app: Application = express();


const mongoUri = process.env.MONGO_URI as string;
if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
}

mongoose.connect(mongoUri).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes setup
app.use('/post', postsRoutes);
app.use('/comment', commentsRoutes);

// Export the app
export default app;
