const AppError = require('../utils/Error');
const catchAsync = require('./../utils/catchAsync');
const ApiFeatures = require('./../utils/ApiFeatures');
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    // if doc equal null -- no tour with this id
    if (!doc) {
      return next(new AppError('No document found with this id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) {
      return next(
        new AppError('Please provide data in body to create document', 400),
      );
    }
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    // if updatetour equal null -- no tour with this id
    if (!doc) {
      return next(new AppError('No document found with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // if gettingTour equal null -- no tour with this id
    if (!doc) {
      return next(new AppError('No document found with this id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourID) {
      filter = { tour: req.params.tourID };
    }
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .select()
      .paginage();

    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
