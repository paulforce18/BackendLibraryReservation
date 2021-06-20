const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
 
  const users = await User.find({$and:[{role:{$ne: "admin"}}]});

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({...req.body,});
  res.status(201).json({
    status: "success",
    data: {
      ...newUser
    },
  });
});