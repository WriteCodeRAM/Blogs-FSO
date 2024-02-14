const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blog');
const middleware = require('./utils/middleware');
const { URL } = require('./utils/config');

mongoose
  .connect(URL)
  .then((res) => console.log('connected to db'))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogsRouter);

// handler of requests with unknown endpoint
app.use(middleware.unknownEndpoint);
// this has to be the last loaded middleware.
app.use(middleware.errorHandler);

module.exports = app;
