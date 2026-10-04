/* =========================
   VOIDVAULT V5
   Main Application
========================= */

const $ = id => document.getElementById(id);

const STORAGE = {
  notes: "vv5_notes",
  tasks: "vv5_tasks",
  vault: "vv5_vault",
  activity: "vv5_activity",
  theme: "vv5_theme"
};


/* =========================
   STORAGE
========================= */

function load(key, fallback = []) {

  try {
    return JSON.parse(
      localStorage.getItem(key)
    ) || fallback;

  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


/* =========================
   SAFE HTML
========================= */

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   TOAST
========================= */

let toastTimer;

function toast(message) {

  const box = $("toast");

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 1800);
}


/* =========================
   ACTIVITY
========================= */

function addActivity(text) {

  const activity =
    load(STORAGE.activity);

  activity.unshift({
    text,
    time: new Date().toLocaleString("id-ID")
  });

  save(
    STORAGE.activity,
    activity.slice(0, 20)
  );

  renderActivity();
}

function renderActivity() {

  const box = $("activityList");

  if (!box) return;

  const activity =
    load(STORAGE.activity);

  if (!activity.length) {

    box.innerHTML =
      `<div class="empty">No activity yet.</div>`;

    return;
  }

  box.innerHTML = activity.map(item => `
    <div class="activity">
      ${escapeHTML(item.text)}
      <small>${escapeHTML(item.time)}</small>
    </div>
  `).join("");
}

$("clearActivity").onclick = () => {

  localStorage.removeItem(
    STORAGE.activity
  );

  renderActivity();
  toast("Activity cleared");
};


/* =========================
   DATE
========================= */

function updateDate() {

  $("dateText").textContent =
    new Date().toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
}


/* =========================
   STATS
========================= */

function updateStats() {

  $("vaultCount").textContent =
    load(STORAGE.vault).length;

  $("noteCount").textContent =
    load(STORAGE.notes).length;

  $("taskCount").textContent =
    load(STORAGE.tasks)
      .filter(t => !t.done)
      .length;
}


/* =========================
   MODAL
========================= */

function openModal(html) {

  $("modalContent").innerHTML = html;
  $("modal").classList.remove("hidden");
}

function closeModal() {

  stopCamera();

  $("modal").classList.add("hidden");
}

$("closeModal").onclick =
  closeModal;

$("modal").addEventListener(
  "click",
  e => {

    if (e.target === $("modal")) {
      closeModal();
    }

  }
);


/* =========================
   CALCULATOR
========================= */

function calculator() {

  openModal(`
    <h2>🧮 Calculator</h2>

    <p style="color:var(--muted)">
      Basic calculator.
    </p>

    <input
      id="calcInput"
      class="form-input"
      placeholder="Example: 12 * 8 + 5"
      inputmode="decimal"
    >

    <button id="calcButton" class="primary">
      Calculate
    </button>

    <h2 id="calcResult"></h2>
  `);

  $("calcButton").onclick = () => {

    const expression =
      $("calcInput").value.trim();

    if (
      !/^[0-9+\-*/().%\s]+$/
        .test(expression)
    ) {

      $("calcResult")
        .textContent =
        "Input tidak valid.";

      return;
    }

    try {

      const result =
        Function(
          `"use strict"; return (${expression})`
        )();

      $("calcResult")
        .textContent = `= ${result}`;

      addActivity(
        "Used Calculator"
      );

    } catch {

      $("calcResult")
        .textContent =
        "Tidak bisa dihitung.";
    }
  };
}


/* =========================
   NOTES
========================= */

function notes() {

  openModal(`

    <h2>📝 Quick Notes</h2>

    <input
      id="noteTitle"
      class="form-input"
      placeholder="Note title"
    >

    <textarea
      id="noteText"
      class="form-textarea"
      placeholder="Write something..."
    ></textarea>

    <button id="saveNote" class="primary">
      Save Note
    </button>

    <div
      id="notesList"
      style="margin-top:18px"
    ></div>
  `);

  renderNotes();

  $("saveNote").onclick = () => {

    const title =
      $("noteTitle").value.trim();

    const text =
      $("noteText").value.trim();

    if (!text) {
      toast("Tulis catatan dulu.");
      return;
    }

    const data =
      load(STORAGE.notes);

    data.unshift({
      id: Date.now(),
      title: title || "Untitled",
      text
    });

    save(STORAGE.notes, data);

    $("noteTitle").value = "";
    $("noteText").value = "";

    renderNotes();
    updateStats();

    addActivity(
      "Created a note"
    );

    toast("Note saved");
  };
}


function renderNotes() {

  const box = $("notesList");

  if (!box) return;

  const data =
    load(STORAGE.notes);

  if (!data.length) {

    box.innerHTML =
      `<div class="empty">No notes yet.</div>`;

    return;
  }

  box.innerHTML = data.map(note => `

    <div class="activity">

      <b>${escapeHTML(note.title)}</b>

      <small>
        ${escapeHTML(note.text)}
      </small>

      <button
        class="tool-row"
        style="margin-top:8px;color:var(--danger)"
        onclick="deleteNote(${note.id})"
      >
        Delete
      </button>

    </div>

  `).join("");
}


function deleteNote(id) {

  const data =
    load(STORAGE.notes)
      .filter(n => n.id !== id);

  save(STORAGE.notes, data);

  renderNotes();
  updateStats();

  toast("Note deleted");
}


/* =========================
   TASKS
========================= */

function tasks() {

  openModal(`

    <h2>✓ Tasks</h2>

    <input
      id="taskInput"
      class="form-input"
      placeholder="New task..."
    >

    <button id="addTask" class="primary">
      Add Task
    </button>

    <div
      id="tasksList"
      style="margin-top:18px"
    ></div>
  `);

  renderTasks();

  $("addTask").onclick = () => {

    const input =
      $("taskInput");

    const text =
      input.value.trim();

    if (!text) return;

    const data =
      load(STORAGE.tasks);

    data.unshift({
      id: Date.now(),
      text,
      done: false
    });

    save(STORAGE.tasks, data);

    input.value = "";

    renderTasks();
    updateStats();

    addActivity(
      "Added a task"
    );
  };
}


function renderTasks() {

  const box =
    $("tasksList");

  if (!box) return;

  const data =
    load(STORAGE.tasks);

  if (!data.length) {

    box.innerHTML =
      `<div class="empty">No tasks yet.</div>`;

    return;
  }

  box.innerHTML = data.map(task => `

    <div class="activity">

      <label style="
        display:flex;
        align-items:center;
        gap:10px;
      ">

        <input
          type="checkbox"
          ${task.done ? "checked" : ""}
          onchange="toggleTask(${task.id})"
        >

        <span style="
          ${task.done
            ? "text-decoration:line-through;opacity:.5"
            : ""}
        ">
          ${escapeHTML(task.text)}
        </span>

      </label>

      <button
        class="tool-row"
        style="
          margin-top:8px;
          color:var(--danger)
        "
        onclick="deleteTask(${task.id})"
      >
        Delete
      </button>

    </div>

  `).join("");
}


function toggleTask(id) {

  const data =
    load(STORAGE.tasks);

  const task =
    data.find(t => t.id === id);

  if (task) {
    task.done = !task.done;
  }

  save(STORAGE.tasks, data);

  renderTasks();
  updateStats();
}


function deleteTask(id) {

  const data =
    load(STORAGE.tasks)
      .filter(t => t.id !== id);

  save(STORAGE.tasks, data);

  renderTasks();
  updateStats();

  toast("Task deleted");
}


/* =========================
   VAULT
========================= */

function vault() {

  openModal(`

    <h2>🔐 Vault</h2>

    <p style="color:var(--muted)">
      Private local vault.
    </p>

    <input
      id="vaultTitle"
      class="form-input"
      placeholder="Item title"
      autocomplete="off"
    >

    <textarea
      id="vaultSecret"
      class="form-textarea"
      placeholder="Private data..."
      autocomplete="off"
    ></textarea>

    <button
      id="addVault"
      class="primary"
    >
      + Add to Vault
    </button>

    <div
      id="vaultList"
      style="margin-top:18px"
    ></div>
  `);

  renderVault();

  $("addVault").onclick = () => {

    const title =
      $("vaultTitle").value.trim();

    const secret =
      $("vaultSecret").value.trim();

    if (!title || !secret) {
      toast("Isi semua field dulu.");
      return;
    }

    const data =
      load(STORAGE.vault);

    data.unshift({
      id: Date.now(),
      title,
      secret,
      created:
        new Date().toLocaleString("id-ID")
    });

    save(STORAGE.vault, data);

    $("vaultTitle").value = "";
    $("vaultSecret").value = "";

    renderVault();
    updateStats();

    addActivity(
      `Added "${title}" to Vault`
    );

    toast("Vault saved");
  };
}


function renderVault() {

  const box =
    $("vaultList");

  if (!box) return;

  const data =
    load(STORAGE.vault);

  if (!data.length) {

    box.innerHTML =
      `<div class="empty">
        🔒 Vault is empty.
      </div>`;

    return;
  }

  box.innerHTML = data.map(item => `

    <div class="activity">

      <b>
        🔐 ${escapeHTML(item.title)}
      </b>

      <small>
        ${escapeHTML(item.created || "")}
      </small>

      <div
        id="secret-${item.id}"
        style="
          display:none;
          margin-top:10px;
          padding:10px;
          border-radius:10px;
          background:rgba(255,255,255,.05);
          word-break:break-word;
        "
      >
        ${escapeHTML(item.secret)}
      </div>

      <div style="
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:10px;
      ">

        <button
          class="tool-row"
          onclick="toggleVaultSecret(${item.id})"
        >
          👁 Show
        </button>

        <button
          class="tool-row"
          onclick="copyVaultSecret(${item.id})"
        >
          📋 Copy
        </button>

        <button
          class="tool-row"
          onclick="editVault(${item.id})"
        >
          ✏ Edit
        </button>

        <button
          class="tool-row"
          style="color:var(--danger)"
          onclick="deleteVault(${item.id})"
        >
          🗑 Delete
        </button>

      </div>

    </div>

  `).join("");
}


function toggleVaultSecret(id) {

  const box =
    $(`secret-${id}`);

  if (!box) return;

  const hidden =
    box.style.display === "none";

  box.style.display =
    hidden ? "block" : "none";

  const button =
    box.parentElement
      .querySelector(".tool-row");

  if (button) {

    button.textContent =
      hidden
        ? "🙈 Hide"
        : "👁 Show";
  }
}


async function copyVaultSecret(id) {

  const item =
    load(STORAGE.vault)
      .find(v => v.id === id);

  if (!item) return;

  try {

    await navigator.clipboard.writeText(
      item.secret
    );

    toast("Copied to clipboard");

  } catch {

    toast("Clipboard tidak tersedia");
  }
}


function editVault(id) {

  const data =
    load(STORAGE.vault);

  const item =
    data.find(v => v.id === id);

  if (!item) return;

  openModal(`

    <h2>✏ Edit Vault</h2>

    <input
      id="editVaultTitle"
      class="form-input"
      value="${escapeHTML(item.title)}"
    >

    <textarea
      id="editVaultSecret"
      class="form-textarea"
    >${escapeHTML(item.secret)}</textarea>

    <button
      id="saveVaultEdit"
      class="primary"
    >
      Save Changes
    </button>
  `);

  $("saveVaultEdit").onclick = () => {

    const title =
      $("editVaultTitle").value.trim();

    const secret =
      $("editVaultSecret").value.trim();

    if (!title || !secret) {
      toast("Data tidak boleh kosong.");
      return;
    }

    item.title = title;
    item.secret = secret;

    save(STORAGE.vault, data);

    addActivity(
      `Edited "${title}" in Vault`
    );

    toast("Vault updated");

    vault();
  };
}


function deleteVault(id) {

  const data =
    load(STORAGE.vault);

  const item =
    data.find(v => v.id === id);

  if (!item) return;

  if (
    !confirm(
      `Hapus "${item.title}" dari Vault?`
    )
  ) return;

  save(
    STORAGE.vault,
    data.filter(v => v.id !== id)
  );

  renderVault();
  updateStats();

  addActivity(
    `Removed "${item.title}" from Vault`
  );

  toast("Vault item deleted");
}


/* =========================
   LIVE CAMERA
========================= */

let cameraStream = null;
let cameraFacing = "environment";


async function cameraTool() {

  openModal(`

    <h2>📷 Live Camera</h2>

    <p style="color:var(--muted)">
      Camera preview berjalan langsung di browser.
    </p>

    <div class="camera-wrap">
      <video
        id="cameraVideo"
        autoplay
        playsinline
        muted
      ></video>
    </div>

    <div class="camera-controls">

      <button
        id="switchCamera"
      >
        🔄 Switch Camera
      </button>

      <button
        id="stopCameraButton"
      >
        ⏹ Stop
      </button>

      <button
        id="capturePhoto"
        class="capture"
      >
        📸 Capture Photo
      </button>

    </div>

    <canvas
      id="cameraCanvas"
      class="hidden"
    ></canvas>

    <div id="cameraResult"></div>
  `);

  $("switchCamera").onclick =
    switchCamera;

  $("stopCameraButton").onclick =
    stopCamera;

  $("capturePhoto").onclick =
    capturePhoto;

  await startCamera();
}


async function startCamera() {

  stopCamera();

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {

    toast(
      "Browser tidak mendukung kamera."
    );

    return;
  }

  try {

    cameraStream =
      await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: {
              ideal: cameraFacing
            }
          },
          audio: false
        });

    const video =
      $("cameraVideo");

    if (!video) {
      stopCamera();
      return;
    }

    video.srcObject =
      cameraStream;

  } catch (error) {

    console.error(error);

    toast(
      "Izin kamera ditolak atau kamera tidak tersedia."
    );
  }
}


