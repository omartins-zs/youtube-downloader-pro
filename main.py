import os
import sys
import uuid
import shutil
import threading
import time
from pathlib import Path
from typing import Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yt_dlp

# Load environment variables from .env
load_dotenv()

APP_ENV = os.getenv("APP_ENV", "local")
APP_HOST = os.getenv("APP_HOST", "127.0.0.1" if APP_ENV == "local" else "0.0.0.0")
APP_PORT = int(os.getenv("PORT", os.getenv("APP_PORT", "8000" if APP_ENV == "local" else "8080")))

BASE_DIR = Path(__file__).resolve().parent
custom_downloads = os.getenv("DOWNLOADS_DIR")
if custom_downloads:
    DOWNLOADS_DIR = Path(custom_downloads) if os.path.isabs(custom_downloads) else BASE_DIR / custom_downloads
else:
    DOWNLOADS_DIR = BASE_DIR / "downloads"

DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)

# Detect FFmpeg executable
def resolve_ffmpeg() -> str:
    # 1. Custom ENV
    env_path = os.getenv("FFMPEG_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # 2. System PATH (Linux/Docker/apt or Windows PATH)
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    
    # 3. imageio-ffmpeg bundled binary fallback
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"

FFMPEG_PATH = resolve_ffmpeg()

app = FastAPI(title="YouTube Downloader Pro")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active download tasks
tasks: Dict[str, Dict[str, Any]] = {}
download_history: list = []

class VideoInfoRequest(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format_type: str  # 'video' or 'audio'
    quality: Optional[str] = "best"

def format_bytes(size):
    if not size:
        return "N/A"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def format_duration(seconds):
    if not seconds:
        return "00:00"
    seconds = int(seconds)
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "env": APP_ENV,
        "ffmpeg": bool(FFMPEG_PATH)
    }

@app.post("/api/info")
def get_video_info(req: VideoInfoRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Por favor, forneça uma URL válida do YouTube.")
    
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "ffmpeg_location": FFMPEG_PATH,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            formats = info.get("formats", [])
            available_resolutions = set()
            for f in formats:
                height = f.get("height")
                vcodec = f.get("vcodec")
                if height and vcodec and vcodec != "none":
                    available_resolutions.add(height)
            
            sorted_res = sorted(list(available_resolutions), reverse=True)
            
            video_options = []
            for res in sorted_res:
                label = f"{res}p"
                if res >= 2160:
                    label += " (4K Ultra HD)"
                elif res >= 1440:
                    label += " (2K Quad HD)"
                elif res == 1080:
                    label += " (Full HD)"
                elif res == 720:
                    label += " (HD)"
                
                video_options.append({
                    "height": res,
                    "label": label,
                    "format_id": f"bestvideo[height<={res}]+bestaudio/best[height<={res}]/best"
                })
            
            if not video_options:
                video_options.append({
                    "height": 720,
                    "label": "Melhor Qualidade Disponível",
                    "format_id": "bestvideo+bestaudio/best"
                })

            return {
                "title": info.get("title", "Vídeo do YouTube"),
                "uploader": info.get("uploader", "Canal Desconhecido"),
                "channel_url": info.get("uploader_url") or info.get("channel_url"),
                "thumbnail": info.get("thumbnail"),
                "duration": info.get("duration", 0),
                "duration_formatted": format_duration(info.get("duration", 0)),
                "view_count": info.get("view_count", 0),
                "like_count": info.get("like_count", 0),
                "description": (info.get("description") or "")[:300] + "...",
                "url": url,
                "video_options": video_options,
                "audio_options": [
                    {"bitrate": "320", "label": "MP3 320 kbps (Alta Fidelidade)", "ext": "mp3"},
                    {"bitrate": "192", "label": "MP3 192 kbps (Padrão)", "ext": "mp3"},
                    {"bitrate": "128", "label": "MP3 128 kbps (Econômico)", "ext": "mp3"},
                    {"bitrate": "m4a", "label": "M4A Áudio Original", "ext": "m4a"},
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao obter informações do vídeo: {str(e)}")

def progress_hook(task_id: str):
    def hook(d):
        if task_id not in tasks:
            return
        status = d.get("status")
        if status == "downloading":
            total_bytes = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            downloaded = d.get("downloaded_bytes", 0)
            speed = d.get("speed", 0)
            eta = d.get("eta", 0)
            percent = (downloaded / total_bytes * 100) if total_bytes > 0 else 0
            
            tasks[task_id].update({
                "status": "downloading",
                "progress": round(percent, 1),
                "downloaded_str": format_bytes(downloaded),
                "total_str": format_bytes(total_bytes),
                "speed_str": f"{format_bytes(speed)}/s" if speed else "--",
                "eta_str": f"{int(eta)}s" if eta else "--",
            })
        elif status == "finished":
            tasks[task_id].update({
                "status": "processing",
                "progress": 99.0,
                "message": "Convertendo / Finalizando arquivo..."
            })
    return hook

def run_download_thread(task_id: str, url: str, format_type: str, quality: str):
    task = tasks[task_id]
    task["status"] = "starting"
    task["progress"] = 0
    
    unique_suffix = f"_{uuid.uuid4().hex[:6]}"
    out_template = str(DOWNLOADS_DIR / f"%(title)s{unique_suffix}.%(ext)s")
    
    ydl_opts: Dict[str, Any] = {
        "outtmpl": out_template,
        "progress_hooks": [progress_hook(task_id)],
        "ffmpeg_location": FFMPEG_PATH,
        "quiet": True,
        "no_warnings": True,
    }
    
    if format_type == "audio":
        if quality == "m4a":
            ydl_opts.update({
                "format": "bestaudio[ext=m4a]/bestaudio/best",
            })
        else:
            bitrate = quality if quality in ["320", "192", "128"] else "192"
            ydl_opts.update({
                "format": "bestaudio/best",
                "postprocessors": [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": bitrate,
                }],
            })
    else:
        # Video
        if quality and quality.isdigit():
            h = int(quality)
            ydl_opts.update({
                "format": f"bestvideo[height<={h}]+bestaudio/best[height<={h}]/best",
                "merge_output_format": "mp4",
            })
        else:
            ydl_opts.update({
                "format": "bestvideo+bestaudio/best",
                "merge_output_format": "mp4",
            })

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title", "video")
            filename = ydl.prepare_filename(info)
            if format_type == "audio" and quality != "m4a":
                base, _ = os.path.splitext(filename)
                filename = base + ".mp3"
            
            file_path = Path(filename)
            if not file_path.exists():
                matches = list(DOWNLOADS_DIR.glob(f"*{unique_suffix}*"))
                if matches:
                    file_path = matches[0]
            
            if file_path.exists():
                file_size = file_path.stat().st_size
                tasks[task_id].update({
                    "status": "completed",
                    "progress": 100.0,
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "file_size_str": format_bytes(file_size),
                    "title": title,
                    "thumbnail": info.get("thumbnail"),
                    "completed_at": time.strftime("%H:%M:%S")
                })
                download_history.insert(0, {
                    "task_id": task_id,
                    "title": title,
                    "file_name": file_path.name,
                    "format": format_type.upper(),
                    "size": format_bytes(file_size),
                    "time": time.strftime("%H:%M:%S")
                })
            else:
                tasks[task_id].update({
                    "status": "error",
                    "error": "Arquivo não encontrado após processamento."
                })
    except Exception as e:
        tasks[task_id].update({
            "status": "error",
            "error": str(e)
        })

@app.post("/api/download")
def start_download(req: DownloadRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "task_id": task_id,
        "url": req.url,
        "format_type": req.format_type,
        "quality": req.quality,
        "status": "queued",
        "progress": 0,
        "downloaded_str": "0 B",
        "total_str": "--",
        "speed_str": "--",
        "eta_str": "--",
        "created_at": time.time()
    }
    
    t = threading.Thread(
        target=run_download_thread,
        args=(task_id, req.url, req.format_type, req.quality),
        daemon=True
    )
    t.start()
    
    return {"task_id": task_id}

@app.get("/api/tasks/{task_id}")
def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return tasks[task_id]

@app.get("/api/file/{task_id}")
def download_file(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    task = tasks[task_id]
    if task.get("status") != "completed" or not task.get("file_path"):
        raise HTTPException(status_code=400, detail="Arquivo ainda não está pronto para download")
    
    file_path = Path(task["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado no servidor")
    
    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type="application/octet-stream"
    )

@app.get("/api/history")
def get_history():
    return {"history": download_history[:20]}

@app.post("/api/open-folder")
def open_downloads_folder():
    try:
        if sys.platform == "win32":
            os.startfile(str(DOWNLOADS_DIR))
            return {"success": True, "path": str(DOWNLOADS_DIR)}
        elif sys.platform == "darwin":
            os.system(f'open "{DOWNLOADS_DIR}"')
            return {"success": True, "path": str(DOWNLOADS_DIR)}
        else:
            return {"success": False, "error": "Recurso local não suportado em ambiente remoto/container"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Serve static files
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print(f"Iniciando YouTube Downloader em http://{APP_HOST}:{APP_PORT} (Modo: {APP_ENV})...")
    print(f"Pasta de downloads: {DOWNLOADS_DIR}")
    print(f"FFmpeg localizado em: {FFMPEG_PATH}")
    uvicorn.run("main:app", host=APP_HOST, port=APP_PORT, reload=True if APP_ENV == "local" else False)
