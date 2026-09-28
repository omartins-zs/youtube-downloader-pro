@echo off
title YouTube Downloader Pro (Docker)
echo ========================================================
echo    YouTube Downloader Pro  -  subindo com Docker
echo ========================================================
echo.
echo Construindo e iniciando o container...
docker compose up -d --build
if errorlevel 1 (
    echo.
    echo [ERRO] Nao foi possivel iniciar. O Docker Desktop esta aberto?
    pause
    exit /b 1
)
echo.
echo Servidor no ar! Abrindo no navegador...
timeout /t 4 /nobreak >nul
start http://localhost:8090
echo.
echo Pronto. Cole o link do YouTube e baixe.
echo Os arquivos aparecem na pasta "downloads".
echo.
echo Para PARAR depois, rode: docker-stop.bat
pause
