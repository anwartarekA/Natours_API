const tourControllers = require('../controllers/tourController');
const authcontrollers = require('./../controllers/authController');
const authrizeController = require('./../controllers/authrizeController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRouter');
const express = require('express');
const Router = express.Router();
// Router.route('/')
// router for all statistics
Router.route('/statistics-aggregation').get(tourControllers.getStatistics);
// router to get the busiest month in the certain year
Router.route('/monthly-plan/:year').get(
  authcontrollers.protect,
  authrizeController.restrictTo('admin', 'lead-guide', 'guide'),
  tourControllers.getBusiestMonth,
);

// make middleware to set the id for tour

// const setTourID = (req, res, next) => {
//   req.tourID = req.params.tourID;
//   next();
// };
Router.use('/:tourID/reviews', reviewRouter);

Router.route('/')
  .get(tourControllers.getTours)
  .post(
    authcontrollers.protect,
    authrizeController.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour,
  );
// Router.param('id', tourControllers.checkID);
Router.route('/:id')
  .get(tourControllers.getTour)
  .patch(
    authcontrollers.protect,
    authrizeController.restrictTo('admin', 'lead-guide'),
    tourControllers.uploadTourImages,
    tourControllers.resizeTourImages,
    tourControllers.updateTour,
  )
  .delete(
    authcontrollers.protect,
    authrizeController.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );
Router.route('/default/querystring').get(
  tourControllers.defaultQuires,
  tourControllers.getTours,
);
// /tours-within/:distance/center/:latlng/unit/:unit
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourControllers.getToursWithin,
);
// /distances/center/:latlng/unit/:unit
Router.route('/distances/center/:latlng/unit/:unit').get(
  tourControllers.getDistances,
);
module.exports = Router;
