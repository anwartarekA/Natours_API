const express = require('express');
const router = express.Router();
const userControllers = require('./../controllers/userController');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isloggedIn,
  viewController.getOverview,
);
router.use(authController.isloggedIn);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.login);
router.get('/signup', viewController.signup);
// router.use(authController.protect);
router.get('/profile', authController.protect, viewController.account);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// when i want to use urlencoded to update data
// router.post(
//   '/submit-user-data',
//   userControllers.uploadPhoto,
//   userControllers.imageProcessing,
//   viewController.updateUserDate,
// );
module.exports = router;
