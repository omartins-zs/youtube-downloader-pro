# 🎬 YouTube Downloader Pro

Uma aplicação web moderna, rápida e de alta fidelidade para baixar vídeos e áudios do YouTube com qualidade máxima (até 4K Ultra HD e MP3 320kbps).

---

## ✨ Recursos

- **Resoluções de Vídeo**: 4K (2160p), 2K (1440p), Full HD (1080p), HD (720p), 480p, 360p no formato **MP4**.
- **Extração de Áudio**: Conversão direta para **MP3 (320kbps, 192kbps, 128kbps)** e **M4A Original**.
- **FFmpeg Integrado**: Processamento e mesclagem automática de áudio e vídeo de alta resolução sem necessidade de instalação manual adicional.
- **Interface Dark Glassmorphism**: Design fluido, responsivo e moderno.
- **Progresso em Tempo Real**: Barra de carregamento com velocidade (MB/s), porcentagem e tempo estimado (ETA).
- **Download Direto ou Pasta Local**: Baixe diretamente pelo navegador ou abra a pasta local no Windows Explorer com 1 clique.
- **Histórico de Sessão**: Acompanhe e baixe novamente os itens processados na sessão.

---

## 🚀 Como Iniciar

### Opção 1: Pelo arquivo executável rápido (Windows)
Basta dar dois cliques no arquivo:
```cmd
start.bat
```

### Opção 2: Pela Linha de Comando
1. Instale as dependências:
```bash
pip install -r requirements.txt
```
2. Inicie a aplicação:
```bash
python main.py
```
3. Abra no navegador:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🛠️ Tecnologias Utilizadas
- **Backend**: Python 3, FastAPI, Uvicorn, yt-dlp, imageio-ffmpeg
- **Frontend**: HTML5 Semântico, Vanilla CSS Moderno (Glassmorphism), JavaScript ES6+
