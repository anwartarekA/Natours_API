const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factoryController = require('./factoryController');

exports.setTourUserIDS = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factoryController.getAll(Review);
exports.getReview = factoryController.getOne(Review);
exports.createReview = factoryController.createOne(Review);
exports.updateReview = factoryController.updateOne(Review);
exports.deleteReview = factoryController.deleteOne(Review);