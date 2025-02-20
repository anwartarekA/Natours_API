const AppError = require('./../utils/Error');
// sending errors in case of development environment
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};
// handling the Invalid Id At DB And make it as operational error
const HandleInvalidIDDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}, please enter a suitable id`;
  return new AppError(message, 400);
};
// handling the duplicate field and return the operational error
const HandleDuplicateFieldDB = (err) => {
  const message = `Duplicated field  value ${err.keyValue.name}, please enter another value for that field`;
  return new AppError(message, 400);
};
// handling validations errors and return the operational error
const HandleValidationErrorsDB = (err) => {
  const value = Object.values(err.errors).map((obj) => obj.message);
  const message = `Validation Error : ${value.join('. ')} check the value for each entered field`;
  return new AppError(message, 400);
};
// handle invalid signature
const HandleInvalidSignature = () => {
  return new AppError(
    'Invalid token you can`t access the product now, please login again',
    401,
  );
};
// handle expiration time
const HandleExpirationTime = () => {
  return new AppError('JWT Expired, please login again!', 401);
};
// sending errors in case of production environment
const sendErrPro = (err, req, res) => {
  if (err.isOperational) {
    if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res
        .status(err.statusCode)
        .set('Content-Security.Policy', "frame-sec 'self'")
        .render('error', {
          title: 'Something went wrong',
          message: err.message,
        });
    }
  }
  // create generic error
  else {
    if (req.originalUrl.startsWith('/api')) {
      console.error('ERROR 🔥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something is very wrong!',
      });
    } else {
      res
        .status(err.statusCode)
        .set('Content-Security-Policy', "frame-src 'self'")
        .render('error', {
          title: 'Something went wrong',
          message: 'Something is very wrong!',
        });
    }
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    if (req.originalUrl.startsWith('/api')) sendErrDev(err, res);
    else {
      res
        .status(err.statusCode)
        .set('Content-Security-Policy', "frame-src 'self' ")
        .render('error', {
          title: 'Something went wrong',
          message: err.message,
        });
    }
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = HandleInvalidIDDB(err);
    if (err.code === 11000) err = HandleDuplicateFieldDB(err);
    if (err.name === 'ValidationError') err = HandleValidationErrorsDB(err);
    if (err.name === 'JsonWebTokenError') err = HandleInvalidSignature();
    if (err.name === 'TokenExpiredError') err = HandleExpirationTime();
    sendErrPro(err, req, res);
  }
};
