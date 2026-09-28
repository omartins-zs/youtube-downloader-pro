// State
let currentVideoData = null;
let selectedFormatType = "video";
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

// Cookie Elements
const toggleCookiesBtn = document.getElementById("toggleCookiesBtn");
const cookiePanel = document.getElementById("cookiePanel");
const closeCookiePanel = document.getElementById("closeCookiePanel");
const cookieStatusDot = document.getElementById("cookieStatusDot");
const cookieCurrentStatus = document.getElementById("cookieCurrentStatus");
const deleteCookiesBtn = document.getElementById("deleteCookiesBtn");
const uploadZone = document.getElementById("uploadZone");
const cookieFileInput = document.getElementById("cookieFileInput");
const cookiePasteArea = document.getElementById("cookiePasteArea");
const savePastedCookiesBtn = document.getElementById("savePastedCookiesBtn");
const cookieErrorBanner = document.getElementById("cookieErrorBanner");
const openCookiesFromBanner = document.getElementById("openCookiesFromBanner");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadHistory();
  checkCookieStatus();
});

function setupEventListeners() {
  videoUrlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") fetchVideoInfo();
  });

  fetchBtn.addEventListener("click", fetchVideoInfo);

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        videoUrlInput.value = text.trim();
        fetchVideoInfo();
      }
    } catch (err) {
      showToast("Nao foi possivel acessar a area de transferencia.", "error");
    }
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      videoUrlInput.value = chip.getAttribute("data-sample");
      fetchVideoInfo();
    });
  });

  openFolderBtn.addEventListener("click", openDownloadsFolder);
  openFolderFromProgressBtn.addEventListener("click", openDownloadsFolder);

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      selectedFormatType = tab;
      if (tab === "video") {
        videoOptionsTab.classList.add("active");
        audioOptionsTab.classList.remove("active");
        const first = videoQualityGrid.querySelector(".quality-card");
        if (first) first.click();
      } else {
        videoOptionsTab.classList.remove("active");
        audioOptionsTab.classList.add("active");
        const first = audioQualityGrid.querySelector(".quality-card");
        if (first) first.click();
      }
    });
  });

  startDownloadBtn.addEventListener("click", startDownload);

  // Cookie Panel events
  toggleCookiesBtn.addEventListener("click", () => {
    cookiePanel.classList.toggle("hidden");
  });
  closeCookiePanel.addEventListener("click", () => {
    cookiePanel.classList.add("hidden");
  });
  openCookiesFromBanner.addEventListener("click", () => {
    cookiePanel.classList.remove("hidden");
    cookiePanel.scrollIntoView({ behavior: "smooth" });
    cookieErrorBanner.classList.add("hidden");
  });

  // Cookie file upload
  uploadZone.addEventListener("click", () => cookieFileInput.click());
  cookieFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) uploadCookieFile(e.target.files[0]);
  });
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
  });
  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
  });
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) uploadCookieFile(e.dataTransfer.files[0]);
  });

  // Cookie paste
  savePastedCookiesBtn.addEventListener("click", pasteCookies);

  // Delete cookies
  deleteCookiesBtn.addEventListener("click", deleteCookies);
}

// ---- Cookie Management ----

async function checkCookieStatus() {
  try {
    const res = await fetch("/api/cookies/status");
    const data = await res.json();
    updateCookieUI(data.configured, data);
  } catch (err) {
    updateCookieUI(false);
  }
}

function updateCookieUI(configured, data) {
  if (configured) {
    cookieStatusDot.className = "status-dot dot-green";
    cookieCurrentStatus.innerHTML = `
      <span class="cookie-status-text">
        <i class="fa-solid fa-circle-check" style="color:#00e676"></i>
        Cookies configurados (${data?.file_size || ""} - ${data?.last_modified || ""})
      </span>
    `;
    deleteCookiesBtn.classList.remove("hidden");
  } else {
    cookieStatusDot.className = "status-dot dot-red";
    cookieCurrentStatus.innerHTML = `
      <span class="cookie-status-text">
        <i class="fa-solid fa-circle-xmark" style="color:#ff4757"></i>
        Cookies nao configurados
      </span>
    `;
    deleteCookiesBtn.classList.add("hidden");
  }
}

