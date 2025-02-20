const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/Error');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Email = require('./../utils/sendEmail');
const createToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};
const sendResCreateToken = (user, statusCode, res) => {
  const token = createToken(user);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
      token,
    },
  });
};
// signing up
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    changePasswordAt: req.body.changePasswordAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/profile`;
  sendResCreateToken(user, 201, res);
  await new Email(user, url).sendWelcome();
});
// login in
exports.login = catchAsync(async (req, res, next) => {
  // 1) check if the email and password provided
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please provide email or password!', 400));
  }
  // 2) check if user with that email exist and check if password correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password!', 400));
  }
  // 3) generate jwt to that user
  sendResCreateToken(user, 200, res);
});

// make protect function to make sure that user actually login to access the protected parts of application
exports.protect = catchAsync(async (req, res, next) => {
  // 1) get the token and check if exist
  let tokenHeader;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    tokenHeader = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    tokenHeader = req.cookies.jwt;
    if (!tokenHeader) {
      return next(
        new AppError('can`t access this route please login again!', 401),
      );
    }
  }
  // 2) check if the token is valid and user not manuplate with data and the expiration date also
  const decoded = await promisify(jwt.verify)(
    tokenHeader,
    process.env.JWT_SECRET,
  );
  // 3) check if the user is still exist who logged
  const loggedUser = await User.findById(decoded.id);
  if (!loggedUser) {
    return next(
      new AppError('No user exist with this token, sign up again!', 401),
    );
  }
  // 4) check if user change the password after the token issued
  if (loggedUser.checkPasswordAfterToken(decoded.iat)) {
    return next(
      new AppError(
        'this token is invalid as the user change his password after issued it, please login again',
        401,
      ),
    );
  }
  req.user = loggedUser;
  res.locals.user = loggedUser;
  next();
});
// loggin middleware to render the picture and name of logged user
exports.isloggedIn = async (req, res, next) => {
  try {
    // console.log(req.cookies.jwt);
    // check if the token is valid and user not manuplate with data and the expiration date also
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );
    // check if the user is still exist who logged
    const loggedUser = await User.findById(decoded.id);
    // console.log(loggedUser);

    // check if user change the password after the token issued
    if (loggedUser.checkPasswordAfterToken(decoded.iat)) {
      return next();
    }
    res.locals.user = loggedUser;
    return next();
  } catch (err) {
    return next();
  }
};
// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the email of user and check it and generate token
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new APPError('no user exists with this email ', 400));
  }
  // 2) generate reset token and presisted it to database with encryption shape
  const resetToken = await user.createPasswordResetToken();
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
  try {
    // 3) send the plain token to user`s email address(URL reset token)
    await new Email(user, resetUrl).sendResetPasswordEmail();
    // await sendEmail(tokenOptions);
    // send response that email of resetUrl sent
    res.status(200).json({
      status: 'success',
      message: 'email link sent successfully!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    return next(new APPError('Error of sending email link', 400));
  }
});
// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based on reset token
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return next(new AppError('no user found or token has expired', 400));
  }
  // 2) if user exists and reset token hasn't expired, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // 3) update changePasswordAt proberity for that user
  await user.save();
  // 4) login user, send jwt
  sendResCreateToken(user, 200, res);
});
// update password
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) get user and check password is current password correct
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new APPError('Incorrect password, can`t update password', 401));
  }
  // 2) set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // 3) update changePAsswordAt proberity for that user
  await user.save();
  // 4) login user, send jwt
  sendResCreateToken(user, 200, res);
});
//logout
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'anwartarek', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });
};
