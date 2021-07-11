const socket = io("/");
const vidGrid = document.getElementById("video-grid");
const myVid = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVid.muted = true;



showChat.addEventListener("click", () => {
  document.querySelector(".header__back").style.display = "block";
  
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  
  document.querySelector(".main__right").style.display = "flex";
  
});

backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

const user = prompt("Enter your name");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVidStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
    
  })
  .then((stream) => {
    myVidStream = stream;
    addVideoStream(myVid, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    vidGrid.append(video);
  });
};

let txt = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (txt.value.length !== 0) {
    socket.emit("message", txt.value);
    txt.value = "";
  }
});

txt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && txt.value.length !== 0) {
    socket.emit("message", txt.value);
    txt.value = "";
  }
});


const muteBtn = document.querySelector("#muteButton");

muteButton.addEventListener("click", () => {
  const enabled = myVidStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVidStream.getAudioTracks()[0].enabled = false;
    html = `<span class="muteDiv"><i class="fas fa-microphone-slash"></i></span>`
     
    muteBtn.classList.toggle("bg__red");
    muteBtn.innerHTML = html;
  } else {
    myVidStream.getAudioTracks()[0].enabled = true;
    html = `<span class="muteDiv"><i class="fas fa-microphone"></i></span>`
    
    muteBtn.classList.toggle("bg__red");
    muteBtn.innerHTML = html;
  }
});

const stopVideo = document.querySelector("#stopVideo");
stopVideo.addEventListener("click", () => {
  const enabled = myVidStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVidStream.getVideoTracks()[0].enabled = false;
    html = `<span class="vidDiv"><i class="fas fa-video-slash"></i></span>`
    
    stopVideo.classList.toggle("bg__red");
    stopVideo.innerHTML = html;
  } else {
    myVidStream.getVideoTracks()[0].enabled = true;
    html = `<span class="vidDiv"><i class="fas fa-video"> </i></span>`
   
    stopVideo.classList.toggle("bg__red");
    stopVideo.innerHTML = html;
  }
});

const inviteBtn = document.querySelector("#inviteButton");

inviteBtn.addEventListener("click", (e) => {
  prompt(
    "Copy the room ID to share with people you want to meet",
    ROOM_ID
  );
});

function okBye(){
  const wrning=confirm("Are you sure you wanna leave the meeting!?");
  if(wrning==true){
    window.location.href=`/..`;
  }
};

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});


