const mongoose = require('mongoose');
const validator = require('validator');
const bcrybt = require('bcryptjs');
const crybto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'please enter your email!'],
    unique: true,
    validate: [validator.isEmail, 'Inalid email enter another one!'],
  },
  password: {
    type: String,
    required: [true, 'please enter your password!'],
    minLength: 5,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please enter your password again here!'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: `You should enter the same password!,This value:{VALUE} is not the same`,
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  changePasswordAt: Date,
  role: {
    type: String,
    emun: {
      values: ['admin', 'guide', 'lead-guide', 'user'],
      message: 'this role {VALUE} not statisfy our application',
    },
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
// make encryption for password before presisting to db
userSchema.pre('save', async function (next) {
  // check if password is modified if not call next function to call the create fuction and saving it inot db
  if (!this.isModified('password')) return next();
  // make encryption for password before presisted into db
  this.password = await bcrybt.hash(this.password, 12);
  console.log(this.password);
  // delete the password confirm from db
  this.passwordConfirm = undefined;
  next();
});
// update changePasswordAt
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.changePasswordAt = Date.now() - 1000;
  next();
});
// hide unactive user
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// check if the input password equal to the encrypted password that stored into db
userSchema.methods.correctPassword = async function (
  inputPassword,
  passwordEncrypted,
) {
  return await bcrybt.compare(inputPassword, passwordEncrypted);
};
// check if user chanege password after the token issued
userSchema.methods.checkPasswordAfterToken = function (issuedAt) {
  if (this.changePasswordAt) {
    const changedAt = parseInt(this.changePasswordAt.getTime() / 1000, 10);
    console.log(issuedAt, changedAt);
    return issuedAt < changedAt;
  }
  return false;
};
// make reset token for reset password
userSchema.methods.createPasswordResetToken = async function () {
  // create resettoken
  const resetToken = crybto.randomBytes(32).toString('hex');
  // make encryption for token
  this.passwordResetToken = crybto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // make expires time for token to make password reset operation before expiration
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // save theses fields at db and stop validation before saving
  await this.save({ validateBeforeSave: false });
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
