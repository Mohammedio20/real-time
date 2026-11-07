const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const server = require("./app");

// Connect to the database .
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE;

mongoose.connect(DB, {}).then(async () => {
  // await Tour.collection.dropIndexes();
  console.log(`Database connection successful`);
});

const listener = server.listen(port, () => {
  console.log(`Listenning on port ${port}...`);
});

// ASYNC ERRORS

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  listener.close(() => {
    process.exit(1);
  });
});
