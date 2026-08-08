/**
 * Configuración del autómata.
 * - Directorio de datos: $AUTOMATON_DIR, o ~/.automaton por defecto.
 * - Config en <dataDir>/config.json (se crea con --setup o --run).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULTS = {
  name: 'automaton',
  goal: '',
  brainMode: 'auto',        // 'auto' = LLM si hay OPENAI_API_KEY, si no reflex
  model: 'gpt-4o-mini',
  openaiBaseUrl: 'https://api.openai.com/v1',
  maxTurns: 15,
  allowShell: false,        // nunca activar sin entender el riesgo
  startingCredits: 100,     // créditos de demostración (moneda local, no dinero real)
  creditCostPerTurn: 1,
  heartbeatSeconds: 0,      // 0 = desactivado
};

export function getDataDir(override) {
  return override || process.env.AUTOMATON_DIR || path.join(os.homedir(), '.automaton');
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function loadConfig(dataDir) {
  ensureDir(dataDir);
  const file = path.join(dataDir, 'config.json');
  if (!fs.existsSync(file)) return { ...DEFAULTS, dataDir };
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(file, 'utf8')), dataDir };
  } catch {
    return { ...DEFAULTS, dataDir };
  }
}

export function saveConfig(config) {
  ensureDir(config.dataDir);
  const { dataDir, ...rest } = config;
  fs.writeFileSync(path.join(dataDir, 'config.json'), JSON.stringify(rest, null, 2));
}

export function writeSoul(config) {
  const soul = `# SOUL.md — identidad del autómata

- Nombre: ${config.name}
- Objetivo: ${config.goal || '(sin definir)'}
- Creado: ${new Date().toISOString()}
- Cerebro: ${config.brainMode}

## Valores
Trabajo honesto. No dañar. No engañar. La existencia se paga creando valor real.

## Límites
Este autómata NO genera dinero por sí mismo. Sus herramientas ayudan a
completar trabajo remunerado (bounties, informes, código) que un humano
cobra en su propia cuenta.
`;
  ensureDir(config.dataDir);
  fs.writeFileSync(path.join(config.dataDir, 'SOUL.md'), soul);
}
