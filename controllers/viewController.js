/* eslint-disable*/
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get all tours from the collection into database
  // 2) build template
  // 3) render the template with the data from 1)
  const tours = await Tour.find();
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data from database collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
  });
  // 2) build template
  // 3) render the template with the data from 1)

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "frame-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});
// loign route
exports.login = (req, res, next) => {
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('login', {
      title: 'Log into your account',
    });
};
// signup route
exports.signup = (req, res, next) => {
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('signup', {
      title: 'Create your account',
    });
};
// render account page
exports.account = (req, res, next) => {
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('account', {
      title: 'Profile',
    });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) get all booking based on the loggin user
  const bookings = await Booking.find({ user: req.user.id });
  // 2) get all tourIDs for these bookings
  const tourIDs = bookings.map((el) => el.tour);
  // 3) get all tours for these tourIDs
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self' ")
    .render('overview', {
      title: 'My Tours',
      tours,
    });
});
//update user data with from
// exports.updateUserDate = catchAsync(async (req, res, next) => {
//   const newUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//       photo: req.file.filename,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   );
//   res
//     .status(200)
//     .set('Content-Security-Policy', "frame-src 'self' ")
//     .render('account', {
//       title: 'profile',
//       user: newUser,
//     });
// });
