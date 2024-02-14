const dummy = (blogs) => {
  return 1;
};

const calculateLikes = (blogs) => {
  const total = blogs.reduce((sum, item) => (sum += item.likes), 0);

  return blogs.length > 0 ? total : 0;
};

const favoriteBlog = (blogs) => {
  let favorite = 0;

  for (let i = 1; i < blogs.length; i++) {
    if (blogs[i].likes > blogs[favorite].likes) {
      favorite = i;
    }
  }

  return blogs.length > 0 ? blogs[favorite] : 0;
};

module.exports = {
  dummy,
  calculateLikes,
  favoriteBlog,
};
