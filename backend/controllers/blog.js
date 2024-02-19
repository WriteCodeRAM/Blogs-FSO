const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user');
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);
  if (!request.body.likes) {
    request.body.likes = 0;
  }

  if (!request.body.author || !request.body.url) {
    return response
      .status(400)
      .json({ error: 'author and url are required fields' });
  }

  console.log(user);
  console.log(request.body);
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    user: user.id,
    likes: 0,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.status(204).json({ message: 'blog deleted' });
});

blogsRouter.put('/:id', async (req, res) => {
  const blog = req.body;

  await Blog.findByIdAndUpdate(req.params.id, blog, { new: true });
  res.status(200).json({ message: 'blog updated' });
});

module.exports = blogsRouter;
