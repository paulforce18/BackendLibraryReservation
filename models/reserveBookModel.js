const mongoose = require("mongoose");

const reserveBookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true,
  },
  bookTitle: {
    type: String,
  },
  bookImage: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "reserved", "borrowed", "returned"],
    default: "pending",
    required: true,
  },
  messages: [
    {
      name: String,
      message: String,
      messageDate: Date,
    },
  ],
  isRequested: {
    type: String,
    unique: [true, "This book is already reserved"],
  },
  pendingAt: Date,
  reservedAt: Date,
  borrowedAt: Date,
  returnedAt: Date,
});
reserveBookSchema.pre("save", function (next) {
  if (this.isNew) return next();
  this.pendingAt = Date.now() - 1000;
  next();
});

const Reserve = mongoose.model("Reserve", reserveBookSchema);
module.exports = Reserve;
