const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (username) => {
    if (!onlineUsers.includes(username)) onlineUsers.push(username);
    io.emit("updateOnline", onlineUsers);
  });

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
