const modal = document.getElementById("modal");
const content = document.getElementById("modalContent");
const search = document.getElementById("search");
const cards = [...document.querySelectorAll(".card")];

let cameraStream = null;
let currentFilter = "all";

function scrollTools(){
  document.getElementById("tools").scrollIntoView({
    behavior:"smooth"
  });
}

function filterTools(type = currentFilter){
  currentFilter = type;

  const q = search.value.toLowerCase().trim();
  let count = 0;

  cards.forEach(card => {
    const matchType =
      type === "all" || card.dataset.type === type;

    const matchSearch =
      !q || card.dataset.name.toLowerCase().includes(q);

    if(matchType && matchSearch){
      card.style.display = "flex";
      count++;
    }else{
      card.style.display = "none";
    }
  });

  document.getElementById("count").textContent = count;

  document.getElementById("empty").style.display =
    count === 0 ? "block" : "none";
}

document.querySelectorAll(".category").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");
    filterTools(btn.dataset.filter);
  });
});

document.querySelectorAll(".nav").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".nav")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    filterTools(btn.dataset.filter);

    document.querySelectorAll(".category")
      .forEach(x => {
        x.classList.toggle(
          "active",
          x.dataset.filter === btn.dataset.filter
        );
      });

    if(window.innerWidth <= 750){
      document.getElementById("sidebar")
        .classList.remove("open");
    }
  });
});

search.addEventListener("input", () => {
  filterTools();
});

document.addEventListener("keydown", e => {
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
    e.preventDefault();
    search.focus();
  }

  if(e.key === "Escape"){
    closeModal();
  }
});

document.getElementById("hamburger")
  .addEventListener("click", () => {
    document.getElementById("sidebar")
      .classList.toggle("open");
  });

document.getElementById("theme")
  .addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

function openTool(type){

  let html = "";

  if(type === "word"){
    html = `
      <h2 class="tool-title">Word Counter</h2>
      <p class="tool-desc">Hitung kata dan karakter dari teks kamu.</p>
      <textarea id="toolText" class="tool-area"
        placeholder="Tulis atau paste teks di sini..."></textarea>
      <p id="wordResult" style="margin-top:15px;color:#9b8cff">
        0 kata • 0 karakter
      </p>
    `;

    setTimeout(() => {
      document.getElementById("toolText")
        .addEventListener("input", e => {
          const text = e.target.value;
          const words = text.trim()
            ? text.trim().split(/\s+/).length
            : 0;

          document.getElementById("wordResult").textContent =
            `${words} kata • ${text.length} karakter`;
        });
    },50);
  }

  else if(type === "case"){
    html = `
      <h2 class="tool-title">Text Case</h2>
      <p class="tool-desc">Ubah format teks dengan cepat.</p>
      <textarea id="caseText" class="tool-area"
        placeholder="Masukkan teks..."></textarea>
      <button class="tool-btn" onclick="changeCase('upper')">UPPERCASE</button>
      <button class="tool-btn" onclick="changeCase('lower')">lowercase</button>
      <button class="tool-btn" onclick="changeCase('title')">Title Case</button>
    `;
  }

  else if(type === "spaces"){
    html = `
      <h2 class="tool-title">Remove Spaces</h2>
      <p class="tool-desc">Hilangkan spasi berlebihan.</p>
      <textarea id="spaceText" class="tool-area"
        placeholder="Masukkan teks..."></textarea>
      <button class="tool-btn" onclick="removeSpaces()">Clean Text</button>
    `;
  }

  else if(type === "json"){
    html = `
      <h2 class="tool-title">JSON Formatter</h2>
      <p class="tool-desc">Rapikan JSON kamu.</p>
      <textarea id="jsonText" class="tool-area"
        placeholder='{"hello":"world"}'></textarea>
      <button class="tool-btn" onclick="formatJSON()">Format JSON</button>
    `;
  }

  else if(type === "base64"){
    html = `
      <h2 class="tool-title">Base64 Encoder</h2>
      <p class="tool-desc">Encode teks menjadi Base64.</p>
      <textarea id="baseText" class="tool-area"
        placeholder="Masukkan teks..."></textarea>
      <button class="tool-btn" onclick="encodeBase64()">Encode</button>
      <button class="tool-btn" onclick="decodeBase64()">Decode</button>
    `;
  }

  else if(type === "url"){
    html = `
      <h2 class="tool-title">URL Encoder</h2>
      <p class="tool-desc">Encode atau decode URL.</p>
      <textarea id="urlText" class="tool-area"
        placeholder="https://example.com/hello world"></textarea>
      <button class="tool-btn" onclick="encodeURL()">Encode</button>
      <button class="tool-btn" onclick="decodeURL()">Decode</button>
    `;
  }

  else if(type === "password"){
    html = `
      <h2 class="tool-title">Password Generator</h2>
      <p class="tool-desc">Buat password acak.</p>
      <input id="passResult" class="tool-input" readonly>
      <button class="tool-btn" onclick="generatePassword()">Generate</button>
    `;
  }

  else if(type === "calculator"){
    html = `
      <h2 class="tool-title">Calculator</h2>
      <p class="tool-desc">Kalkulator sederhana.</p>
      <input id="calc" class="tool-input"
        placeholder="Contoh: 25 * 4 + 10">
      <button class="tool-btn" onclick="calculate()">Calculate</button>
      <p id="calcResult" style="margin-top:15px"></p>
    `;
  }

  else if(type === "camera"){
    html = `
      <h2 class="tool-title">Live Camera</h2>
      <p class="tool-desc">Kamera berjalan langsung dari browser.</p>
      <video id="cameraVideo" class="camera" autoplay playsinline></video>
      <button class="tool-btn" onclick="startCamera()">Start Camera</button>
      <button class="tool-btn" onclick="stopCamera()">Stop Camera</button>
    `;
  }

  else if(type === "image" || type === "preview"){
    html = `
      <h2 class="tool-title">Image Preview</h2>
      <p class="tool-desc">Pilih gambar untuk melihat preview.</p>
      <input id="imageInput" class="tool-input"
        type="file" accept="image/*">
      <img id="imagePreview"
        style="display:none;width:100%;border-radius:12px;margin-top:10px;">
    `;

    setTimeout(() => {
      document.getElementById("imageInput")
        .addEventListener("change", e => {
          const file = e.target.files[0];
          if(!file) return;

          const img = document.getElementById("imagePreview");
          img.src = URL.createObjectURL(file);
          img.style.display = "block";
        });
    },50);
  }

  else if(type === "qr"){
    html = `
      <h2 class="tool-title">QR Generator</h2>
      <p class="tool-desc">Generator QR sederhana.</p>
      <input id="qrText" class="tool-input"
        placeholder="Masukkan teks atau URL">
      <button class="tool-btn" onclick="generateQR()">Generate QR</button>
      <div id="qrResult" style="margin-top:20px;text-align:center"></div>
    `;
  }

  content.innerHTML = html;
  modal.classList.add("show");
}

