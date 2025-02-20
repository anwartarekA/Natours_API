const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/Error');
const User = require('./../models/userModel');
const factoryController = require('./factoryController');
// filter object
const filterObj = (obj, ...allwedfields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allwedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// const multerStortage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images/users');
//   },
//   filename: (req, file, cb) => {
//     // user-user.id-timestamp-ext
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
// when i want to make image processing we should use memory storage instead diskstorage
const multerStortage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    return cb(
      new AppError("can't upload this file, please provide photo", 400),
      false,
    );
  }
};
const upload = multer({
  storage: multerStortage,
  fileFilter: multerFilter,
});
exports.uploadPhoto = upload.single('photo');
exports.imageProcessing = (req, res, next) => {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  if (!req.file) return next();
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/users/${req.file.filename}`);
  next();
};
// updateMe(name , email)
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) if begin with password give an error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route not for update password, go to /updateMyPassword ',
        400,
      ),
    );
  }
  // filter body
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  console.log(filterBody);
  // 2) get user based on id and update
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});
// deleteMe
exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1) get user based on id and deactive me
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// create users
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Routes has defined yet go to /signUP to create user',
  });
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getUsers = factoryController.getAll(User);
exports.getUser = factoryController.getOne(User);
exports.updateUser = factoryController.updateOne(User);
exports.deleteUser = factoryController.deleteOne(User);