async function switchCamera() {

  cameraFacing =
    cameraFacing === "environment"
      ? "user"
      : "environment";

  await startCamera();
}


function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }

  const video =
    $("cameraVideo");

  if (video) {
    video.srcObject = null;
  }
}


function capturePhoto() {

  const video =
    $("cameraVideo");

  const canvas =
    $("cameraCanvas");

  const result =
    $("cameraResult");

  if (
    !video ||
    !canvas ||
    !result ||
    !video.videoWidth
  ) {

    toast(
      "Kamera belum siap."
    );

    return;
  }

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  const ctx =
    canvas.getContext("2d");

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const image =
    canvas.toDataURL(
      "image/jpeg",
      .92
    );

  result.innerHTML = `

    <img src="${image}" alt="Captured photo">

    <a
      href="${image}"
      download="voidvault-photo.jpg"
      class="primary"
      style="
        display:block;
        text-align:center;
        text-decoration:none;
        margin-top:12px;
      "
    >
      💾 Save Photo
    </a>
  `;

  addActivity(
    "Captured a photo"
  );

  toast("Photo captured");
}


/* =========================
   HD PHOTO
========================= */

function photoTool() {

  openModal(`

    <h2>🖼️ HD Photo</h2>

    <p style="color:var(--muted)">
      Simple local image upscaler.
    </p>

    <input
      id="photoInput"
      type="file"
      accept="image/*"
      class="form-input"
    >

    <select
      id="scaleInput"
      class="form-input"
    >
      <option value="2">2×</option>
      <option value="4">4×</option>
    </select>

    <button
      id="processPhoto"
      class="primary"
    >
      Upscale
    </button>

    <div id="photoResult"></div>
  `);

  $("processPhoto").onclick = () => {

    const file =
      $("photoInput").files[0];

    const scale =
      Number(
        $("scaleInput").value
      );

    if (!file) {
      toast("Pilih gambar dulu.");
      return;
    }

    const reader =
      new FileReader();

    reader.onload = e => {

      const image =
        new Image();

      image.onload = () => {

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          image.width * scale;

        canvas.height =
          image.height * scale;

        const ctx =
          canvas.getContext("2d");

        ctx.imageSmoothingEnabled =
          true;

        ctx.imageSmoothingQuality =
          "high";

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const url =
          canvas.toDataURL(
            "image/jpeg",
            .92
          );

        $("photoResult").innerHTML = `

          <img
            src="${url}"
            style="
              width:100%;
              margin-top:15px;
              border-radius:15px;
            "
          >

          <a
            href="${url}"
            download="voidvault-hd.jpg"
            class="primary"
            style="
              display:block;
              text-align:center;
              text-decoration:none;
              margin-top:12px;
            "
          >
            Save HD Photo
          </a>
        `;

        addActivity(
          "Upscaled an image"
        );
      };

      image.src =
        e.target.result;
    };

    reader.readAsDataURL(file);
  };
}


