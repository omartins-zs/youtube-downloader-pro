# Como Executar com Docker — YouTube Downloader Pro

Guia para executar o sistema utilizando Docker Desktop ou Docker Engine em qualquer sistema operacional (Windows, Linux, macOS).

---

## Stack e containers

| Container | Função | Porta no Host |
| --- | --- | --- |
| `yt_downloader_app` | API FastAPI + Servidor Web + FFmpeg + yt-dlp | `8080` |

---

## 1) Preparar ambiente

Copie o `.env.example` para `.env` se ainda não existir:

```bash
cp .env.example .env
```

Deixe o bloco `DOCKER` ativo e o bloco `LOCAL` comentado:

```env
# LOCAL
# APP_ENV=local
# APP_URL=http://127.0.0.1:8000
# APP_HOST=127.0.0.1
# APP_PORT=8000
# DOWNLOADS_DIR=downloads

# DOCKER
APP_ENV=production
APP_URL=http://localhost:8080
APP_HOST=0.0.0.0
APP_PORT=8080
DOWNLOADS_DIR=/app/downloads
```

---

## 2) Subir containers

Execute no terminal:

```bash
docker compose up -d --build
```

Verifique se o container está saudável e em execução:

```bash
docker compose ps
```

---

## 3) Acessos

| Recurso | URL |
| --- | --- |
| Aplicação Web | http://localhost:8080 |
| Swagger API (OpenAPI) | http://localhost:8080/docs |
| Health Check | http://localhost:8080/health |

---

## 4) Logs e diagnóstico

Para acompanhar os logs em tempo real:

```bash
docker compose logs -f app
```

---

## 5) Parar ou reconstruir

Para parar o container:
```bash
docker compose down
```

Para reconstruir o container após alterações:
```bash
docker compose up -d --build
```
