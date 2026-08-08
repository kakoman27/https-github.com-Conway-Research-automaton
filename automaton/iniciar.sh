#!/bin/sh
# Autómata — iniciador para macOS / Linux
# Uso: doble clic, o en terminal:  sh iniciar.sh

cd "$(dirname "$0")" || exit 1

echo "============================================"
echo "  AUTOMATA - Iniciador (macOS / Linux)"
echo "============================================"
echo

echo "[1/4] Comprobando Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo
    echo " ERROR: No encuentro Node.js."
    echo " Instalalo desde https://nodejs.org (boton verde LTS)"
    echo " y despues vuelve a ejecutar este archivo."
    echo
    exit 1
fi
echo " OK, Node.js $(node --version) listo."
echo

echo "[2/4] Demo de prueba (10 segundos)..."
node src/index.js --demo
echo

echo "[3/4] Configuracion..."
if [ ! -f "$HOME/.automaton/config.json" ]; then
    echo " Primera vez: te hare 5 preguntas para configurar tu automata."
    echo " (Pulsa Enter para dejar el valor que aparece entre corchetes)"
    echo
    node src/index.js --setup
else
    echo " Ya tienes configuracion guardada. La usare tal cual."
    echo
fi

echo "[4/4] Ejecutando el automata..."
node src/index.js --run
echo

echo "Estado final:"
node src/index.js --status
echo
echo "============================================"
echo " LISTO. Todo quedo guardado en: ~/.automaton"
echo "============================================"
