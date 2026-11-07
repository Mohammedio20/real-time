const express = require("express");
const chatController = require("./../controllers/chatController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/", authController.protect, chatController.createChat);
router.get("/", authController.protect, chatController.getAllChats);
router.post("/read", authController.protect, chatController.markAsRead);

module.exports = router;
