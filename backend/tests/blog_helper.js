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

const initialUsers = [
  { username: 'RAM', name: 'Randal', password: 'password' },
  { username: 'JDOE', name: 'John Doe', password: '12345' },
  { username: 'SMITH', name: 'Samantha Smith', password: 'qwerty' },
  { username: 'BROWN', name: 'Bobby Brown', password: 'abc123' },
  { username: 'WILSON', name: 'Wendy Wilson', password: 'password1' },
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
  initialUsers,
};
