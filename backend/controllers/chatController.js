const Chat = require("../models/chatModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Message = require("../models/messageModel");

exports.createChat = catchAsync(async (req, res, next) => {
  const { members } = req.body;

  const chat = await Chat.create({ members });
  await chat.populate("members");

  res.status(201).json({
    message: "Chat created successfully",
    status: "success",
    data: {
      chat,
    },
  });
});

exports.getAllChats = catchAsync(async (req, res, next) => {
  const chats = await Chat.find({ members: { $in: [req.user.id] } })
    .populate("members")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  if (!chats) {
    return next(new AppError("No chats found for this user", 404));
  }

  res.status(200).json({
    message: "Chats fetched successfully",
    status: "success",
    results: chats.length,
    data: {
      chats,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const chatId = req.body.chatId;
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError("No chats found with is given ID", 404));
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { unreadMessages: 0 },
    { new: true },
  )
    .populate("members")
    .populate("lastMessage");

  await Message.updateMany({ chatId, read: false }, { read: true });
  res.status(200).json({
    message: "Unread messages updated  successfully",
    status: "success",
    data: {
      updatedChat,
    },
  });
});
