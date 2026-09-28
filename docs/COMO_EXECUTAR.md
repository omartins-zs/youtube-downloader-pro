# Como Executar — YouTube Downloader Pro

Escolha **um** guia conforme seu ambiente:

| Guia | Quando usar | Requisitos no PC |
| --- | --- | --- |
| **[COMO_EXECUTAR_LOCAL.md](COMO_EXECUTAR_LOCAL.md)** | Executar e desenvolver diretamente no computador (Windows / Mac / Linux) | Python 3.10+ |
| **[COMO_EXECUTAR_DOCKER.md](COMO_EXECUTAR_DOCKER.md)** | Executar em qualquer máquina com containers isolados | Docker Desktop |
| **[COMO_EXECUTAR_RENDER.md](COMO_EXECUTAR_RENDER.md)** | Hospedar online gratuitamente no Render.com ou nuvem | Conta no GitHub / Render |

---

## Início rápido

### Local — Python / Windows

Ative o bloco `LOCAL` no `.env` e execute:

```bash
cp .env.example .env
pip install -r requirements.txt
python main.py
```

Ou no Windows simplesmente execute com 2 cliques:
```cmd
start.bat
```

Aplicação:
👉 **http://127.0.0.1:8000**

---

### Docker

Ative o bloco `DOCKER` no `.env` e execute:

```bash
cp .env.example .env
docker compose up -d --build
```

Aplicação:
👉 **http://localhost:8080**

---

## URLs principais

| Área | Local | Docker |
| --- | --- | --- |
| Aplicação Web Principal | http://127.0.0.1:8000 | http://localhost:8080 |
| Health Check / Status | http://127.0.0.1:8000/health | http://localhost:8080/health |
| Documentação Swagger API | http://127.0.0.1:8000/docs | http://localhost:8080/docs |

---

## Outros documentos

- [COMO_EXECUTAR_LOCAL.md](COMO_EXECUTAR_LOCAL.md) — Guia detalhado de execução local
- [COMO_EXECUTAR_DOCKER.md](COMO_EXECUTAR_DOCKER.md) — Guia detalhado de execução com Docker Compose
- [COMO_EXECUTAR_RENDER.md](COMO_EXECUTAR_RENDER.md) — Guia passo a passo de deploy gratuito no Render.com
