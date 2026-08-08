#!/usr/bin/env node
/**
 * Conway Automaton Local — punto de entrada CLI.
 *
 * Uso:
 *   node src/index.js --run        Arranca el bucle (wizard si no hay config)
 *   node src/index.js --setup      Asistente de configuración
 *   node src/index.js --status     Estado actual
 *   node src/index.js --demo       Demo autónoma (sin API key, sin red)
 *   node src/index.js --selftest   Prueba rápida de herramientas
 *   node src/index.js --help
 *
 * Entorno:
 *   AUTOMATON_DIR   directorio de datos (por defecto ~/.automaton)
 *   OPENAI_API_KEY  activa el cerebro LLM (modo auto)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEFAULTS, getDataDir, loadConfig, saveConfig, writeSoul, PROJECT_ROOT } from './config.js';
import { runAgent } from './core/loop.js';
import { runHeartbeatTicks } from './core/heartbeat.js';
import { createMemory } from './core/memory.js';
import { createSurvival } from './core/survival.js';
import { createTools } from './core/tools.js';
import { runSetup } from './setup.js';

const args = process.argv.slice(2);

function help() {
  console.log(`Conway Automaton Local v0.1.0 — autómata soberano local-first

Uso:
  node src/index.js --run        Arranca el bucle (wizard si no hay config)
  node src/index.js --setup      Asistente de configuración
  node src/index.js --status     Estado actual
  node src/index.js --demo       Demo autónoma (sin API key, sin red)
  node src/index.js --selftest   Prueba rápida de herramientas
  node src/index.js --help       Esto

Entorno:
  AUTOMATON_DIR   directorio de datos (por defecto ~/.automaton)
  OPENAI_API_KEY  activa el cerebro LLM (modo auto)

Zero dependencias: npm install NO es necesario para ejecutar.`);
}

async function selftest() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-test-'));
  const config = { ...DEFAULTS, dataDir: dir, goal: 'selftest', brainMode: 'reflex', maxTurns: 3 };
  const ctx = { config, memory: createMemory(dir), survival: createSurvival(config), turns: 0 };
  ctx.tools = createTools(config, ctx);
  ctx.log = (l) => console.log(l);

  const cases = [
    ['list_dir', { path: '.' }],
    ['read_file', { path: 'package.json' }],
    ['write_file', { path: 'output/prueba.txt', content: 'hola' }],
    ['check_credits', {}],
    ['get_status', {}],
    ['shell', { cmd: 'ls' }], // debe responder "desactivado"
  ];
  for (const [tool, a] of cases) {
    const r = await ctx.tools[tool].run(a);
    console.log(`✔ ${tool}: ${String(r).slice(0, 80).replace(/\n/g, ' | ')}`);
  }
  console.log('\nSELFTEST OK');
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) return help();
  if (args.includes('--selftest')) return selftest();

  if (args.includes('--demo')) {
    const dataDir = path.join(PROJECT_ROOT, '.demo-state');
    fs.rmSync(dataDir, { recursive: true, force: true });
    const config = {
      ...DEFAULTS,
      dataDir,
      name: 'DemoBot',
      goal: 'explora el código de este autómata y escribe un informe técnico en output/informe.md',
      brainMode: 'reflex',
      maxTurns: 12,
    };
    saveConfig(config);
    writeSoul(config);
    console.log(`Demo en ${dataDir}\n`);
    const result = await runAgent(config);
    console.log(`\nDemo terminada: ${JSON.stringify(result, null, 2)}`);

    console.log('\n--- Heartbeat de muestra (2 ticks) ---');
    const memory = createMemory(dataDir);
    const survival = createSurvival(config);
    const ctx = { config, memory, survival, tools: null, turns: result.turns, log: (l) => console.log(l) };
    await runHeartbeatTicks(config, ctx, { intervalMs: 1500, ticks: 2 });
    return result;
  }

  const dataDir = getDataDir();
  let config = loadConfig(dataDir);

  if (args.includes('--setup')) {
    config = await runSetup(config);
    return;
  }

  if (args.includes('--status')) {
    const memory = createMemory(dataDir);
    const survival = createSurvival(config);
    const s = survival.status();
    console.log(`Nombre:     ${config.name}`);
    console.log(`Objetivo:   ${config.goal || '(sin definir)'}`);
    console.log(`Cerebro:    ${config.brainMode}${process.env.OPENAI_API_KEY ? ' (LLM disponible)' : ''}`);
    console.log(`Créditos:   ${s.credits} (tier ${s.tier})`);
    console.log(`Memoria:    ${memory.count()} entradas`);
    console.log(`Data dir:   ${dataDir}`);
    return;
  }

  if (args.includes('--run')) {
    if (!fs.existsSync(path.join(dataDir, 'config.json'))) {
      console.log('Sin configuración → lanzando wizard...\n');
      config = await runSetup(config);
    }
    const result = await runAgent(config);
    console.log(`\nResultado: ${JSON.stringify(result)}`);
    return;
  }

  help();
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
