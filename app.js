/* eslint-disable */
const express = require('express');
const app = express();
const path = require('path');
const AppError = require('./utils/Error');
const GlobalErrorHandling = require('./controllers/globalErrorHandle');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');
const bookingRouter = require('./routes/bookingRouter');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
// set special security  headers
app.use(helmet());
// limit body parser(payload), form req.body to prevent denial of service
app.use(express.json({ limit: '10kb' }));
// parse the url encoded to get or access the data of form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// parse the data from cooike at each request
app.use(cookieParser());
// Data sanitization aganist NOSQL query injection
app.use(mongoSanitize());
// Date Sanitization aganist XSS(cross-site-scripting)
app.use(xss());
// prevent htpp parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'price',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  }),
);
app.use((req, res, next) => {
  next();
});
// we need express know which template engine we will use, setting up pug template engine to build and render templates
app.set('view engine', 'pug');
// we need express know where our views located(templates)
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log('Hello from first middleware');
  next();
});
// count the number of request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from the same IP in one hour',
});
app.use('/api', limiter);
// second middleware
app.use((req, res, next) => {
  req.createdAT = new Date().toISOString();
  // console.log(req.createdAT);
  next();
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.get("/api/v1/tours", getTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

// app routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`can not to access ${req.originalUrl}`);
  // err.statusCode = 400;
  // err.status = 'fail';
  next(new AppError(`can not to access ${req.originalUrl}`, 400));
});
app.use(GlobalErrorHandling);
module.exports = app;
