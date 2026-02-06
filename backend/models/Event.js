const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  place: String,
  date: String,
  fee: String,
});

module.exports = mongoose.model("Event", eventSchema);
