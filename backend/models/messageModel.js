const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
