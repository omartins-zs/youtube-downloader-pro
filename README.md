# YouTube Downloader Pro

Baixador de vídeos e áudios do YouTube com interface web. **Roda 100% local** — você só cola o link e baixa. Sem cookies, sem login.

> **Por que rodar local?** O YouTube bloqueia IPs de datacenter (Render, AWS, etc.) pedindo *"Sign in to confirm you're not a bot"*, e só nesses casos são necessários cookies. Rodando na sua própria máquina, o YouTube vê seu IP normal e **não pede nada**.

## Como usar (Docker — recomendado)

Precisa apenas do **Docker Desktop** aberto.

1. Dê duplo clique em **`docker-start.bat`** (ou rode no terminal):
   ```bash
   docker compose up -d --build
   ```
2. Acesse **http://localhost:8090**
3. Cole o link do YouTube, escolha vídeo ou áudio e baixe.

Os arquivos baixados aparecem na pasta **`downloads/`**.

Para parar: duplo clique em **`docker-stop.bat`** (ou `docker compose down`).

## Como usar (sem Docker — Python direto)

```bash
pip install -r requirements.txt
python main.py
```
Acesse http://127.0.0.1:8000

> Precisa do FFmpeg instalado (ou o pacote `imageio-ffmpeg`, já incluído nos requirements).

## Recursos

- Download de vídeo (até 4K) e áudio (MP3 320/192/128 kbps ou M4A)
- Progresso em tempo real
- Histórico de downloads
- Painel de cookies (opcional — só útil se um dia hospedar na nuvem)

## Portas

| Ambiente        | URL                      |
|-----------------|--------------------------|
| Docker local    | http://localhost:8090    |
| Python direto   | http://127.0.0.1:8000    |

> A porta 8090 foi escolhida para não conflitar com outros serviços na 8080.
