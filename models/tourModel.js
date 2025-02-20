const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A Tour name must be less or equal 40 characters'],
      minlength: [10, 'A Tour name must be greater or equal 10 characters'],
      // match: [/^[a-z][A-Z]/, 'A Tour must start with charcter from a to z'],
      // validate: [validator.isAlpha, 'The Tour name must only be characters'],
      // validate: {
      //   validator: validator.isAlpha,
      //   message:'The tour name must be chars'
      // }
    },
    slug: {
      type: String,
      trim: true,
      default: 'no slug',
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      require: [true, 'tour must have a price'],
    },
    rating: {
      min: [1, 'A Tour rating must be greater or equal 1 '],
      max: [5, 'ATour rating must be less or equal 5'],
      type: Number,
      default: 4.5,
    },
    duration: {
      type: Number,
      required: [true, 'Tour must haev a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a groupsize'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          '{VALUE}is not defined, A Tour difficulty must only be one of this values (easy , medium , difficult)',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 5.5,
      set: (value) => {
        return Math.round(value * 10) / 10;
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [String],
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price > val;
        },
        message: `{VALUE} must be less than the price`,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have an imageCover'],
    },
    createdAT: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
// populate the tour guides when find
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changePasswordAt',
  });
  next();
});
// embedding tour-guides into database
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (guideID) => await User.findById(guideID),
//   );
//   await Promise.all(guidesPromises);
//   next();
// });
// document middleware before or after save or create
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, replacement: '-' });
  next();
});
// show reviews for a certain tour
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  console.log('will be excuted before creation...');
  next();
});
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startDate = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`all docs take ${Date.now() - this.startDate} milleseconds`);
  next();
});
// aggregate middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   console.log(this.pipeline());
//   next();
// });

tourSchema.post('aggregate', function (stats, next) {
  console.log(stats);
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
