const mongoose = require("mongoose");

const anouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  image: {
    type: String,
  },
});

const Anouncement = mongoose.model("Anouncement", anouncementSchema);
module.exports = Anouncement;
