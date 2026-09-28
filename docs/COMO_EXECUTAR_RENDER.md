# Como Hospedar Grátis no Render.com — YouTube Downloader Pro

Este projeto já está 100% configurado com `Dockerfile` e `render.yaml` prontos para deploy gratuito e automático no [Render.com](https://render.com).

---

## 📋 Pré-requisitos
1. Uma conta gratuita no **[GitHub](https://github.com)**.
2. Uma conta gratuita no **[Render.com](https://render.com)**.

---

## 🚀 Passo a Passo de Deploy no Render

### 1) Subir o projeto para o seu GitHub
1. Crie um novo repositório no GitHub (ex: `youtube-downloader-pro`).
2. Faça o push dos arquivos desta pasta para o seu repositório:
```bash
git init
git add .
git commit -m "feat: YouTube Downloader Pro"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/youtube-downloader-pro.git
git push -u origin main
```

---

### 2) Criar o Web Service no Render
1. Acesse o **[Dashboard do Render](https://dashboard.render.com/)**.
2. Clique no botão **`New +`** no topo direito e selecione **`Web Service`**.
3. Selecione a opção **`Build and deploy from a Git repository`** e conecte seu repositório do GitHub.
4. Preencha as configurações básicas:
   - **Name**: `youtube-downloader-pro`
   - **Region**: Qualquer uma (ex: `Frankfurt` ou `Ohio`)
   - **Branch**: `main`
   - **Runtime / Environment**: Selecione **`Docker`**
   - **Plan**: Selecione **`Free`** ($0/mês)
5. Clique no botão **`Deploy Web Service`**.

---

### 3) Pronto!
O Render irá:
- Baixar a imagem Python com FFmpeg;
- Instalar as dependências do `requirements.txt`;
- Iniciar a aplicação na porta configurada;
- Gerar uma URL pública e segura com HTTPS (ex: `https://youtube-downloader-pro.onrender.com`).

---

## ⚡ Dica sobre o Plano Gratuito do Render
No plano gratuito do Render, se o serviço ficar sem receber acessos por 15 minutos, ele entra em modo de repouso (*spin down*). Na primeira requisição seguinte, ele leva cerca de 30 a 50 segundos para acordar e depois funciona em velocidade total.
