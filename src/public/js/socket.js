const socket = io();
const connectionButton = document.querySelector(".connect-to-server");
const disconnectionButton = document.querySelector(".disconnect-from-server");

// The RoomName for connecting work is fixed to the design
let roomName = "design";
let myPeerConnection;
let isSoloDrawing = true;
let dataChannel;
// Step1. Basic settings for connection

async function initConnection() {
  connectionButton.hidden = true;
  //TODO '25.01.03: disconnecting function will need to be implemented later.
  disconnectionButton.hidden = false;
  makeConnection();
}

async function handleClickConnection(event) {
  event.preventDefault();
  await initConnection();
  socket.emit("join_room", "design");
  isSoloDrawing = false;
}
connectionButton.addEventListener("click", handleClickConnection);

// Step2. Working for Socket connection
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});
socket.on("offer", async (offer) => {
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

//Step3 RTC Connection

//RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [],
  });

  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.ondatachannel = function (event) {
    const channel = event.channel;

    channel.onmessage = function (event) {
      const message = JSON.parse(event.data);
      if (message.type === "draw") {
        executeDrawCommand(message.command);
      }
    };
  };

  dataChannel = myPeerConnection.createDataChannel("drawChannel");

  dataChannel.onopen = function () {
    console.log("Data channel is open");
  };

  dataChannel.onmessage = function (event) {
    const message = JSON.parse(event.data);
    if (message.type === "draw") {
      executeDrawCommand(message.command);
    }
  };
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function sendDrawCommand(command) {
  const message = { type: "draw", command: command };
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(JSON.stringify(message)); // 데이터 채널을 통해 전송
  }
}

function executeDrawCommand(command) {
  const { type, ...params } = command;

  if (type === "brush" || type === "eraser") {
    ctx.strokeStyle = type === "eraser" ? "#fff" : params.color;
    ctx.lineTo(params.x, params.y);
    ctx.stroke();
  } else if (type === "rect") {
    ctx.fillStyle = params.color; // 색상 설정
    ctx.fillRect(params.x, params.y, params.width, params.height); // 사각형 그리기
  }
}
