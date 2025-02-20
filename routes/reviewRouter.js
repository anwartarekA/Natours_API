const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authcontrollers = require('./../controllers/authController');
const authrizeController = require('./../controllers/authrizeController');
const Router = express.Router({
  mergeParams: true,
});

// POST tour/123fd4/reviews
// GET tour/123fd4/reviews
// GET tour/123fd4/reviews/1234gbf2
Router.use(authcontrollers.protect);
Router.route('/')
  .get(reviewController.getAllReviews)
  .post(
    authrizeController.restrictTo('user'),
    reviewController.setTourUserIDS,
    reviewController.createReview,
  );
Router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    authrizeController.restrictTo('admin', 'user'),
    reviewController.updateReview,
  )
  .delete(
    authrizeController.restrictTo('admin', 'user'),
    reviewController.deleteReview,
  );
module.exports = Router;
