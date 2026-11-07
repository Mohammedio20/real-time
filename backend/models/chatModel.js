const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
