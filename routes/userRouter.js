const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const authrizeController = require('./../controllers/authrizeController');
const Router = express.Router();
Router.post('/signup', authController.signup );
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgotpassword', authController.forgotPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);
// make protectiong for all routes after
Router.use(authController.protect);
Router.patch('/updateMyPassword', authController.updateMyPassword);
Router.patch(
  '/updateMe',
  userController.uploadPhoto,
  userController.imageProcessing,
  userController.updateMe,
);
Router.delete('/deleteMe', userController.deleteMe);
Router.get('/me', userController.getMe, userController.getUser);
Router.use(authrizeController.restrictTo('admin'));
Router.route('/').get(userController.getUsers).post(userController.createUser);
Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = Router;
