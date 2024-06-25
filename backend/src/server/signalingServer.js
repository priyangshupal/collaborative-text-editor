import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import http from "http";

const port = 8081;
const app = express();

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("user is connected");

  socket.broadcast.emit("user-connected", socket.id);

  socket.on("offer", (sdp) => {
    console.log("routing offer");
    socket.broadcast.emit("offer", sdp);
  });

  socket.on("answer", (sdp) => {
    console.log("routing answer");
    socket.broadcast.emit("answer", sdp);
  });

  socket.on("icecandidate", (icecandidate) => {
    console.log("routing ice candidates");
    socket.broadcast.emit("icecandidate", icecandidate);
  });
});

server.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
