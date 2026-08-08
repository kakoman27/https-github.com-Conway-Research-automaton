@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   AUTOMATA - Iniciador para Windows
echo ============================================
echo.

echo [1/4] Comprobando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: No encuentro Node.js.
    echo  Instalalo desde https://nodejs.org  (boton verde LTS)
    echo  y despues vuelve a abrir este archivo.
    echo.
    pause
    exit /b 1
)
echo  OK, Node.js listo.
echo.

echo [2/4] Demo de prueba (10 segundos)...
node src/index.js --demo
echo.

echo [3/4] Configuracion...
if not exist "%USERPROFILE%\.automaton\config.json" (
    echo  Primera vez: te hare 5 preguntas para configurar tu automata.
    echo  (Pulsa Enter para dejar el valor que aparece entre corchetes)
    echo.
    node src/index.js --setup
) else (
    echo  Ya tienes configuracion guardada. La usare tal cual.
    echo.
)

echo [4/4] Ejecutando el automata...
node src/index.js --run
echo.

echo Estado final:
node src/index.js --status
echo.
echo ============================================
echo  LISTO. Todo quedo guardado en:
echo  %USERPROFILE%\.automaton
echo ============================================
pause