function closeModal(){
  stopCamera();
  modal.classList.remove("show");
}

modal.addEventListener("click", e => {
  if(e.target === modal) closeModal();
});

function changeCase(type){
  const el = document.getElementById("caseText");

  if(type === "upper") el.value = el.value.toUpperCase();
  if(type === "lower") el.value = el.value.toLowerCase();

  if(type === "title"){
    el.value = el.value.toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}

function removeSpaces(){
  const el = document.getElementById("spaceText");
  el.value = el.value.replace(/\s+/g," ").trim();
}

function formatJSON(){
  const el = document.getElementById("jsonText");

  try{
    el.value = JSON.stringify(
      JSON.parse(el.value),
      null,
      2
    );
  }catch{
    alert("JSON tidak valid.");
  }
}

function encodeBase64(){
  const el = document.getElementById("baseText");
  el.value = btoa(unescape(encodeURIComponent(el.value)));
}

function decodeBase64(){
  const el = document.getElementById("baseText");

  try{
    el.value = decodeURIComponent(
      escape(atob(el.value))
    );
  }catch{
    alert("Base64 tidak valid.");
  }
}

function encodeURL(){
  const el = document.getElementById("urlText");
  el.value = encodeURIComponent(el.value);
}

function decodeURL(){
  const el = document.getElementById("urlText");

  try{
    el.value = decodeURIComponent(el.value);
  }catch{
    alert("URL tidak valid.");
  }
}

function generatePassword(){
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let result = "";

  for(let i=0;i<18;i++){
    result += chars[Math.floor(Math.random()*chars.length)];
  }

  document.getElementById("passResult").value = result;
}

function calculate(){
  const input = document.getElementById("calc").value;

  try{
    if(!/^[0-9+\-*/().%\s]+$/.test(input)){
      throw new Error();
    }

    const result = Function(
      `"use strict"; return (${input})`
    )();

    document.getElementById("calcResult").textContent =
      "Hasil: " + result;

  }catch{
    document.getElementById("calcResult").textContent =
      "Perhitungan tidak valid.";
  }
}

function startCamera(){

  const video = document.getElementById("cameraVideo");

  if(!navigator.mediaDevices ||
     !navigator.mediaDevices.getUserMedia){
    alert("Browser tidak mendukung kamera.");
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video:true,
    audio:false
  })
  .then(stream => {
    cameraStream = stream;
    video.srcObject = stream;
  })
  .catch(() => {
    alert("Akses kamera ditolak atau tidak tersedia.");
  });
}

function stopCamera(){
  if(cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

function generateQR(){

  const text = document.getElementById("qrText").value.trim();

  if(!text){
    alert("Masukkan teks atau URL.");
    return;
  }

  const result = document.getElementById("qrResult");

  result.innerHTML = `
    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}"
      alt="QR Code"
      style="max-width:220px;border-radius:10px;background:white;padding:10px;"
    >
  `;
}

function showAbout(){
  openTool("word");
}

filterTools("all");
