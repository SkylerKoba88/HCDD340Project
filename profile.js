// =============== PROFILE PICTURE UPLOAD ===================
const changeBtn = document.getElementById("changePictureBtn");
const fileInput = document.getElementById("fileInput");
const profilePic = document.getElementById("profilePicture");

changeBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    profilePic.src = event.target.result;
  };
  reader.readAsDataURL(file);
});


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