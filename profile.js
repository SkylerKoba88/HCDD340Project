const profilePic = document.getElementById("profilePicture");
const changeBtn = document.getElementById("changePictureBtn");
const cameraModal = document.getElementById("cameraModal");
const cameraStream = document.getElementById("cameraStream");
const cameraCanvas = document.getElementById("cameraCanvas");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const closeCameraBtn = document.getElementById("closeCameraBtn");
const countryField = document.getElementById("countryField");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const audioList = document.getElementById("audioList");

let stream;

// ---- Load saved profile picture ----
const savedPic = localStorage.getItem("profilePicture");
if (savedPic) {
  profilePic.src = savedPic;
}

// ---- Load saved country ----
const savedCountry = localStorage.getItem("country");
if (savedCountry) {
  countryField.textContent = savedCountry;
}

// ---- Load saved audio recordings ----
const savedAudio = JSON.parse(localStorage.getItem("audioClips") || "[]");
savedAudio.forEach(base64 => {
  addAudioClip(base64);
});



/* ======================================================
   PROFILE PICTURE (CAMERA)
====================================================== */

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

  saveProfilePhoto(imageData);
  stopCamera();
});

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    saveProfilePhoto(imageData);
  };
  reader.readAsDataURL(file);
});

// Close modal
closeCameraBtn.addEventListener("click", stopCamera);

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  cameraModal.style.display = "none";
}

//----------------------

const profileImg = document.querySelector(".profile-img");

// Called when photo is captured or uploaded
function saveProfilePhoto(base64Image) {
    localStorage.setItem("profilePicture", base64Image);
    profilePic.src = base64Image;
}


/* ======================================================
   AUTO-DETECT COUNTRY (SAVE LOCALLY)
====================================================== */

function detectCountry() {
  const countrySpan = document.getElementById("countryName");

  if (!navigator.geolocation) {
    countrySpan.textContent = "Unavailable";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    try {
      let response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      let data = await response.json();
      countrySpan.textContent = data.countryName || "Unknown";
    } catch {
      countrySpan.textContent = "Error";
    }
  }, () => {
    countrySpan.textContent = "Permission Denied";
  });
}

detectCountry();



/* ======================================================
   AUDIO RECORDINGS (SAVE IN LOCALSTORAGE)
====================================================== */
let mediaRecorder;
let audioChunks = [];

recordBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result;

      // Create audio element
      // Create container for audio + delete button
const wrapper = document.createElement("div");
wrapper.className = "audio-wrapper";

const audioElement = document.createElement("audio");
audioElement.controls = true;
audioElement.src = base64Audio;

// Create delete button
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.className = "delete-audio-btn";

// When clicked, remove audio from DOM and localStorage
deleteBtn.addEventListener("click", () => {
  // Remove from DOM
  wrapper.remove();

  // Remove from localStorage
  const clips = JSON.parse(localStorage.getItem("audioClips") || "[]");
  const index = clips.indexOf(base64Audio);
  if (index > -1) {
    clips.splice(index, 1);
    localStorage.setItem("audioClips", JSON.stringify(clips));
  }
});

function addAudioClip(base64Audio) {
  const wrapper = document.createElement("div");
  wrapper.className = "audio-wrapper";

  const audioElement = document.createElement("audio");
  audioElement.controls = true;
  audioElement.src = base64Audio;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-audio-btn";

  deleteBtn.addEventListener("click", () => {
    wrapper.remove();

    // Remove from localStorage
    const clips = JSON.parse(localStorage.getItem("audioClips") || "[]");
    const index = clips.indexOf(base64Audio);
    if (index > -1) {
      clips.splice(index, 1);
      localStorage.setItem("audioClips", JSON.stringify(clips));
    }
  });

  wrapper.appendChild(audioElement);
  wrapper.appendChild(deleteBtn);
  audioList.appendChild(wrapper);
}


// ---- SAVE TO LOCALSTORAGE ----
const clips = JSON.parse(localStorage.getItem("audioClips") || "[]");
clips.push(base64Audio);
localStorage.setItem("audioClips", JSON.stringify(clips));
    };
    reader.readAsDataURL(audioBlob);
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
