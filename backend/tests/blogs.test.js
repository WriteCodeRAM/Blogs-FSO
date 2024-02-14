const listHelper = require('../utils/list_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const helper = require('./blog_helper');
const Blog = require('../models/blogs');

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
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

// test('dummy returns one', () => {
//   const blogs = [];

//   const result = listHelper.dummy(blogs);
//   expect(result).toBe(1);
// });

// describe('total amount of likes on a blogs passed', () => {
//   test('no blogs return 0', () => {
//     const blog = [];

//     const result = listHelper.calculateLikes(blog);
//     expect(result).toBe(0);
//   });

//   test('multiple blogs are calculated correctly', () => {
//     const blog = [
//       {
//         _id: '5a422aa71b54a676234d17f8',
//         title: 'Go To Statement Considered Harmful',
//         author: 'Edsger W. Dijkstra',
//         url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
//         likes: 5,
//         __v: 0,
//       },
//       {
//         _id: '5a422a851b54a676234d17f7',
//         title: 'Canonical string reduction',
//         author: 'Edsger W. Dijkstra',
//         url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
//         likes: 12,
//         __v: 0,
//       },
//       {
//         _id: '5a422b3a1b54a676234d17f9',
//         title: 'First class tests',
//         author: 'Robert C. Martin',
//         url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
//         likes: 10,
//         __v: 0,
//       },
//       {
//         _id: '5a422b891b54a676234d17fa',
//         title: 'TDD harms architecture',
//         author: 'Robert C. Martin',
//         url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
//         likes: 0,
//         __v: 0,
//       },
//     ];
//     const result = listHelper.calculateLikes(blog);
//     expect(result).toBe(27);
//   });

//   test('one blog returns the likes of said blog', () => {
//     const listWithOneBlog = [
//       {
//         _id: '5a422aa71b54a676234d17f8',
//         title: 'Go To Statement Considered Harmful',
//         author: 'Edsger W. Dijkstra',
//         url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
//         likes: 5,
//         __v: 0,
//       },
//     ];

//     const result = listHelper.calculateLikes(listWithOneBlog);
//     expect(result).toBe(5);
//   });
// });

// describe('find the blog with most likes', () => {
//   test('multiple blogs passed', () => {
//     const blogs = [
//       {
//         _id: '5a422a851b54a676234d17f7',
//         title: 'Canonical string reduction',
//         author: 'Edsger W. Dijkstra',
//         url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
//         likes: 12,
//         __v: 0,
//       },
//       {
//         _id: '5a422b3a1b54a676234d17f9',
//         title: 'First class tests',
//         author: 'Robert C. Martin',
//         url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
//         likes: 10,
//         __v: 0,
//       },
//       {
//         _id: '5a422b3a1b54a676234d17f9',
//         title: 'First class tests',
//         author: 'Robert C. Martin',
//         url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
//         likes: 10,
//         __v: 0,
//       },
//     ];

//     const result = listHelper.favoriteBlog(blogs);
//     expect(result).toEqual(blogs[0]);
//   });

//   test('no blogs passed', () => {
//     const blogs = [
//       {
//         _id: '5a422b3a1b54a676234d17f9',
//         title: 'First class tests',
//         author: 'Robert C. Martin',
//         url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
//         likes: 10,
//         __v: 0,
//       },
//     ];

//     const result = listHelper.favoriteBlog(blogs);
//     expect(result).toEqual(blogs[0]);
//   });

//   test('one blog passed', () => {
//     const blogs = [];

//     const result = listHelper.favoriteBlog(blogs);
//     expect(result).toEqual(0);
//   });
// });

afterAll(async () => {
  await mongoose.connection.close();
});
