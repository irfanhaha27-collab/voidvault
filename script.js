const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("searchInput");

const cards = [...document.querySelectorAll(".tool-card")];
const categories = [...document.querySelectorAll(".category")];
const navItems = [...document.querySelectorAll(".nav-item")];

function filterTools(category = "all") {
  const search = searchInput.value.toLowerCase().trim();

  let visible = 0;

  cards.forEach(card => {
    const cardCategory = card.dataset.category;
    const name = card.dataset.name;

    const categoryMatch =
      category === "all" || cardCategory === category;

    const searchMatch =
      !search || name.includes(search);

    if (categoryMatch && searchMatch) {
      card.style.display = "flex";
      visible++;
    } else {
      card.style.display = "none";
    }
  });

  document.getElementById("resultCount").textContent =
    `${visible} tools`;
}

categories.forEach(button => {
  button.addEventListener("click", () => {

    categories.forEach(x => x.classList.remove("active"));
    button.classList.add("active");

    filterTools(button.dataset.category);
  });
});

navItems.forEach(button => {
  button.addEventListener("click", () => {

    navItems.forEach(x => x.classList.remove("active"));
    button.classList.add("active");

    categories.forEach(x => {
      x.classList.toggle(
        "active",
        x.dataset.category === button.dataset.category
      );
    });

    filterTools(button.dataset.category);
  });
});

searchInput.addEventListener("input", () => {
  const active =
    document.querySelector(".category.active")?.dataset.category || "all";

  filterTools(active);
});

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchInput.focus();
  }

  if (e.key === "Escape") {
    closeTool();
  }
});

document.getElementById("menuBtn").onclick = () => {
  document.getElementById("sidebar").classList.toggle("open");
};

document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("light");
};

