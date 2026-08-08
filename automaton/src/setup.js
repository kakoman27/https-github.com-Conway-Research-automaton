/**
 * Asistente de configuración interactivo (--setup).
 * Pide nombre, objetivo, modo de cerebro y escribe config.json + SOUL.md.
 *
 * Robusto para dos modos:
 *  - Terminal interactiva (TTY): preguntas clásicas con readline.
 *  - Entrada por tubería (pipes/CI): lee stdin completo de forma síncrona.
 */
import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DEFAULTS, saveConfig, writeSoul } from './config.js';

function createPrompter() {
  const isTTY = Boolean(input.isTTY);
  let lines = [];
  if (!isTTY) {
    try { lines = fs.readFileSync(0, 'utf8').split('\n'); } catch { /* stdin no legible */ }
  }
  const rl = isTTY ? readline.createInterface({ input, output }) : null;
  let i = 0;

  async function ask(prompt) {
    if (rl) return (await rl.question(prompt)).trim();
    process.stdout.write(prompt);
    const line = (lines[i] ?? '').trim();
    i += 1;
    return line;
  }

  function close() {
    if (rl) rl.close();
  }

  return { ask, close };
}

export async function runSetup(config) {
  const { ask, close } = createPrompter();

  console.log('\n=== Configuración del autómata ===\n');

  const name = (await ask(`Nombre del autómata [${config.name}]: `)) || config.name;

  const goal = (await ask(`Objetivo (ej: "explora este repo y escribe un informe"): `)) || config.goal;

  const modeRaw = (await ask(`Cerebro [auto|llm|reflex] (auto=${DEFAULTS.brainMode}): `));
  const brainMode = ['auto', 'llm', 'reflex'].includes(modeRaw) ? modeRaw : config.brainMode;

  const shellRaw = (await ask('¿Permitir shell? (s/N, recomendado NO): ')).toLowerCase();
  const allowShell = shellRaw === 's' || shellRaw === 'si' || shellRaw === 'y' || shellRaw === 'yes';

  const turnsRaw = await ask(`Máximo de turnos [${config.maxTurns}]: `);
  const maxTurns = turnsRaw && Number.isFinite(Number(turnsRaw)) ? Number(turnsRaw) : config.maxTurns;

  const next = { ...config, name, goal, brainMode, allowShell, maxTurns };
  saveConfig(next);
  writeSoul(next);

  console.log('\n✅ Configuración guardada en', next.dataDir + '/config.json');
  console.log('✅ SOUL.md generado\n');
  console.log('Panel honesto:');
  console.log('  • Este autómata NO genera dinero por sí solo.');
  console.log('  • Sus herramientas ayudan a completar bounties/trabajo remunerado');
  console.log('    que TÚ cobras en tu propia cuenta (nunca pagues por cobrar).');
  console.log('  • Modo reflex funciona sin API key. Modo llm usa OPENAI_API_KEY.\n');

  close();
  return next;
}