async function uploadCookieFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/cookies/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro no upload");
    showToast(data.message, "success");
    checkCookieStatus();
    cookieErrorBanner.classList.add("hidden");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function pasteCookies() {
  const text = cookiePasteArea.value.trim();
  if (!text) { showToast("Cole o conteudo do cookies.txt antes de salvar.", "error"); return; }
  try {
    const res = await fetch("/api/cookies/paste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erro ao salvar");
    showToast(data.message, "success");
    cookiePasteArea.value = "";
    checkCookieStatus();
    cookieErrorBanner.classList.add("hidden");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCookies() {
  try {
    await fetch("/api/cookies", { method: "DELETE" });
    showToast("Cookies removidos.", "success");
    checkCookieStatus();
  } catch (err) {
    showToast("Erro ao remover cookies.", "error");
  }
}

// ---- Video Info & Download ----

async function fetchVideoInfo() {
  const url = videoUrlInput.value.trim();
  if (!url) { showToast("Por favor, insira o link de um video do YouTube.", "error"); return; }

  loadingState.classList.remove("hidden");
  resultSection.classList.add("hidden");
  cookieErrorBanner.classList.add("hidden");
  fetchBtn.disabled = true;

  try {
    const res = await fetch("/api/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json();
      const detail = err.detail || "Falha ao obter informacoes do video.";
      if (detail.includes("COOKIES_NEEDED")) {
        cookieErrorBanner.classList.remove("hidden");
        throw new Error("YouTube bloqueou este IP. Configure os cookies no painel acima para desbloquear.");
      }
      throw new Error(detail);
    }

    const data = await res.json();
    currentVideoData = data;
    renderVideoPreview(data);
    showToast("Video analisado com sucesso!", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    loadingState.classList.add("hidden");
    fetchBtn.disabled = false;
  }
}

function renderVideoPreview(data) {
  videoThumb.src = data.thumbnail || "";
  videoDuration.textContent = data.duration_formatted || "00:00";
  videoTitle.textContent = data.title;
  videoChannel.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${data.uploader}`;
  videoViews.innerHTML = `<i class="fa-solid fa-eye"></i> ${Number(data.view_count || 0).toLocaleString()} visualizacoes`;
  videoDesc.textContent = data.description || "";
  renderVideoOptions(data.video_options);
  renderAudioOptions(data.audio_options);
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderVideoOptions(options) {
  videoQualityGrid.innerHTML = "";
  options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = `quality-card ${idx === 0 ? "selected" : ""}`;
    card.innerHTML = `<div class="quality-title">${opt.label}</div><div class="quality-subtitle">Formato MP4 otimizado</div>`;
    card.addEventListener("click", () => {
      videoQualityGrid.querySelectorAll(".quality-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedQuality = opt.height.toString();
      updateSummary();
    });
    videoQualityGrid.appendChild(card);
  });
  if (options.length > 0) { selectedQuality = options[0].height.toString(); updateSummary(); }
}

function renderAudioOptions(options) {
  audioQualityGrid.innerHTML = "";
  options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = `quality-card ${idx === 0 ? "selected" : ""}`;
    card.innerHTML = `<div class="quality-title">${opt.label}</div><div class="quality-subtitle">Audio estereo de alta clareza</div>`;
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
    selectedOptionSummary.textContent = `Video MP4 (${selectedQuality}p)`;
  } else {
    selectedOptionSummary.textContent = `Audio (${selectedQuality === "m4a" ? "M4A Original" : `MP3 ${selectedQuality}kbps`})`;
  }
}

async function startDownload() {
  if (!currentVideoData) return;
  startDownloadBtn.disabled = true;
  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentVideoData.url, format_type: selectedFormatType, quality: selectedQuality }),
    });
    if (!res.ok) throw new Error("Erro ao iniciar download.");
    const data = await res.json();
    activeTaskId = data.task_id;
    progressSection.classList.remove("hidden");
    completedActions.classList.add("hidden");
    progressTitle.textContent = `Processando: ${currentVideoData.title}`;
    progressStatus.textContent = "Iniciando download e conexao com servidor...";
    progressBarFill.style.width = "0%";
    progressPercent.textContent = "0%";
    progressDownloaded.textContent = "0 MB / --";
    progressSpeed.textContent = "-- MB/s";
    progressEta.textContent = "--s";
    progressSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(pollDownloadProgress, 1000);
    showToast("Download iniciado!", "success");
  } catch (error) {
    showToast(error.message, "error");
    startDownloadBtn.disabled = false;
  }
}

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
      progressStatus.textContent = "Mesclando video/audio e convertendo codecs (FFmpeg)...";
    } else if (task.status === "completed") {
      clearInterval(pollInterval);
      progressBarFill.style.width = "100%";
      progressPercent.textContent = "100%";
      progressStatus.textContent = "Finalizado com sucesso!";
      progressDownloaded.textContent = task.file_size_str || "Pronto";
      progressSpeed.textContent = "Completo";
      progressEta.textContent = "0s";
      browserDownloadBtn.href = `/api/file/${activeTaskId}`;
      browserDownloadBtn.setAttribute("download", task.file_name || "download");
      completedActions.classList.remove("hidden");
      startDownloadBtn.disabled = false;
      showToast("Download concluido com sucesso!", "success");
      loadHistory();
    } else if (task.status === "error") {
      clearInterval(pollInterval);
      const errMsg = task.error || "Ocorreu um erro no download";
      if (errMsg.includes("COOKIES_NEEDED")) {
        cookieErrorBanner.classList.remove("hidden");
        progressStatus.textContent = "Erro: YouTube bloqueou IP. Configure cookies no painel acima.";
      } else {
        progressStatus.textContent = `Erro: ${errMsg}`;
      }
      startDownloadBtn.disabled = false;
      showToast(`Falha no download: ${errMsg}`, "error");
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) return;
    const data = await res.json();
    const list = data.history || [];
    historyCount.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;
    if (list.length === 0) {
      historyList.innerHTML = `<div class="empty-history"><i class="fa-solid fa-inbox"></i><p>Nenhum download realizado ainda nesta sessao.</p></div>`;
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
            <div class="h-meta">${item.format} - ${item.size} - Concluido as ${item.time}</div>
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
    console.error("Erro ao carregar historico:", err);
  }
}

async function openDownloadsFolder() {
  try {
    const res = await fetch("/api/open-folder", { method: "POST" });
    const data = await res.json();
    if (data.success) { showToast("Pasta de downloads aberta!", "success"); }
    else { showToast("Nao foi possivel abrir a pasta automaticamente.", "error"); }
  } catch (err) {
    showToast("Erro ao abrir pasta.", "error");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-triangle-exclamation" : "fa-circle-info";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
