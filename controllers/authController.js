const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    address: req.body.address,
    mobileNumber: "09293828383",
    studentNumber: "PDM-2018-000208",
    course: "BSCS",
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1.) check if email and passsword exist
  if (!email || !password) {
    return next(new AppError("Pleae provide email and password", 400));
  }

  // 2.) check if user exists and passsword is correct
  const user = await User.findOne({ email }).select("+password");
  const protectectedUser = await User.findOne({ email });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect password or email", 401));
  }

  // 3.) if everything ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "sucsess",
    token,
    data: {
      protectectedUser,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token an check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not log in please log in to get access.", 401)
    );
  }

  //2.) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3.) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        "The user belonging to this token doest no longer exist.",
        401
      )
    );
  }

  //4.) Check if user change password after thee token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password! please login again.", 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1.)Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError("There is no user with email address", 404));
  }

  // 2.)Generate thee random reset token
  const resetTokn = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3.)Send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetTokn}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password Confirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //  1.)Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //  2.)If token is not expired, and thereis user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //  3.)Update changedPasswordAt property for the user
  //  4.)Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "sucsess",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  const user = await User.findById({ _id: req.body.id }).select("+password");

  // check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Incorrect password or email", 401));
  }
  // If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.save();
  // log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "sucsess",
    token,
  });
});
