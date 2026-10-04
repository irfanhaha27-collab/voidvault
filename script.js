const modal = document.getElementById("modal");
const content = document.getElementById("modalContent");
const search = document.getElementById("search");
const cards = [...document.querySelectorAll(".card")];

let cameraStream = null;

function scrollTools(){
  document.getElementById("tools").scrollIntoView({
    behavior:"smooth"
  });
}

function filterTools(type){

  const q = search.value.toLowerCase();

  let count = 0;

  cards.forEach(card => {

    const matchType =
      type === "all" || card.dataset.type === type;

    const matchSearch =
      !q || card.dataset.name.includes(q);

    if(matchType && matchSearch){
      card.style.display = "flex";
      count++;
    }else{
      card.style.display = "none";
    }

  });

  document.getElementById("count").textContent =
    count + " Tools";
}

document.querySelectorAll(".category").forEach(btn => {

  btn.onclick = () => {

    document.querySelectorAll(".category")
      .forEach(x=>x.classList.remove("active"));

    btn.classList.add("active");

    filterTools(btn.dataset.filter);
  };

});

document.querySelectorAll(".nav").forEach(btn => {

  btn.onclick = () => {

    document.querySelectorAll(".nav")
      .forEach(x=>x.classList.remove("active"));

    btn.classList.add("active");

    const type = btn.dataset.filter;

    document.querySelectorAll(".category")
      .forEach(x=>{
        x.classList.toggle(
          "active",
          x.dataset.filter === type
        );
      });

    filterTools(type);
  };

});

search.oninput = () => {

  const active =
    document.querySelector(".category.active");

  filterTools(active.dataset.filter);
};

document.getElementById("hamburger").onclick = () => {
  document.getElementById("sidebar")
    .classList.toggle("open");
};

document.addEventListener("keydown",e=>{

  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==="k"){
    e.preventDefault();
    search.focus();
  }

  if(e.key==="Escape") closeTool();
});

