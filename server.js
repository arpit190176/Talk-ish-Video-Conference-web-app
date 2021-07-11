const { v4: uuidv4 } = require("uuid");
const express = require("express");
const app = express();
const server = require("http").Server(app);

app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, rsp) => {
  
  rsp.render("homepage")
});

app.get("/newRoom",(req,rsp)=>{ //if a newroom has been requested then append random id to url and redirect
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, rsp) => {
  rsp.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);
