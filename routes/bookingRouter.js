const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const authrizeController = require('./../controllers/authrizeController');
const Router = express.Router();
Router.use(authController.protect);
Router.get('/checkout-session/:tourID', bookingController.getCheckOutSession);
Router.use(authrizeController.restrictTo('admin', 'lead-guide'));
Router.route('/')
  .get(bookingController.getAllbookings)
  .post(bookingController.createBooking);
Router.route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = Router;