/* =========================
   QUIZ
========================= */

const questions = [

  {
    q: "What number comes next? 2, 4, 8, 16, ?",
    answers: ["20","24","32","36"],
    correct: 2
  },

  {
    q: "If all cats are animals, which statement is true?",
    answers: [
      "All animals are cats",
      "Some animals can be cats",
      "No cats are animals",
      "Cats are not animals"
    ],
    correct: 1
  },

  {
    q: "What is 15 + 17?",
    answers: ["30","31","32","33"],
    correct: 2
  },

  {
    q: "Which one is different?",
    answers: [
      "Apple",
      "Banana",
      "Carrot",
      "Orange"
    ],
    correct: 2
  }

];


function quiz() {

  let index = 0;
  let score = 0;

  function showQuestion() {

    const q =
      questions[index];

    openModal(`

      <h2>🧠 IQ Quiz</h2>

      <p>
        Question ${index + 1}
        / ${questions.length}
      </p>

      <h3>
        ${escapeHTML(q.q)}
      </h3>

      <div id="answers"></div>
    `);

    $("answers").innerHTML =
      q.answers.map((answer, i) => `

        <button
          class="tool-row"
          style="
            display:block;
            width:100%;
            margin:8px 0;
          "
          onclick="window.answerQuiz(${i})"
        >
          ${escapeHTML(answer)}
        </button>

      `).join("");
  }


  window.answerQuiz =
    answer => {

      if (
        answer ===
        questions[index].correct
      ) {
        score++;
      }

      index++;

      if (
        index >= questions.length
      ) {

        openModal(`

          <h2>🧠 Quiz Complete</h2>

          <h1>
            ${score} /
            ${questions.length}
          </h1>

          <p style="color:var(--muted)">
            Nice run.
          </p>

          <button
            class="primary"
            onclick="closeModal()"
          >
            Done
          </button>
        `);

        addActivity(
          `Completed IQ Quiz: ${score}/${questions.length}`
        );

      } else {

        showQuestion();
      }
    };

  showQuestion();
}


