/**
 * Asistente de configuración interactivo (--setup).
 * Pide nombre, objetivo, modo de cerebro y escribe config.json + SOUL.md.
 */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DEFAULTS, saveConfig, writeSoul } from './config.js';

export async function runSetup(config) {
  const rl = readline.createInterface({ input, output });

  console.log('\n=== Configuración del autómata ===\n');

  const name = (await rl.question(`Nombre del autómata [${config.name}]: `)).trim() || config.name;

  const goal = (await rl.question(`Objetivo (ej: "explora este repo y escribe un informe"): `)).trim() || config.goal;

  const modeRaw = (await rl.question(`Cerebro [auto|llm|reflex] (auto=${DEFAULTS.brainMode}): `)).trim();
  const brainMode = ['auto', 'llm', 'reflex'].includes(modeRaw) ? modeRaw : config.brainMode;

  const shellRaw = (await rl.question(`¿Permitir shell? (s/N, recomendado NO): `)).trim().toLowerCase();
  const allowShell = shellRaw === 's' || shellRaw === 'si' || shellRaw === 'y' || shellRaw === 'yes';

  const turnsRaw = (await rl.question(`Máximo de turnos [${config.maxTurns}]: `)).trim();
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

  rl.close();
  return next;
}
