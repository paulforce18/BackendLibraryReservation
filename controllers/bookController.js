const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const Book = require("./../models/bookModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images/books");
//   },
//   filename: (req, file, cb) => {
//     // book-123123abc213123-123124324.jpeg
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `book-${Date.now()}.${ext}`);
//   },
// });
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

exports.uploadBookPhoto = upload.single("photo");
exports.resizeBookphoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `book-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 800)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`images/books/${req.file.filename}`);

  next();
};

exports.getAllBooks = catchAsync(async (req, res, next) => {
  // if (req.body.bookIdList) {
  //   const books = await Book.find({
  //     _id: { $in: req.body.bookIdList },
  //   });
  //   res.status(200).json({
  //     status: "success",
  //     results: books.length,
  //     data: {
  //       books,
  //     },
  //   });
  // }
  const numberOfBooks = await Book.find();
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query;
  // const books = await Book.find();
  res.status(200).json({
    status: "success",
    results: numberOfBooks.length,
    data: {
      books,
    },
  });
});

exports.getBooks = catchAsync(async (req, res, next) => {
  console.log();
  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      books,
    },
  });
});

exports.getBook = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new AppError("No book found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      book,
    },
  });
});

exports.getBookImage = catchAsync(async (req, res, next) => {
  const filePath = __dirname + `/../images/books/${req.params.id}`;
  res.status(200).sendFile(path.resolve(filePath));
});

exports.createBook = catchAsync(async (req, res, next) => {
  console.log(req.file.filename);
  // console.log(req.body);

  const newBook = await Book.create({
    lower_title: req.body.title.toLowerCase().split(" ").join(""),
    availableCopies: req.body.numberOfCopies,
    img: req.file.filename,
    ...req.body,
  });

  res.status(201).json({
    status: "success",
    data: {
      book: newBook,
    },
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    return next(new AppError("No book found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      book,
    },
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);

  if (!book) {
    return next(new AppError("No Book found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