/* =========================
   SETTINGS
========================= */

function settings() {

  openModal(`

    <h2>⚙️ Settings</h2>

    <p style="color:var(--muted)">
      VoidVault settings.
    </p>

    <button
      id="resetData"
      class="primary"
    >
      Reset Local Data
    </button>

    <br><br>

    <button
      id="modalLock"
      class="primary"
    >
      Lock VoidVault
    </button>
  `);

  $("resetData").onclick = () => {

    if (
      confirm(
        "Hapus semua data VoidVault?"
      )
    ) {

      localStorage.clear();

      toast("Data reset");

      setTimeout(
        () => location.reload(),
        500
      );
    }
  };

  $("modalLock").onclick =
    lockVault;
}


/* =========================
   LOCK
========================= */

function lockVault() {

  stopCamera();

  sessionStorage.removeItem(
    "voidvault_unlocked"
  );

  location.reload();
}

$("lockNow").onclick =
  lockVault;


/* =========================
   TOOL ROUTER
========================= */

function openTool(tool) {

  if (tool === "calculator")
    calculator();

  if (tool === "notes")
    notes();

  if (tool === "tasks")
    tasks();

  if (tool === "vault")
    vault();

  if (tool === "quiz")
    quiz();

  if (tool === "photo")
    photoTool();

  if (tool === "camera")
    cameraTool();

  if (tool === "settings")
    settings();
}


