// State
let currentVideoData = null;
let selectedFormatType = "video"; // 'video' or 'audio'
let selectedQuality = "best";
let activeTaskId = null;
let pollInterval = null;

// DOM Elements
const videoUrlInput = document.getElementById("videoUrlInput");
const pasteBtn = document.getElementById("pasteBtn");
const fetchBtn = document.getElementById("fetchBtn");
const openFolderBtn = document.getElementById("openFolderBtn");

const loadingState = document.getElementById("loadingState");
const resultSection = document.getElementById("resultSection");
const progressSection = document.getElementById("progressSection");

const videoThumb = document.getElementById("videoThumb");
const videoDuration = document.getElementById("videoDuration");
const videoTitle = document.getElementById("videoTitle");
const videoChannel = document.getElementById("videoChannel");
const videoViews = document.getElementById("videoViews");
const videoDesc = document.getElementById("videoDesc");

const tabButtons = document.querySelectorAll(".tab-btn");
const videoOptionsTab = document.getElementById("videoOptionsTab");
const audioOptionsTab = document.getElementById("audioOptionsTab");
const videoQualityGrid = document.getElementById("videoQualityGrid");
const audioQualityGrid = document.getElementById("audioQualityGrid");
const selectedOptionSummary = document.getElementById("selectedOptionSummary");
const startDownloadBtn = document.getElementById("startDownloadBtn");

const progressTitle = document.getElementById("progressTitle");
const progressStatus = document.getElementById("progressStatus");
const progressPercent = document.getElementById("progressPercent");
const progressBarFill = document.getElementById("progressBarFill");
const progressDownloaded = document.getElementById("progressDownloaded");
const progressSpeed = document.getElementById("progressSpeed");
const progressEta = document.getElementById("progressEta");
const completedActions = document.getElementById("completedActions");
const browserDownloadBtn = document.getElementById("browserDownloadBtn");
const openFolderFromProgressBtn = document.getElementById("openFolderFromProgressBtn");

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const toastContainer = document.getElementById("toastContainer");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadHistory();
});

function setupEventListeners() {
  // Enter key in search box
  videoUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      fetchVideoInfo();
    }
  });

  fetchBtn.addEventListener("click", fetchVideoInfo);

  // Paste button
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        videoUrlInput.value = text.trim();
        fetchVideoInfo();
      }
    } catch (err) {
      showToast("Não foi possível acessar a área de transferência.", "error");
    }
  });

  // Quick sample chips
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      videoUrlInput.value = chip.getAttribute("data-sample");
      fetchVideoInfo();
    });
  });

  // Open folder button
  openFolderBtn.addEventListener("click", openDownloadsFolder);
  openFolderFromProgressBtn.addEventListener("click", openDownloadsFolder);

  // Tab switching
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.getAttribute("data-tab");
      selectedFormatType = tab;

      if (tab === "video") {
        videoOptionsTab.classList.add("active");
        audioOptionsTab.classList.remove("active");
        // pick first video option
        const first = videoQualityGrid.querySelector(".quality-card");
        if (first) first.click();
      } else {
        videoOptionsTab.classList.remove("active");
        audioOptionsTab.classList.add("active");
        // pick first audio option
        const first = audioQualityGrid.querySelector(".quality-card");
        if (first) first.click();
      }
    });
  });

  startDownloadBtn.addEventListener("click", startDownload);
}

// Fetch Video Info
async function fetchVideoInfo() {
  const url = videoUrlInput.value.trim();
  if (!url) {
    showToast("Por favor, insira o link de um vídeo do YouTube.", "error");
    return;
  }

  // UI state
  loadingState.classList.remove("hidden");
  resultSection.classList.add("hidden");
  fetchBtn.disabled = true;

  try {
    const res = await fetch("/api/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Falha ao obter informações do vídeo.");
    }

    const data = await res.json();
    currentVideoData = data;
    renderVideoPreview(data);
    showToast("Vídeo analisado com sucesso!", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    loadingState.classList.add("hidden");
    fetchBtn.disabled = false;
  }
}

