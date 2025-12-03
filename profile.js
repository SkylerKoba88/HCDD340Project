const profilePic = document.getElementById("profilePicture");
const navProfilePic = document.getElementById("navProfilePic");
const changeBtn = document.getElementById("changePictureBtn");
const cameraModal = document.getElementById("cameraModal");
const cameraStream = document.getElementById("cameraStream");
const cameraCanvas = document.getElementById("cameraCanvas");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const closeCameraBtn = document.getElementById("closeCameraBtn");

let stream;

// Open camera modal
changeBtn.addEventListener("click", async () => {
  cameraModal.style.display = "flex";

  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  cameraStream.srcObject = stream;
});

// Take picture
takePhotoBtn.addEventListener("click", () => {
  const context = cameraCanvas.getContext("2d");
  cameraCanvas.width = cameraStream.videoWidth;
  cameraCanvas.height = cameraStream.videoHeight;

  context.drawImage(cameraStream, 0, 0);
  const imageData = cameraCanvas.toDataURL("image/png");

  profilePic.src = imageData;
  navProfilePic.src = imageData;

  stopCamera();
});

// Close modal / stop webcam
closeCameraBtn.addEventListener("click", stopCamera);

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  cameraModal.style.display = "none";
}



// ================== COUNTRY AUTO-DETECTION =================
const countryField = document.getElementById("countryField");

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      countryField.textContent = data.address.country || "Unavailable";
    } catch {
      countryField.textContent = "Unavailable";
    }
  }, () => {
    countryField.textContent = "Permission denied";
  });
} else {
  countryField.textContent = "Not supported";
}


// ==================== AUDIO RECORDING =====================
let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioList = document.getElementById("audioList");

recordBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
    const audioURL = URL.createObjectURL(audioBlob);

    const audioElement = document.createElement("audio");
    audioElement.controls = true;
    audioElement.src = audioURL;

    audioList.appendChild(audioElement);
  };

  mediaRecorder.start();
  recordBtn.style.display = "none";
  stopBtn.style.display = "inline-block";
});

stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  recordBtn.style.display = "inline-block";
  stopBtn.style.display = "none";
});