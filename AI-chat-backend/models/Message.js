const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

module.exports = mongoose.model("Message", messageSchema);
