@echo off
title IVPS Mechatronics Marketplace Server
echo ==========================================================
echo          IVPS MECHATRONICS - B2B MACHINERY MARKETPLACE   
echo ==========================================================
cd /d "%~dp0backend"
set PATH=C:\Users\LENOVO\AppData\Local\Python\pythoncore-3.14-64;%PATH%
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
