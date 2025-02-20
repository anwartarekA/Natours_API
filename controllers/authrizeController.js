const APPError = require('./../utils/Error');
exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APPError('you hasn`t permission to do this action!', 403),
      );
    }
    next();
  };
};
