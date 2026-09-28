# Como Executar com Cloudflare Tunnels (Self-Hosted Gratuito) — YouTube Downloader Pro

O **Cloudflare Tunnel (Quick Tunnel / Named Tunnel)** permite que você execute a aplicação no seu próprio computador e a exponha para a internet através de um link público seguro com **HTTPS gratuito**, sem precisar abrir portas no roteador (*port forwarding*) e sem pagar hospedagem.

---

## ⚡ Vantagens do Cloudflare Tunnel para este Projeto
1. **Sem limite de tempo (timeout)**: Vídeos longos em 4K e conversões pesadas rodam direto no processador da sua máquina.
2. **Sem bloqueio de IP do YouTube**: O download ocorre a partir do seu IP residencial local, evitando os captchas da AWS/Vercel/Render.
3. **100% Gratuito e Ilimitado**.

---

## 🚀 Opção 1: Quick Tunnel Instantâneo (Sem precisar de conta ou domínio)

1. Baixe o executável oficial do **cloudflared** para Windows:
   👉 [https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe)
2. Renomeie o arquivo baixado para `cloudflared.exe` e coloque na pasta do projeto:
   `C:\Users\gabriel.martins\.gemini\antigravity-ide\scratch\youtube-downloader`
3. Com o servidor rodando (`python main.py` na porta 8000), abra um terminal na pasta e execute:
   ```cmd
   cloudflared.exe tunnel --url http://127.0.0.1:8000
   ```
4. O terminal gerará automaticamente uma URL pública temporária HTTPS:
   `https://random-subdomain.trycloudflare.com`

---

## 🔒 Opção 2: Named Tunnel Permanente (Com seu próprio domínio gratuito na Cloudflare)

1. Crie uma conta no **[Cloudflare Zero Trust](https://one.dash.cloudflare.com/)**.
2. Vá em **Networks** ➔ **Tunnels** ➔ **Create a Tunnel**.
3. Escolha o conector **Cloudflared**.
4. Copie o comando com o seu token e execute no seu terminal.
5. No painel da Cloudflare, aponte a rota para:
   - **Service**: `HTTP`
   - **URL**: `127.0.0.1:8000` (ou `localhost:8080` se estiver rodando via Docker).
