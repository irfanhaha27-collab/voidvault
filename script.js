const modal = document.getElementById("modal");
const content = document.getElementById("content");
const search = document.getElementById("search");

function openTool(html){
  content.innerHTML = html;
  modal.style.display = "flex";
}

function closeTool(){
  modal.style.display = "none";

  if(window.cameraStream){
    window.cameraStream.getTracks().forEach(track => track.stop());
    window.cameraStream = null;
  }
}

modal.onclick = function(e){
  if(e.target === modal) closeTool();
};

function camera(){
  openTool(`
    <h2>📷 Live Camera</h2>
    <video id="camera" autoplay playsinline></video>
    <br><br>
    <button class="action" onclick="startCamera()">Start Camera</button>
    <p id="cameraStatus"></p>
  `);
}

async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:false
    });

    window.cameraStream = stream;

    document.getElementById("camera").srcObject = stream;
    document.getElementById("cameraStatus").textContent =
      "Camera aktif.";
  }catch(error){
    document.getElementById("cameraStatus").textContent =
      "Camera tidak bisa dibuka. Izinkan akses kamera.";
  }
}

function counter(){
  openTool(`
    <h2>📝 Word Counter</h2>
    <textarea id="counterText" placeholder="Tulis teks..."></textarea>
    <p>Words: <b id="wordCount">0</b></p>
    <p>Characters: <b id="charCount">0</b></p>
  `);

  const textarea = document.getElementById("counterText");

  textarea.oninput = function(){
    const text = textarea.value.trim();

    document.getElementById("wordCount").textContent =
      text ? text.split(/\s+/).length : 0;

    document.getElementById("charCount").textContent =
      textarea.value.length;
  };
}

function textCase(){
  openTool(`
    <h2>Aa Text Case</h2>
    <textarea id="caseText" placeholder="Masukkan teks..."></textarea>
    <button class="action" onclick="makeUpper()">UPPERCASE</button>
    <button class="action" onclick="makeLower()">lowercase</button>
    <button class="action" onclick="makeTitle()">Title Case</button>
  `);
}

function makeUpper(){
  document.getElementById("caseText").value =
    document.getElementById("caseText").value.toUpperCase();
}

function makeLower(){
  document.getElementById("caseText").value =
    document.getElementById("caseText").value.toLowerCase();
}

function makeTitle(){
  document.getElementById("caseText").value =
    document.getElementById("caseText").value
      .toLowerCase()
      .replace(/\b\w/g, x => x.toUpperCase());
}

function jsonTool(){
  openTool(`
    <h2>{ } JSON Formatter</h2>
    <textarea id="jsonText" placeholder='{"name":"VoidVault"}'></textarea>
    <button class="action" onclick="formatJSON()">Format JSON</button>
  `);
}

function formatJSON(){
  const textarea = document.getElementById("jsonText");

  try{
    textarea.value =
      JSON.stringify(JSON.parse(textarea.value), null, 2);
  }catch{
    alert("JSON tidak valid.");
  }
}

function password(){
  openTool(`
    <h2>🔐 Password Generator</h2>
    <input id="passwordLength" type="number" value="16" min="4" max="64">
    <br>
    <button class="action" onclick="generatePassword()">
      Generate
    </button>
    <input id="passwordResult" readonly>
  `);
}

function generatePassword(){
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  const length =
    Number(document.getElementById("passwordLength").value);

  let result = "";

  for(let i = 0; i < length; i++){
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  document.getElementById("passwordResult").value = result;
}

function calculator(){
  openTool(`
    <h2>＋ Calculator</h2>
    <input id="calcInput" placeholder="Contoh: 10*5+2">
    <button class="action" onclick="calculate()">Calculate</button>
    <h2 id="calcResult"></h2>
  `);
}

function calculate(){
  const input = document.getElementById("calcInput").value;

  if(!/^[0-9+\-*/().%\s]+$/.test(input)){
    document.getElementById("calcResult").textContent =
      "Input tidak valid";
    return;
  }

  try{
    document.getElementById("calcResult").textContent =
      Function("return " + input)();
  }catch{
    document.getElementById("calcResult").textContent =
      "Error";
  }
}

search.oninput = function(){
  const query = search.value.toLowerCase();

  document.querySelectorAll(".grid button").forEach(button => {
    button.style.display =
      button.innerText.toLowerCase().includes(query)
        ? ""
        : "none";
  });
};
