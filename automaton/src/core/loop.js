/**
 * Bucle principal: pensar → actuar → observar → repetir.
 * - Cobra créditos por turno (moneda local de demostración).
 * - Detecta bucles (3 turnos seguidos solo-lectura → termina).
 * - Registra cada turno en memoria (JSONL).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createMemory } from './memory.js';
import { createSurvival } from './survival.js';
import { createTools, toolsList } from './tools.js';
import { createBrain } from './brain.js';

const READ_ONLY = new Set(['list_dir', 'read_file', 'check_credits', 'get_status', 'fetch_url', 'bounty_scan']);

export async function runAgent(config, { verbose = true } = {}) {
  fs.mkdirSync(path.join(config.dataDir, 'state'), { recursive: true });

  const memory = createMemory(config.dataDir);
  const survival = createSurvival(config);
  const ctx = { config, memory, survival, tools: null, turns: 0 };

  const logFile = path.join(config.dataDir, 'transcript.log');
  const log = (line) => {
    const ts = new Date().toISOString();
    const out = `[${ts}] ${line}`;
    if (verbose) console.log(out);
    fs.appendFileSync(logFile, out + '\n');
  };
  ctx.log = log;

  ctx.tools = createTools(config, ctx);
  const brain = createBrain(config, ctx, { tools: toolsList(ctx.tools) });

  log(`🚀 ${config.name} arranca. Objetivo: ${config.goal || '(sin definir)'}`);
  log(`Cerebro: ${brain.name} | Créditos: ${survival.status().credits} | Tier: ${survival.status().tier}`);

  let idle = 0;
  let finalSummary = 'sin resumen';

  for (let turn = 1; turn <= config.maxTurns; turn++) {
    ctx.turns = turn;
    survival.charge(config.creditCostPerTurn);
    const status = survival.status();
    if (status.tier === 'dead') {
      log(`💀 Tier DEAD: sin créditos. El autómata se detiene.`);
      finalSummary = 'detenido por falta de créditos';
      break;
    }

    let decision;
    try {
      decision = await brain.decide();
    } catch (e) {
      log(`⚠️  Error del cerebro: ${e.message}`);
      decision = { tool: 'get_status', args: {}, note: 'fallback tras error' };
    }

    if (decision.done) {
      finalSummary = decision.summary || 'terminado';
      log(`✅ ${finalSummary}`);
      break;
    }

    const tool = ctx.tools[decision.tool];
    if (!tool) {
      log(`❌ Herramienta desconocida: ${decision.tool}`);
      idle++;
      continue;
    }

    log(`▶ turno ${turn}/${config.maxTurns} [${status.tier}] ${decision.note || decision.tool} → ${decision.tool} ${JSON.stringify(decision.args).slice(0, 120)}`);

    let result;
    try {
      result = await tool.run(decision.args);
    } catch (e) {
      result = `[error de herramienta] ${e.message}`;
    }

    const clipped = String(result).slice(0, 1500);
    memory.append({ type: 'turn', turn, tool: decision.tool, args: decision.args, result: clipped });
    log(`  ← ${clipped.split('\n').slice(0, 4).join('\n  ')}`);

    // Anti-bucle: solo para cerebros LLM (donde un modelo puede repetirse).
    // El cerebro reflex está acotado por su plan y por maxTurns.
    if (config.brainMode === 'llm') {
      if (READ_ONLY.has(decision.tool)) idle++;
      else idle = 0;

      if (idle >= 3) {
        log(`🛑 3 turnos solo-lectura sin progreso: forzando fin.`);
        finalSummary = 'detenido por bucle de solo-lectura';
        break;
      }
    }
  }

  const s = survival.status();
  log(`🏁 Fin. Resumen: ${finalSummary}`);
  log(`Estado final: ${s.credits} créditos | tier ${s.tier} | ${memory.count()} entradas de memoria`);
  log(`Registro completo en ${logFile}`);

  return { summary: finalSummary, status: s, turns: ctx.turns, memoryEntries: memory.count() };
}
