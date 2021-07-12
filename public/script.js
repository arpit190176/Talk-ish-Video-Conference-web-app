const socket = io("/");
const vidGrid = document.getElementById("video-grid");
const myVid = document.createElement("video");//creating new video tag to show our video
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVid.muted = true;// user mute themselves so that they don't hear themselves back



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
//create peer representing current user
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});
//accessing user's video and audio stream
let myVidStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
    
  })
  .then((stream) => {
    myVidStream = stream;
    addVideoStream(myVid, stream);//display user video to themselves

    peer.on("call", (call) => {//upon joining someone's room we receive a call from them
      call.answer(stream);//stream user's audio and video in the room
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);//diplay other's videos to the user
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
//when someone joins our room
const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);//call the user who joined
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  //Remove video when they leave
  call.on('close',()=>{
    video.remove();
  })
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {//play the video as it loads
    video.play();
    vidGrid.append(video);//add video element to grid
  });
};

let txt = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {//send message using button
  if (txt.value.length !== 0) {//send message in chat area only if it is non-empty
    socket.emit("message", txt.value);
    txt.value = "";
  }
});

txt.addEventListener("keydown", (e) => {//send message by pressing Enter key
  if (e.key === "Enter" && txt.value.length !== 0) {
    socket.emit("message", txt.value);
    txt.value = "";
  }
});


const muteBtn = document.querySelector("#muteButton");

muteButton.addEventListener("click", () => {
  const enabled = myVidStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVidStream.getAudioTracks()[0].enabled = false;//if audio stream is currently enabled then disable it
    html = `<span class="muteDiv"><i class="fas fa-microphone-slash"></i></span>`
     
    muteBtn.classList.toggle("bg__red");//turn the mute button to red colour
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



function okBye(){//redirect to homepage when leaving the meet
  const wrning=confirm("Are you sure you wanna leave the meeting!?");
  if(wrning==true){
    window.location.href=`/..`;
  }
};

const inviteBtn = document.querySelector("#inviteButton");

inviteBtn.addEventListener("click", (e) => {
  prompt(//show a prompt containing the room ID
    "Copy the room ID to share with people you want to meet",
    ROOM_ID
  );
});

socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user"></i> <span> ${
          userName === user ? "You" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});