function openTool(type){

  modal.classList.add("show");

  if(type==="counter"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Text Counter</h2>
        <p>Hitung karakter dan kata secara realtime.</p>

        <textarea id="counterText"
        placeholder="Tulis teks di sini..."></textarea>

        <div class="actions">
          <button>Characters: <b id="chars">0</b></button>
          <button>Words: <b id="words">0</b></button>
        </div>
      </div>
    `;

    document.getElementById("counterText").oninput=e=>{

      const text=e.target.value;

      document.getElementById("chars").textContent=
        text.length;

      document.getElementById("words").textContent=
        text.trim()?text.trim().split(/\s+/).length:0;
    };
  }

  if(type==="case"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Case Converter</h2>
        <p>Ubah bentuk teks.</p>

        <textarea id="caseText"></textarea>

        <div class="actions">
          <button onclick="caseUpper()">UPPERCASE</button>
          <button onclick="caseLower()">lowercase</button>
          <button onclick="caseTitle()">Title Case</button>
        </div>
      </div>
    `;
  }

  if(type==="camera"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Live Camera</h2>
        <p>Izinkan akses kamera jika diminta browser.</p>

        <video id="camera"
          class="camera"
          autoplay
          playsinline></video>

        <div class="camera-buttons">
          <button onclick="startCamera()">Start Camera</button>
          <button onclick="stopCamera()">Stop</button>
        </div>
      </div>
    `;

    startCamera();
  }

  if(type==="image"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Image Preview</h2>
        <p>Pilih gambar dari perangkat.</p>

        <input type="file"
          id="imageFile"
          accept="image/*">

        <img id="preview"
          style="width:100%;margin-top:15px;border-radius:12px;display:none">
      </div>
    `;

    document.getElementById("imageFile").onchange=e=>{

      const file=e.target.files[0];

      if(!file)return;

      const img=document.getElementById("preview");

      img.src=URL.createObjectURL(file);
      img.style.display="block";
    };
  }

  if(type==="json"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>JSON Formatter</h2>
        <p>Format JSON secara otomatis.</p>

        <textarea id="jsonInput"
          placeholder='{"hello":"world"}'></textarea>

        <div class="actions">
          <button onclick="formatJSON()">Format JSON</button>
        </div>

        <pre id="jsonOutput"></pre>
      </div>
    `;
  }

  if(type==="base64"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Base64 Encoder</h2>

        <textarea id="baseInput"></textarea>

        <div class="actions">
          <button onclick="encode64()">Encode</button>
          <button onclick="decode64()">Decode</button>
        </div>

        <textarea id="baseOutput"></textarea>
      </div>
    `;
  }

  if(type==="password"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Password Generator</h2>
        <p>Generate password secara lokal.</p>

        <input id="passwordOutput" readonly>

        <div class="actions">
          <button onclick="generatePassword()">Generate</button>
          <button onclick="copyPassword()">Copy</button>
        </div>
      </div>
    `;

    generatePassword();
  }

  if(type==="calculator"){

    content.innerHTML=`
      <div class="tool-window">
        <h2>Calculator</h2>

        <input id="calc"
          placeholder="Contoh: 25 * 4 + 10">

        <div class="actions">
          <button onclick="calculate()">Calculate</button>
        </div>

        <h2 id="answer" style="margin-top:20px">0</h2>
      </div>
    `;
  }
}

function closeTool(){

  stopCamera();

  modal.classList.remove("show");
  content.innerHTML="";
}

modal.onclick=e=>{
  if(e.target===modal)closeTool();
};

function caseUpper(){
  document.getElementById("caseText").value=
    document.getElementById("caseText").value.toUpperCase();
}

function caseLower(){
  document.getElementById("caseText").value=
    document.getElementById("caseText").value.toLowerCase();
}

function caseTitle(){

  const el=document.getElementById("caseText");

  el.value=el.value
    .toLowerCase()
    .replace(/\b\w/g,c=>c.toUpperCase());
}

function formatJSON(){

  try{

    const obj=JSON.parse(
      document.getElementById("jsonInput").value
    );

    document.getElementById("jsonOutput").textContent=
      JSON.stringify(obj,null,2);

  }catch{

    document.getElementById("jsonOutput").textContent=
      "JSON tidak valid.";
  }
}

function encode64(){

  const text=document.getElementById("baseInput").value;

  document.getElementById("baseOutput").value=
    btoa(unescape(encodeURIComponent(text)));
}

function decode64(){

  try{

    const text=document.getElementById("baseInput").value;

    document.getElementById("baseOutput").value=
      decodeURIComponent(escape(atob(text)));

  }catch{

    document.getElementById("baseOutput").value=
      "Base64 tidak valid.";
  }
}

function generatePassword(){

  const chars=
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  let result="";

  for(let i=0;i<18;i++){
    result+=chars[Math.floor(Math.random()*chars.length)];
  }

  document.getElementById("passwordOutput").value=result;
}

function copyPassword(){

  navigator.clipboard.writeText(
    document.getElementById("passwordOutput").value
  );
}

function calculate(){

  const input=document.getElementById("calc").value;

  if(!/^[0-9+\-*/().%\s]+$/.test(input)){
    document.getElementById("answer").textContent="Invalid";
    return;
  }

  try{
    document.getElementById("answer").textContent=
      Function('"use strict";return ('+input+')')();
  }catch{
    document.getElementById("answer").textContent="Invalid";
  }
}

async function startCamera(){

  try{

    if(cameraStream)stopCamera();

    cameraStream=
      await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:"environment"
        },
        audio:false
      });

    const video=document.getElementById("camera");

    if(video){
      video.srcObject=cameraStream;
    }

  }catch{

    alert(
      "Kamera tidak dapat dibuka. Izinkan kamera dan pastikan website menggunakan HTTPS."
    );
  }
}

function stopCamera(){

  if(cameraStream){

    cameraStream.getTracks()
      .forEach(track=>track.stop());

    cameraStream=null;
  }
}

filterTools("all");