/* =========================
   TOOL BUTTONS
========================= */

document
  .querySelectorAll("[data-tool]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openTool(
          button.dataset.tool
        );

      }
    );

  });


/* =========================
   THEME
========================= */

function loadTheme() {

  const theme =
    localStorage.getItem(
      STORAGE.theme
    );

  if (theme === "light") {

    document.body
      .classList.add("light");

    $("themeButton")
      .textContent = "☀";
  }
}

$("themeButton").onclick = () => {

  document.body
    .classList.toggle("light");

  const light =
    document.body
      .classList.contains("light");

  localStorage.setItem(
    STORAGE.theme,
    light
      ? "light"
      : "dark"
  );

  $("themeButton")
    .textContent =
      light ? "☀" : "☾";
};


/* =========================
   SEARCH
========================= */

$("globalSearch")
  .addEventListener(
    "input",
    function() {

      const query =
        this.value
          .toLowerCase()
          .trim();

      document
        .querySelectorAll(
          ".modern-card, .utility-grid button"
        )
        .forEach(card => {

          card.style.display =
            card.textContent
              .toLowerCase()
              .includes(query)
              ? ""
              : "none";
        });
    }
  );


/* =========================
   STARTUP
========================= */

updateDate();
updateStats();
renderActivity();
loadTheme();
