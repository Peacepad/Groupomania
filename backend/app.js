const express = require("express");

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const likeRoutes = require("./routes/like");
const commentRoutes = require("./routes/comment");
const path = require('path');
const cors = require('cors');





require('dotenv').config();




const app = express();




app.use(cors());


app.use(express.json());

app.use('/files', express.static(path.join(__dirname, `/files`)));
console.log(__dirname);
app.use('/api/user', userRoutes); 
app.use('/api/post', postRoutes); 
app.use('/api/post/like', likeRoutes);
app.use('/api/post/:id/comment', commentRoutes);

module.exports = app;

