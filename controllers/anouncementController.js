const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const Anouncement = require("./../models/anouncementModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadAnouncementPhoto = upload.single("photo");
exports.resizeAnouncementphoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `anouncement-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(780, 520)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`images/anouncements/${req.file.filename}`);

  next();
};

exports.createAnouncement = catchAsync(async (req, res, next) => {
  const newAnouncement = await Anouncement.create({
    ...req.body,
    image: req.file.filename,
  });

  res.status(201).json({
    status: "success",
    data: {
      anouncement: newAnouncement,
    },
  });
});

exports.getAnouncementImage = catchAsync(async (req, res, next) => {
  const filePath = __dirname + `/../images/anouncements/${req.params.id}`;
  res.status(200).sendFile(path.resolve(filePath));
});
