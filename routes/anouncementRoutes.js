const express = require("express");
const authController = require("./../controllers/authController");
const anouncementController = require("./../controllers/anouncementController");

const router = express.Router();
router.route("/images/:id").get(anouncementController.getAnouncementImage);
router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin", "librarian"),
    anouncementController.uploadAnouncementPhoto,
    anouncementController.resizeAnouncementphoto,
    anouncementController.createAnouncement
  );

module.exports = router;
