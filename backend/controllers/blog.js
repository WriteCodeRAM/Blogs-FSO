const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post('/', (request, response) => {
  if (!request.body.likes) {
    request.body.likes = 0;
  }

  if (!request.body.author || !request.body.url) {
    console.log('we made it here');
    return response
      .status(400)
      .json({ error: 'author and url are required fields' });
  }
  console.log(request.body);
  const blog = new Blog(request.body);

  blog.save().then((result) => {
    response.status(201).json(result);
  });
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
