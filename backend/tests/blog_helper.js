const Blog = require('../models/blogs');

const initialBlogs = [
  {
    title: 'Making Blogs',
    author: 'Randal Michel',
    url: 'www.randalmichel.com',
    likes: 999,
    id: 123,
  },
  {
    title: 'The Art of Writing',
    author: 'Jane Doe',
    url: 'www.janedoe.com',
    likes: 500,
  },
  {
    title: 'Programming Tips',
    author: 'John Smith',
    url: 'www.johnsmith.com',
    likes: 300,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
