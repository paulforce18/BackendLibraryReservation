const express = require("express");
const reserveBookController = require("./../controllers/reserveBookController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(reserveBookController.createReservation)
  .get(reserveBookController.getAllReservations);

router
  .route("/:id&:status")
  .get(authController.protect, reserveBookController.getReservations);

router
  .route("/:id")
  .patch(authController.protect, reserveBookController.updateReservations)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "librarian"),
    reserveBookController.deleteReservation
  );

module.exports = router;
