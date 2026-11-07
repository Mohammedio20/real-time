const express = require("express");
const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", authController.protect, messageController.createMessage);
router.get(
  "/:chatId",
  authController.protect,
  messageController.getAllMessages,
);

module.exports = router;
