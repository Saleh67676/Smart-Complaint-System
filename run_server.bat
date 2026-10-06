@echo off
cd /d "%~dp0"
if exist ".local-venv\Scripts\python.exe" (
  ".local-venv\Scripts\python.exe" main.py
) else (
  ".venv\Scripts\python.exe" main.py
)
pause
