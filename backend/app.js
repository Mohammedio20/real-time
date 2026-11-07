const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();
app.use(cors());
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
app.set("query parser", "extended");

app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/messages", messageRouter);

app.all("*path", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("join-room", (userId) => {
    socket.join(userId);
  });
  socket.on("send-message", (message) => {
    socket
      .to(message.members[0])
      .to(message.members[1])
      .emit("received-message", message);
  });
  socket.on("clear-unread-messages", (data) => {
    io.to(data.members[0])
      .to(data.members[1])
      .emit("message-count-cleared", data);
  });

  socket.on("user-typing", (data) => {
    io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
  });

  socket.on("user-login", (userId) => {
    socket.userId = String(userId);
    if (!onlineUsers.includes(socket.userId)) {
      onlineUsers.push(socket.userId);
    }
    io.emit("online-user", onlineUsers);
  });

  socket.on("user-offline", (userId) => {
    const loggedOutUserId = String(userId);
    const userHasOtherConnection = [...io.sockets.sockets.values()].some(
      (connectedSocket) =>
        connectedSocket.id !== socket.id &&
        connectedSocket.userId === loggedOutUserId,
    );

    if (!userHasOtherConnection) {
      onlineUsers = onlineUsers.filter(
        (onlineUserId) => onlineUserId !== loggedOutUserId,
      );
    }

    if (socket.userId === loggedOutUserId) {
      socket.userId = null;
    }

    io.emit("online-user-updated", onlineUsers);
  });
  socket.on("disconnect", () => {
    if (!socket.userId) {
      return;
    }

    const userHasOtherConnection = [...io.sockets.sockets.values()].some(
      (connectedSocket) =>
        connectedSocket.id !== socket.id &&
        connectedSocket.userId === socket.userId,
    );

    if (!userHasOtherConnection) {
      const userIndex = onlineUsers.indexOf(socket.userId);
      if (userIndex !== -1) {
        onlineUsers.splice(userIndex, 1);
      }
    }

    io.emit("online-user", onlineUsers);
  });
});

module.exports = server;
