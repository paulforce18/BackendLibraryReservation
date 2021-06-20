const Reserve = require("./../models/reserveBookModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.createReservation = catchAsync(async (req, res, next) => {
  const reserve = await Reserve.create({
    bookId: req.body.bookId,
    bookTitle: req.body.bookTitle,
    bookImage: req.body.bookImage,
    userId: req.body.userId,
    userName: req.body.userName,
    userAddress: req.body.userAddress,
    isRequested: req.body.isRequested,
    messages: req.body.messages,
    pendingAt: Date.now(),
  });

  res.status(200).json({
    status: "success",
    data: {
      reserve,
    },
  });
});

exports.getReservations = catchAsync(async (req, res, next) => {
  const pending = await Reserve.find({
    userId: req.params.id,
    status: req.params.status,
  });
  res.status(200).json({
    status: "success",
    results: pending.length,
    pending,
  });
});

exports.getAllReservations = catchAsync(async (req, res, next) => {
  const pendings = await Reserve.find({ status: "pending" });
  const reserved = await Reserve.find({ status: "reserved" });
  const borrowed = await Reserve.find({ status: "borrowed" });

  res.status(200).json({
    status: "success",
    data: {
      pendings,
      reserved,
      borrowed,
    },
  });
});

exports.updateReservations = catchAsync(async (req, res, next) => {
  const reservation = await Reserve.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!reservation) {
    return next(new AppError("No Reservation found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      reservation,
    },
  });
});

exports.deleteReservation = catchAsync(async (req, res, next) => {
  const reservation = await Reserve.findByIdAndDelete(req.params.id);

  if (!reservation) {
    return next(new AppError("No Reservation found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
