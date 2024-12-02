const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const port = process.env.PORT;
const postsRoutes = require('./routes/postRoutes');
const commentsRoutes = require('./routes/commentRoutes');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
     console.log('connected to MongoDB');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/post', postsRoutes);

app.use('/comment', commentsRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    });