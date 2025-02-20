const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');
console.log(process.argv);
dotenv.config({ path: './config.env' });
// cconnect to database
const mongoose = require('mongoose');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections);
    console.log('connected to DB successfully....');
  });

// function to import all data to database
const readTours = JSON.parse(fs.readFileSync('./data/tours.json', 'utf-8'));
const readUsers = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
const readReviews = JSON.parse(fs.readFileSync('./data/reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(readTours);
    await User.create(readUsers);
    await Review.create(readReviews);
    console.log('ALL DATA ADDED...');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// function to delete all data to database
const deleteDate = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    console.log('ALL DATA DELETED...');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteDate();
}
