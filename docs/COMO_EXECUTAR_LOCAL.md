# Como Executar Localmente — YouTube Downloader Pro

Guia para rodar **sem Docker**, utilizando **Python** diretamente no seu computador.

> **Não quer instalar Python ou dependências?** Use [COMO_EXECUTAR_DOCKER.md](COMO_EXECUTAR_DOCKER.md) — basta ter o Docker Desktop.

---

## Requisitos

| Ferramenta | Obrigatório? | Versão recomendada |
| --- | --- | --- |
| **Python** | Sim | 3.10+ |
| **Pip** | Sim | 22+ |
| **Navegador Web** | Sim | Chrome, Edge, Firefox ou Brave |

> O FFmpeg já é resolvido e empacotado automaticamente através da biblioteca `imageio-ffmpeg` sem necessidade de instalação manual.

---

## 1) Preparar ambiente

### 1.1 Acessar a pasta do projeto

```bash
cd C:/Users/gabriel.martins/.gemini/antigravity-ide/scratch/youtube-downloader
```

### 1.2 Copiar variáveis de ambiente

```bash
cp .env.example .env
```

No PowerShell:
```powershell
Copy-Item .env.example .env
```

### 1.3 Ativar o ambiente local

Mantenha o bloco `LOCAL` ativo e o bloco `DOCKER` comentado no `.env`:

```env
# LOCAL
APP_ENV=local
APP_URL=http://127.0.0.1:8000
APP_HOST=127.0.0.1
APP_PORT=8000
DOWNLOADS_DIR=downloads

# DOCKER
# APP_ENV=production
# APP_URL=http://localhost:8080
# APP_HOST=0.0.0.0
# APP_PORT=8080
# DOWNLOADS_DIR=/app/downloads
```

---

## 2) Instalar dependências

```bash
pip install -r requirements.txt
```

---

## 3) Executar aplicação

```bash
python main.py
```

Ou no Windows, utilize o inicializador rápido:
```cmd
start.bat
```

Aplicação:
👉 **http://127.0.0.1:8000**

---

## 4) Acessos e Recursos

| Recurso | URL |
| --- | --- |
| Interface Web | http://127.0.0.1:8000 |
| Swagger API (OpenAPI) | http://127.0.0.1:8000/docs |
| Health Check | http://127.0.0.1:8000/health |

---

## 5) Problemas comuns

### Porta 8000 ocupada
Altere a variável `APP_PORT=8001` no arquivo `.env`.

### Erro ao extrair vídeo
Execute a atualização do `yt-dlp`:
```bash
pip install --upgrade yt-dlp
```

---

## Próximo passo
Para ambiente containerizado, consulte [COMO_EXECUTAR_DOCKER.md](COMO_EXECUTAR_DOCKER.md).
