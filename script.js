/* =========================
   VOIDVAULT V3
   Main Application
========================= */

const $ = (id) => document.getElementById(id);

const STORAGE = {
  notes: "vv3_notes",
  tasks: "vv3_tasks",
  vault: "vv3_vault",
  activity: "vv3_activity",
  theme: "vv3_theme"
};


/* =========================
   STORAGE HELPERS
========================= */

function load(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
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

  const activity = load(STORAGE.activity);

  activity.unshift({
    text,
    time: new Date().toLocaleString("id-ID")
  });

  save(STORAGE.activity, activity.slice(0, 20));

  renderActivity();
}

function renderActivity() {

  const activity = load(STORAGE.activity);
  const box = $("activityList");

  if (!activity.length) {
    box.innerHTML = `<div class="empty">No activity yet.</div>`;
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
  localStorage.removeItem(STORAGE.activity);
  renderActivity();
  toast("Activity cleared");
};


/* =========================
   SAFE TEXT
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
   DATE
========================= */

function updateDate() {

  $("dateText").textContent =
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
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
    load(STORAGE.tasks).filter(t => !t.done).length;
}


/* =========================
   MODAL
========================= */

function openModal(html) {

  $("modalContent").innerHTML = html;
  $("modal").classList.remove("hidden");
}

function closeModal() {
  $("modal").classList.add("hidden");
}

$("closeModal").onclick = closeModal;

$("modal").addEventListener("click", e => {
  if (e.target === $("modal")) {
    closeModal();
  }
});


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

    const expression = $("calcInput").value.trim();

    /*
      Hanya izinkan angka dan operator dasar.
    */

    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      $("calcResult").textContent = "Input tidak valid.";
      return;
    }

    try {

      const result = Function(
        `"use strict"; return (${expression})`
      )();

      $("calcResult").textContent = `= ${result}`;

      addActivity("Used Calculator");

    } catch {

      $("calcResult").textContent =
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

    <div id="notesList" style="margin-top:18px"></div>
  `);

  renderNotes();

  $("saveNote").onclick = () => {

    const title = $("noteTitle").value.trim();
    const text = $("noteText").value.trim();

    if (!text) {
      toast("Tulis catatan dulu.");
      return;
    }

    const notesData = load(STORAGE.notes);

    notesData.unshift({
      id: Date.now(),
      title: title || "Untitled",
      text
    });

    save(STORAGE.notes, notesData);

    $("noteTitle").value = "";
    $("noteText").value = "";

    renderNotes();
    updateStats();

    addActivity("Created a note");
    toast("Note saved");
  };
}


function renderNotes() {

  const box = $("notesList");

  if (!box) return;

  const notesData = load(STORAGE.notes);

  if (!notesData.length) {
    box.innerHTML =
      `<div class="empty">No notes yet.</div>`;
    return;
  }

  box.innerHTML = notesData.map(note => `
    <div class="activity">
      <b>${escapeHTML(note.title)}</b>
      <small>${escapeHTML(note.text)}</small>
      <button
        style="margin-top:8px;background:transparent;color:var(--danger)"
        onclick="deleteNote(${note.id})"
      >
        Delete
      </button>
    </div>
  `).join("");
}


function deleteNote(id) {

  const notesData =
    load(STORAGE.notes).filter(n => n.id !== id);

  save(STORAGE.notes, notesData);

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

    <div id="tasksList" style="margin-top:18px"></div>
  `);

  renderTasks();

  $("addTask").onclick = () => {

    const input = $("taskInput");
    const text = input.value.trim();

    if (!text) return;

    const taskData = load(STORAGE.tasks);

    taskData.unshift({
      id: Date.now(),
      text,
      done: false
    });

    save(STORAGE.tasks, taskData);

    input.value = "";

    renderTasks();
    updateStats();

    addActivity("Added a task");
  };
}


function renderTasks() {

  const box = $("tasksList");

  if (!box) return;

  const taskData = load(STORAGE.tasks);

  if (!taskData.length) {
    box.innerHTML =
      `<div class="empty">No tasks yet.</div>`;
    return;
  }

  box.innerHTML = taskData.map(task => `

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
          ${task.done ? "text-decoration:line-through;opacity:.5" : ""}
        ">
          ${escapeHTML(task.text)}
        </span>

      </label>

      <button
        style="
          margin-top:8px;
          background:transparent;
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

  const taskData = load(STORAGE.tasks);

  const task = taskData.find(t => t.id === id);

  if (task) {
    task.done = !task.done;
  }

  save(STORAGE.tasks, taskData);

  renderTasks();
  updateStats();
}


function deleteTask(id) {

  const taskData =
    load(STORAGE.tasks).filter(t => t.id !== id);

  save(STORAGE.tasks, taskData);

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
      Local browser vault. File names are stored here;
      the original files remain on your device.
    </p>

    <input
      id="vaultFile"
      type="file"
      class="form-input"
    >

    <button id="addVault" class="primary">
      Add to Vault
    </button>

    <div id="vaultList" style="margin-top:18px"></div>
  `);

  renderVault();

  $("addVault").onclick = () => {

    const file = $("vaultFile").files[0];

    if (!file) {
      toast("Pilih file dulu.");
      return;
    }

    const vaultData = load(STORAGE.vault);

    vaultData.unshift({
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type
    });

    save(STORAGE.vault, vaultData);

    renderVault();
    updateStats();

    addActivity(`Added ${file.name} to Vault`);

    toast("File added");
  };
}


