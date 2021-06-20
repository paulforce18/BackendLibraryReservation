const express = require("express");
const bookController = require("./../controllers/bookController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin", "librarian"),
    bookController.uploadBookPhoto,
    bookController.resizeBookphoto,
    bookController.createBook
  )
  .get(authController.protect, bookController.getAllBooks);

router.route("/images/:id").get(bookController.getBookImage);

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "librarian"),
    bookController.deleteBook
  );

module.exports = router;