// Render Video Preview
function renderVideoPreview(data) {
  videoThumb.src = data.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
  videoDuration.textContent = data.duration_formatted || "00:00";
  videoTitle.textContent = data.title;
  videoChannel.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${data.uploader}`;
  videoViews.innerHTML = `<i class="fa-solid fa-eye"></i> ${Number(data.view_count || 0).toLocaleString()} visualizações`;
  videoDesc.textContent = data.description || "";

  renderVideoOptions(data.video_options);
  renderAudioOptions(data.audio_options);

  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Render Video Options Grid
function renderVideoOptions(options) {
  videoQualityGrid.innerHTML = "";
  options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = `quality-card ${idx === 0 ? "selected" : ""}`;
    card.innerHTML = `
      <div class="quality-title">${opt.label}</div>
      <div class="quality-subtitle">Formato MP4 otimizado</div>
    `;

    card.addEventListener("click", () => {
      videoQualityGrid.querySelectorAll(".quality-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedQuality = opt.height.toString();
      updateSummary();
    });

    videoQualityGrid.appendChild(card);
  });

  if (options.length > 0) {
    selectedQuality = options[0].height.toString();
    updateSummary();
  }
}

// Render Audio Options Grid
function renderAudioOptions(options) {
  audioQualityGrid.innerHTML = "";
  options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = `quality-card ${idx === 0 ? "selected" : ""}`;
    card.innerHTML = `
      <div class="quality-title">${opt.label}</div>
      <div class="quality-subtitle">Áudio estéreo de alta clareza</div>
    `;

    card.addEventListener("click", () => {
      audioQualityGrid.querySelectorAll(".quality-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedQuality = opt.bitrate;
      updateSummary();
    });

    audioQualityGrid.appendChild(card);
  });
}

function updateSummary() {
  if (selectedFormatType === "video") {
    selectedOptionSummary.textContent = `Vídeo MP4 (${selectedQuality}p)`;
  } else {
    selectedOptionSummary.textContent = `Áudio (${selectedQuality === "m4a" ? "M4A Original" : `MP3 ${selectedQuality}kbps`})`;
  }
}

// Start Download
async function startDownload() {
  if (!currentVideoData) return;

  const url = currentVideoData.url;
  startDownloadBtn.disabled = true;

  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        format_type: selectedFormatType,
        quality: selectedQuality,
      }),
    });

    if (!res.ok) {
      throw new Error("Erro ao iniciar download.");
    }

    const data = await res.json();
    activeTaskId = data.task_id;

    // Show Progress Section
    progressSection.classList.remove("hidden");
    completedActions.classList.add("hidden");
    progressTitle.textContent = `Processando: ${currentVideoData.title}`;
    progressStatus.textContent = "Iniciando download e conexão com servidor...";
    progressBarFill.style.width = "0%";
    progressPercent.textContent = "0%";
    progressDownloaded.textContent = "0 MB / --";
    progressSpeed.textContent = "-- MB/s";
    progressEta.textContent = "--s";

    progressSection.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Start Polling
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(pollDownloadProgress, 1000);
    showToast("Download iniciado!", "success");
  } catch (error) {
    showToast(error.message, "error");
    startDownloadBtn.disabled = false;
  }
}

// Poll Progress
async function pollDownloadProgress() {
  if (!activeTaskId) return;

  try {
    const res = await fetch(`/api/tasks/${activeTaskId}`);
    if (!res.ok) return;

    const task = await res.json();

    if (task.status === "downloading" || task.status === "starting") {
      const pct = task.progress || 0;
      progressBarFill.style.width = `${pct}%`;
      progressPercent.textContent = `${pct}%`;
      progressDownloaded.textContent = `${task.downloaded_str || "0 B"} / ${task.total_str || "--"}`;
      progressSpeed.textContent = task.speed_str || "--";
      progressEta.textContent = task.eta_str || "--";
      progressStatus.textContent = "Baixando fluxos de dados do YouTube...";
    } else if (task.status === "processing") {
      progressBarFill.style.width = "99%";
      progressPercent.textContent = "99%";
      progressStatus.textContent = "Mesclando vídeo/áudio e convertendo codecs (FFmpeg)...";
    } else if (task.status === "completed") {
      clearInterval(pollInterval);
      progressBarFill.style.width = "100%";
      progressPercent.textContent = "100%";
      progressStatus.textContent = "Finalizado com sucesso!";
      progressDownloaded.textContent = task.file_size_str || "Pronto";
      progressSpeed.textContent = "Completo";
      progressEta.textContent = "0s";

      // Setup browser direct download button
      browserDownloadBtn.href = `/api/file/${activeTaskId}`;
      browserDownloadBtn.setAttribute("download", task.file_name || "download");

      completedActions.classList.remove("hidden");
      startDownloadBtn.disabled = false;
      showToast("Download concluído com sucesso!", "success");
      loadHistory();
    } else if (task.status === "error") {
      clearInterval(pollInterval);
      progressStatus.textContent = `Erro: ${task.error || "Ocorreu um erro no download"}`;
      startDownloadBtn.disabled = false;
      showToast(`Falha no download: ${task.error}`, "error");
    }
  } catch (err) {
    console.error(err);
  }
}

// Load Session History
async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) return;

    const data = await res.json();
    const list = data.history || [];

    historyCount.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;

    if (list.length === 0) {
      historyList.innerHTML = `
        <div class="empty-history">
          <i class="fa-solid fa-inbox"></i>
          <p>Nenhum download realizado ainda nesta sessão.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = "";
    list.forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item";
      const isAudio = item.format === "AUDIO";
      div.innerHTML = `
        <div class="h-info">
          <i class="fa-solid ${isAudio ? "fa-file-audio" : "fa-file-video"} h-icon"></i>
          <div>
            <div class="h-title" title="${item.title}">${item.title}</div>
            <div class="h-meta">${item.format} • ${item.size} • Concluído às ${item.time}</div>
          </div>
        </div>
        <div class="h-actions">
          <a class="btn-secondary" href="/api/file/${item.task_id}" download="${item.file_name}" title="Baixar novamente">
            <i class="fa-solid fa-download"></i> Baixar
          </a>
        </div>
      `;
      historyList.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar histórico:", err);
  }
}

// Open Local Downloads Folder
async function openDownloadsFolder() {
  try {
    const res = await fetch("/api/open-folder", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      showToast("Pasta de downloads aberta!", "success");
    } else {
      showToast("Não foi possível abrir a pasta automaticamente.", "error");
    }
  } catch (err) {
    showToast("Erro ao abrir pasta.", "error");
  }
}

// Toast Notifications
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon =
    type === "success"
      ? "fa-circle-check"
      : type === "error"
      ? "fa-triangle-exclamation"
      : "fa-circle-info";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
