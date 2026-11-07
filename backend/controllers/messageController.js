const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createMessage = catchAsync(async (req, res, next) => {
  const message = await Message.create(req.body);
  const currentChat = await Chat.findByIdAndUpdate(
    { _id: req.body.chatId },
    {
      lastMessage: message._id,
      $inc: { unreadMessages: 1 },
    },
  );
  res.status(201).json({
    message: "Message sent successfully",
    status: "success",
    data: {
      message,
    },
  });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ chatId: req.params.chatId }).sort({
    createdAt: 1,
  });

  if (!messages) {
    return next(new AppError("No messages found for this chat", 404));
  }
  res.status(200).json({
    results: messages.length,
    message: "Messages fetched successfully",
    status: "success",
    data: {
      messages,
    },
  });
});