function openTool(type) {

  modal.classList.add("show");

  if (type === "about") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>VoidVault</h2>
        <p>Browser-based toolkit. Tools berjalan langsung di perangkatmu.</p>
      </div>
    `;
    return;
  }

  if (type === "counter") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Text Counter</h2>
        <p>Masukkan teks untuk menghitung jumlah karakter dan kata.</p>

        <textarea id="counterText" placeholder="Tulis sesuatu..."></textarea>

        <div class="stats">
          <div>
            <strong id="chars">0</strong>
            <span>Characters</span>
          </div>
          <div>
            <strong id="words">0</strong>
            <span>Words</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById("counterText").addEventListener("input", e => {

      const text = e.target.value;

      document.getElementById("chars").textContent =
        text.length;

      document.getElementById("words").textContent =
        text.trim() ? text.trim().split(/\s+/).length : 0;
    });

    return;
  }

  if (type === "case") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Case Converter</h2>
        <p>Convert text dengan satu klik.</p>

        <textarea id="caseText"></textarea>

        <div class="tool-actions">
          <button onclick="convertCase('upper')">UPPERCASE</button>
          <button onclick="convertCase('lower')">lowercase</button>
          <button onclick="convertCase('title')">Title Case</button>
        </div>
      </div>
    `;
    return;
  }

  if (type === "camera") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Live Camera</h2>
        <p>Izinkan akses kamera ketika browser memintanya.</p>

        <video id="camera" class="camera" autoplay playsinline></video>

        <div class="camera-controls">
          <button onclick="startCamera()">Start Camera</button>
          <button onclick="stopCamera()">Stop</button>
        </div>
      </div>
    `;

    startCamera();
    return;
  }

  if (type === "image") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Image Preview</h2>
        <p>Pilih gambar dari perangkatmu.</p>

        <input type="file" id="imageFile" accept="image/*">

        <img id="imagePreview"
             style="width:100%;margin-top:15px;border-radius:10px;display:none;">
      </div>
    `;

    document.getElementById("imageFile").onchange = e => {

      const file = e.target.files[0];

      if (!file) return;

      const img = document.getElementById("imagePreview");

      img.src = URL.createObjectURL(file);
      img.style.display = "block";
    };

    return;
  }

  if (type === "json") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>JSON Formatter</h2>
        <p>Paste JSON kemudian tekan Format.</p>

        <textarea id="jsonText"
          placeholder='{"hello":"world"}'></textarea>

        <div class="tool-actions">
          <button onclick="formatJSON()">Format JSON</button>
        </div>

        <pre id="jsonResult"></pre>
      </div>
    `;
    return;
  }

  if (type === "base64") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Base64 Encoder</h2>

        <textarea id="baseText"
          placeholder="Masukkan teks..."></textarea>

        <div class="tool-actions">
          <button onclick="encodeBase64()">Encode</button>
          <button onclick="decodeBase64()">Decode</button>
        </div>

        <textarea id="baseResult"></textarea>
      </div>
    `;
    return;
  }

  if (type === "password") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Password Generator</h2>
        <p>Generator lokal di browser.</p>

        <input id="passwordResult" readonly>

        <div class="tool-actions">
          <button onclick="generatePassword()">Generate</button>
          <button onclick="copyText('passwordResult')">Copy</button>
        </div>
      </div>
    `;

    generatePassword();
    return;
  }

  if (type === "calculator") {
    modalContent.innerHTML = `
      <div class="tool-window">
        <h2>Calculator</h2>

        <input id="calcInput"
          placeholder="Contoh: 25 * 4 + 10">

        <div class="tool-actions">
          <button onclick="calculate()">Calculate</button>
        </div>

        <h2 id="calcResult" style="margin-top:20px;">0</h2>
      </div>
    `;
  }
}

function closeTool() {

  stopCamera();

  modal.classList.remove("show");
  modalContent.innerHTML = "";
}

modal.addEventListener("click", e => {
  if (e.target === modal) closeTool();
});

function convertCase(type) {

  const input = document.getElementById("caseText");

  if (type === "upper")
    input.value = input.value.toUpperCase();

  if (type === "lower")
    input.value = input.value.toLowerCase();

  if (type === "title") {
    input.value = input.value
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

function formatJSON() {

  const input = document.getElementById("jsonText");
  const result = document.getElementById("jsonResult");

  try {

    const parsed = JSON.parse(input.value);

    result.textContent =
      JSON.stringify(parsed, null, 2);

  } catch {
    result.textContent = "JSON tidak valid.";
  }
}

function encodeBase64() {

  const text = document.getElementById("baseText").value;

  document.getElementById("baseResult").value =
    btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64() {

  try {

    const text =
      document.getElementById("baseText").value;

    document.getElementById("baseResult").value =
      decodeURIComponent(
        escape(atob(text))
      );

  } catch {

    document.getElementById("baseResult").value =
      "Base64 tidak valid.";
  }
}

function generatePassword() {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let result = "";

  for (let i = 0; i < 18; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  document.getElementById("passwordResult").value = result;
}

function copyText(id) {

  const input = document.getElementById(id);

  navigator.clipboard.writeText(input.value);
}

function calculate() {

  const input =
    document.getElementById("calcInput").value;

  const result =
    document.getElementById("calcResult");

  try {

    // Kalkulator sederhana, hanya karakter matematika.
    if (!/^[0-9+\-*/().%\s]+$/.test(input)) {
      throw new Error();
    }

    result.textContent = Function(
      `"use strict"; return (${input})`
    )();

  } catch {

    result.textContent = "Input tidak valid.";
  }
}

let cameraStream = null;

async function startCamera() {

  try {

    if (cameraStream) stopCamera();

    cameraStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });

    const video =
      document.getElementById("camera");

    if (video) {
      video.srcObject = cameraStream;
    }

  } catch (error) {

    alert(
      "Kamera tidak bisa dibuka. Pastikan izin kamera diberikan dan situs menggunakan HTTPS."
    );
  }
}

function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }
}

filterTools("all");
