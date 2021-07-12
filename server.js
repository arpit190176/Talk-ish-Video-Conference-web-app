const { v4: uuidv4 } = require("uuid");
const express = require("express");
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

app.set("view engine", "ejs");  //Indicating express that ejs is being used

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);
app.use(express.static("public")); //pull client script from public folder

//send user to the homepage 
app.get("/", (req, rsp) => {
  
  rsp.render("homepage")
});

 // newroom requested => then append random ID to url and redirect
app.get("/newRoom",(req,rsp)=>{ 
  rsp.redirect(`/${uuidv4()}`);
});

//if a particular room is joined then render it
app.get("/:room", (req, rsp) => {
  rsp.render("room", { roomId: req.params.room });
});

//user connecting to server
io.on("connection", (socket) => {
  //attempt to join the room
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId); //join the room
    socket.to(roomId).broadcast.emit("user-connected", userId); //indicate other members of the room someone has joined
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen(process.env.PORT || 3030);
