/* =================================
   VOIDVAULT // LIVE CAMERA
================================= */

const camera = document.getElementById("camera");
const canvas = document.getElementById("canvas");

const startButton = document.getElementById("startButton");
const captureButton = document.getElementById("captureButton");
const switchButton = document.getElementById("switchButton");
const stopButton = document.getElementById("stopButton");

const retakeButton = document.getElementById("retakeButton");
const downloadButton = document.getElementById("downloadButton");

const previewSection = document.getElementById("previewSection");
const placeholder = document.getElementById("cameraPlaceholder");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const message = document.getElementById("message");

let stream = null;
let currentFacingMode = "environment";

/* ===============================
   START CAMERA
================================ */

async function startCamera() {

  try {

    stopCamera();

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: currentFacingMode
        },
        width: {
          ideal: 1920
        },
        height: {
          ideal: 1080
        }
      },
      audio: false
    });

    camera.srcObject = stream;

    await camera.play();

    camera.style.display = "block";
    placeholder.style.display = "none";

    statusDot.classList.add("live");
    statusText.textContent = "LIVE";

    captureButton.disabled = false;
    switchButton.disabled = false;
    stopButton.disabled = false;

    startButton.textContent = "Restart Camera";

    message.textContent = "Camera aktif.";

  } catch (error) {

    console.error(error);

    camera.style.display = "none";
    placeholder.style.display = "flex";

    statusDot.classList.remove("live");
    statusText.textContent = "OFFLINE";

    captureButton.disabled = true;
    switchButton.disabled = true;
    stopButton.disabled = true;

    if (error.name === "NotAllowedError") {

      message.textContent =
        "Izin kamera ditolak. Izinkan kamera di browser.";

    } else if (error.name === "NotFoundError") {

      message.textContent =
        "Kamera tidak ditemukan.";

    } else {

      message.textContent =
        "Kamera tidak dapat dibuka.";
    }
  }
}

/* ===============================
   STOP CAMERA
================================ */

function stopCamera() {

  if (stream) {

    stream.getTracks().forEach(track => {
      track.stop();
    });

    stream = null;
  }

  camera.srcObject = null;

  captureButton.disabled = true;
  switchButton.disabled = true;
  stopButton.disabled = true;

  statusDot.classList.remove("live");
  statusText.textContent = "OFFLINE";
}

/* ===============================
   CAPTURE
================================ */

function capturePhoto() {

  if (!stream) return;

  if (!camera.videoWidth || !camera.videoHeight) {
    message.textContent = "Tunggu kamera siap.";
    return;
  }

  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;

  const context = canvas.getContext("2d");

  context.drawImage(
    camera,
    0,
    0,
    canvas.width,
    canvas.height
  );

  previewSection.classList.remove("hidden");

  const imageData =
    canvas.toDataURL("image/jpeg", 0.95);

  downloadButton.href = imageData;
  downloadButton.download =
    "voidvault-photo-" + Date.now() + ".jpg";

  message.textContent = "Foto berhasil diambil.";

  previewSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* ===============================
   SWITCH CAMERA
================================ */

async function switchCamera() {

  if (!navigator.mediaDevices) return;

  currentFacingMode =
    currentFacingMode === "environment"
      ? "user"
      : "environment";

  await startCamera();
}

/* ===============================
   RETAKE
================================ */

function retakePhoto() {

  previewSection.classList.add("hidden");

  message.textContent =
    "Siap mengambil foto lagi.";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ===============================
   BUTTON EVENTS
================================ */

startButton.addEventListener(
  "click",
  startCamera
);

captureButton.addEventListener(
  "click",
  capturePhoto
);

switchButton.addEventListener(
  "click",
  switchCamera
);

stopButton.addEventListener(
  "click",
  () => {

    stopCamera();

    camera.style.display = "none";
    placeholder.style.display = "flex";

    message.textContent =
      "Camera stopped.";
  }
);

retakeButton.addEventListener(
  "click",
  retakePhoto
);

/* ===============================
   CLEANUP
================================ */

window.addEventListener(
  "pagehide",
  stopCamera
);
