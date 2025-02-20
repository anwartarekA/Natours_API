const stripe = require('stripe')(process.env.SECRIT_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/Error');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const factory = require('../controllers/factoryController');
// create session for payment
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) get the tour based on it's id
  const tour = await Tour.findById(req.params.tourID);
  // 2) create session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?user=${req.user.id}&&tour=${req.params.tourID}&&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/api/v1/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tour.id,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) send response with this session
  res.status(200).json({
    status: 'success',
    message: 'Session created successfully',
    data: {
      session,
    },
  });
});
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { user, tour, price } = req.query;
  if (!user && !tour && !price) return next();
  await Booking.create({ user, tour, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllbookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
