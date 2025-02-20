const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/ApiFeatures');
const factoryController = require('./factoryController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/Error');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else {
    return cb(
      new AppError("can't upload this file, please try to upload image", 400),
      false,
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // image processing for imageCover
  // tour-tourID-timestamp-cover-jpeg
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover-jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/tours/${req.body.imageCover}`);
  // image processing for images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-image-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});
// get the class error
// const fs = require('fs');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../data/data.json`, 'utf-8')
// );
// check ID
// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'error',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
// check data body
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price)
//   {
//     return res.status(400).json({
//       status: 'error',
//       message:'Tour must have name and price'
//     })
//   }
//   next();
// }
// get the catch async error handler
//defaultQuires
exports.defaultQuires = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,ratingsAverage';
  req.query.select = 'name,price,rating,ratingsAverage,difficulty';
  next();
};

exports.getTours = factoryController.getAll(Tour);
exports.getTour = factoryController.getOne(Tour, { path: 'reviews' });
exports.createTour = factoryController.createOne(Tour);
exports.updateTour = factoryController.updateOne(Tour); // not for updating password
exports.deleteTour = factoryController.deleteOne(Tour);

// get all statistics
exports.getStatistics = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgSum: { $sum: '$ratingsAverage' },
        tourNums: { $sum: 1 },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        sumQuantity: { $sum: '$ratingsQuantity' },
        maxGroupSize: { $max: '$maxGroupSize' },
      },
    },
    {
      $addFields: { level: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { maxPrice: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
// get the Busiest Month
exports.getBusiestMonth = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        Tours: { $push: '$name' },
        numTours: { $sum: 1 },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // console.log(distance, lat, lng, unit);
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );
  }
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
// calculate distance for each tour from my location
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng',
        400,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