function renderVault() {

  const box = $("vaultList");

  if (!box) return;

  const vaultData = load(STORAGE.vault);

  if (!vaultData.length) {
    box.innerHTML =
      `<div class="empty">Vault is empty.</div>`;
    return;
  }

  box.innerHTML = vaultData.map(file => `

    <div class="activity">

      <b>🔒 ${escapeHTML(file.name)}</b>

      <small>
        ${escapeHTML(file.type || "Unknown")}
        · ${formatBytes(file.size)}
      </small>

      <button
        style="
          margin-top:8px;
          background:transparent;
          color:var(--danger)
        "
        onclick="deleteVault(${file.id})"
      >
        Remove
      </button>

    </div>

  `).join("");
}


function deleteVault(id) {

  const vaultData =
    load(STORAGE.vault).filter(f => f.id !== id);

  save(STORAGE.vault, vaultData);

  renderVault();
  updateStats();

  toast("Removed from Vault");
}


function formatBytes(bytes) {

  if (!bytes) return "0 B";

  const units = ["B","KB","MB","GB"];

  const i =
    Math.floor(Math.log(bytes) / Math.log(1024));

  return (
    bytes / Math.pow(1024, i)
  ).toFixed(1) + " " + units[i];
}


/* =========================
   IQ QUIZ
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
    answers: ["Apple","Banana","Carrot","Orange"],
    correct: 2
  }

];


function quiz() {

  let index = 0;
  let score = 0;

  function showQuestion() {

    const q = questions[index];

    openModal(`
      <h2>🧠 IQ Quiz</h2>

      <p>
        Question ${index + 1} / ${questions.length}
      </p>

      <h3>${escapeHTML(q.q)}</h3>

      <div id="answers"></div>

      <p id="quizScore"></p>
    `);

    $("answers").innerHTML =
      q.answers.map((answer,i) => `
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


  window.answerQuiz = function(answer) {

    if (answer === questions[index].correct) {
      score++;
    }

    index++;

    if (index >= questions.length) {

      openModal(`
        <h2>🧠 Quiz Complete</h2>

        <h1>
          ${score} / ${questions.length}
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

      addActivity(`Completed IQ Quiz: ${score}/${questions.length}`);

    } else {

      showQuestion();
    }
  };

  showQuestion();
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

    <select id="scaleInput" class="form-input">
      <option value="2">2×</option>
      <option value="4">4×</option>
    </select>

    <button id="processPhoto" class="primary">
      Upscale
    </button>

    <div id="photoResult"></div>
  `);

  $("processPhoto").onclick = () => {

    const file = $("photoInput").files[0];
    const scale = Number($("scaleInput").value);

    if (!file) {
      toast("Pilih gambar dulu.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

      const image = new Image();

      image.onload = function() {

        const canvas =
          document.createElement("canvas");

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const url =
          canvas.toDataURL("image/jpeg", .92);

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

        addActivity("Upscaled an image");
      };

      image.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };
}


/* =========================
   SETTINGS
========================= */

function settings() {

  openModal(`
    <h2>⚙️ Settings</h2>

    <p style="color:var(--muted)">
      VoidVault V3 settings.
    </p>

    <button id="resetData" class="primary">
      Reset Local Data
    </button>

    <button id="lockNow" class="primary">
      Lock VoidVault
    </button>
  `);

  $("resetData").onclick = () => {

    if (confirm("Hapus semua data VoidVault?")) {

      localStorage.clear();

      toast("Data reset");

      setTimeout(() => {
        location.reload();
      }, 500);
    }
  };

  $("lockNow").onclick = () => {

    sessionStorage.removeItem("voidvault_unlocked");

    location.reload();
  };
}


/* =========================
   TOOL ROUTER
========================= */

function openTool(tool) {

  if (tool === "calculator") calculator();
  if (tool === "notes") notes();
  if (tool === "tasks") tasks();
  if (tool === "vault") vault();
  if (tool === "quiz") quiz();
  if (tool === "photo") photoTool();
  if (tool === "settings") settings();

}


/* =========================
   TOOL BUTTONS
========================= */

document.querySelectorAll("[data-tool]").forEach(button => {

  button.addEventListener("click", () => {

    const tool = button.dataset.tool;

    openTool(tool);

  });

});


/* =========================
   THEME
========================= */

function loadTheme() {

  const theme =
    localStorage.getItem(STORAGE.theme);

  if (theme === "light") {
    document.body.classList.add("light");
    $("themeButton").textContent = "☀";
  }
}

$("themeButton").onclick = () => {

  document.body.classList.toggle("light");

  const light =
    document.body.classList.contains("light");

  localStorage.setItem(
    STORAGE.theme,
    light ? "light" : "dark"
  );

  $("themeButton").textContent =
    light ? "☀" : "☾";
};


/* =========================
   SEARCH
========================= */

$("globalSearch").addEventListener("input", function() {

  const query =
    this.value.toLowerCase().trim();

  document.querySelectorAll(".tool-card").forEach(card => {

    card.style.display =
      card.textContent.toLowerCase().includes(query)
        ? ""
        : "none";
  });

});


/* =========================
   STARTUP
========================= */

updateDate();
updateStats();
renderActivity();
loadTheme();
