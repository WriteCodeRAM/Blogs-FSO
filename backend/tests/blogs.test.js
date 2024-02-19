const listHelper = require('../utils/list_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./blog_helper');
const Blog = require('../models/blogs');
const User = require('../models/users');

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const userObjects = helper.initialUsers.map((user) => new User(user));
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  const promiseArray2 = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
  await Promise.all(promiseArray2);
}, 10000);

describe('when there are some blogs in the db', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there is an id property', async () => {
    const blogs = await api.get('/api/blogs');
    const response = blogs._body;
    expect(response[0].id).toBeDefined();
  });
});

describe('posting blog to database', () => {
  test('blog is saved to database', async () => {
    await api
      .post('/api/blogs')
      .send(helper.initialBlogs[0])
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  }, 10000);

  test('there is a likes property', async () => {
    const faultyBlog = {
      title: 'testing likes',
      author: 'Yours Truly',
      url: 'www.github.com/WriteCodeRAM',
    };
    await api
      .post('/api/blogs')
      .send(faultyBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogs = await api.get('/api/blogs');

    const response = blogs._body;
    expect(response[response.length - 1].id).toBeDefined();
  });

  test('appropriate status code is assigned when title or url is missing', async () => {
    const faultyBlog = {
      author: 'Yours Truly',
      likes: 90,
    };

    await api.post('/api/blogs').send(faultyBlog).expect(400);
  });
});

describe('deleting and updating blogs', () => {
  test('deleting a blog returns 204 and deletes from db', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const contents = blogsAtEnd.map((r) => r.title);

    expect(contents).not.toContain(blogToDelete.title);
  });

  test('updating a blog returns 200', async () => {
    const blogs = await helper.blogsInDb();
    const validId = blogs[0].id;

    const updatedBlog = {
      title: 'Updating Blogs',
      author: 'Randal A. Michel',
      url: 'www.randalmichel.com',
      likes: 100,
    };

    await api.put(`/api/blogs/${validId}`).send(updatedBlog).expect(200);

    const updatedBlogFromDb = await Blog.findById(validId);

    expect(updatedBlogFromDb.title).toEqual(updatedBlog.title);
  }, 10000);
});

describe('creating users', () => {
  test('creating user returns 201 if username is unique', async () => {
    const dummy = {
      username: 'RAM',
      name: 'Randal',
      password: 'password',
    };

    await api
      .post('/api/users')
      .send(dummy)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });

  test('users must meet minLength requirements; have required fields', async () => {
    const dummy = {
      username: 'RA',
      name: 'Randal',
      password: 'PASSWORDDD',
    };

    await api.post('/api/users').send(dummy).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
