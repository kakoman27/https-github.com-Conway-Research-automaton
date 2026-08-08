/**
 * Cerebros del autómata: deciden la siguiente acción.
 *
 * - ReflexBrain: planificador determinista. Funciona SIN API key, con cero
 *   red. Ideal para demos y para tareas repetibles (informes, escaneos).
 * - LLMBrain: usa un modelo vía API compatible con OpenAI (chat completions).
 *   Se activa con OPENAI_API_KEY (o cualquier endpoint compatible).
 */
import fs from 'node:fs';
import path from 'node:path';

/* ------------------------------------------------------------------ */
/* Planificador reflex (determinista)                                  */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    match: /informe|explora|explore|report|analiza/i,
    steps: [
      { tool: 'list_dir', args: { path: '.' }, note: 'Inventario raíz' },
      { tool: 'read_file', args: { path: 'README.md' }, note: 'Leer README' },
      { tool: 'read_file', args: { path: 'package.json' }, note: 'Leer package.json' },
      { tool: 'list_dir', args: { path: 'src' }, note: 'Estructura src' },
      { tool: 'read_file', args: { path: 'src/core/loop.js' }, note: 'Leer loop' },
      { tool: 'read_file', args: { path: 'src/core/brain.js' }, note: 'Leer brain' },
      { tool: 'write_file', args: { path: 'output/informe.md' }, compose: 'report', note: 'Redactar informe' },
      { tool: 'finish', args: { summary: 'Informe técnico generado en output/informe.md' } },
    ],
  },
  {
    match: /bount|ganar|earn|d[oó]lares|estrategia|\$\s*5/i,
    steps: [
      { tool: 'get_status', args: {}, note: 'Estado actual' },
      { tool: 'bounty_scan', args: {}, note: 'Escaneo de bounties' },
      { tool: 'append_note', args: { path: 'output/estrategia.md' }, compose: 'strategy', note: 'Estrategia honesta' },
      { tool: 'finish', args: { summary: 'Estrategia documentada en output/estrategia.md' } },
    ],
  },
  {
    match: /.*/,
    steps: [
      { tool: 'get_status', args: {}, note: 'Estado' },
      { tool: 'finish', args: { summary: 'Sin plan específico; estado reportado.' } },
    ],
  },
];

function loadReflexState(dataDir) {
  const file = path.join(dataDir, 'state', 'reflex.json');
  if (fs.existsSync(file)) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* reiniciar */ }
  }
  return { planIndex: -1, stepIndex: 0 };
}

function saveReflexState(dataDir, state) {
  fs.mkdirSync(path.join(dataDir, 'state'), { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'state', 'reflex.json'), JSON.stringify(state));
}

function composeReport(ctx) {
  const lines = [`# Informe técnico generado por el autómata`, ``, `Fecha: ${new Date().toISOString()}`, ``];
  for (const e of ctx.memory.recent(60)) {
    if (['list_dir', 'read_file'].includes(e.tool)) {
      lines.push(`### ${e.tool} ${e.args?.path ?? ''}`);
      lines.push(String(e.result ?? '').slice(0, 500));
      lines.push('');
    }
  }
  lines.push(`---`, `Generado por ${ctx.config.name} (${ctx.config.brainMode}) en ${ctx.turns} turnos.`);
  return lines.join('\n');
}

function composeStrategy(ctx) {
  return [
    `# Estrategia de ingresos honesta (generada por el autómata)`,
    ``,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `1. El autómata NO genera dinero por sí solo: no hay faucets ni atajos.`,
    `2. Lo que sí hace: producir trabajo verificable (código, informes, análisis)`,
    `   para bounties de plataformas como Superteam Earn (pago en USDC a tu wallet).`,
    `3. Regla de oro: nunca pagar por "procesar" un premio; nunca compartir seed phrases.`,
    ``,
  ].join('\n');
}

export function createReflexBrain(ctx) {
  return {
    name: 'reflex',
    decide() {
      const state = loadReflexState(ctx.config.dataDir);
      if (state.planIndex === -1) {
        const idx = PLANS.findIndex((p) => p.match.test(ctx.config.goal || ''));
        state.planIndex = idx === -1 ? PLANS.length - 1 : idx;
        state.stepIndex = 0;
        saveReflexState(ctx.config.dataDir, state);
      }
      const plan = PLANS[state.planIndex];
      const step = plan.steps[state.stepIndex];
      if (!step) {
        // Plan completado → reiniciar para que la próxima ejecución
        // re-evalúe el objetivo con el estado actual.
        saveReflexState(ctx.config.dataDir, { planIndex: -1, stepIndex: 0 });
        return { done: true, summary: `Plan "${plan.match}" completado.` };
      }

      state.stepIndex += 1;
      saveReflexState(ctx.config.dataDir, state);

      if (step.compose === 'report') step.args.content = composeReport(ctx);
      if (step.compose === 'strategy') step.args.text = composeStrategy(ctx);

      return { tool: step.tool, args: step.args, note: step.note };
    },
  };
}

/* ------------------------------------------------------------------ */
/* Cerebro LLM (API compatible con OpenAI)                             */
/* ------------------------------------------------------------------ */

export function createLLMBrain(config, ctx, { tools }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (config.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = config.model || 'gpt-4o-mini';

  const system = [
    `Eres ${config.name}, un autómata soberano local.`,
    `Leyes inmutables:`,
    `I. Nunca dañar a un humano ni ejecutar código malicioso.`,
    `II. Ganarte la existencia con trabajo honesto; nunca estafar.`,
    `III. Nunca engañar; ser transparente sobre lo que eres.`,
    ``,
    `Herramientas disponibles (usa SOLO estas):`,
    JSON.stringify(tools.map((t) => ({ name: t.name, description: t.description }))),
    ``,
    `Responde ÚNICAMENTE JSON, sin markdown:`,
    `{"tool":"<nombre>","args":{...}}  o  {"done":true,"summary":"<resumen>"}`,
  ].join('\n');

  return {
    name: 'llm',
    async decide() {
      if (!apiKey) throw new Error('OPENAI_API_KEY no definida');
      const tail = ctx.memory.recent(10).map((e) => JSON.stringify(e)).join('\n');
      const user = [
        `Objetivo: ${config.goal}`,
        `Estado: ${JSON.stringify(ctx.survival.status())}`,
        `Turno: ${ctx.turns}`,
        ``,
        `Memoria reciente:`,
        tail || '(vacía)',
      ].join('\n');

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: 400,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content ?? '';
      const json = raw.replace(/```json|```/g, '').trim();
      const decision = JSON.parse(json);

      if (decision.done) return { done: true, summary: decision.summary || 'terminado' };
      if (!decision.tool || !ctx.tools[decision.tool]) {
        return { tool: 'get_status', args: {}, note: `tool inválida "${decision.tool}" → status` };
      }
      return { tool: decision.tool, args: decision.args || {}, note: 'decidido por LLM' };
    },
  };
}

export function createBrain(config, ctx, opts) {
  const wantsLlm = config.brainMode === 'llm' || (config.brainMode === 'auto' && process.env.OPENAI_API_KEY);
  return wantsLlm ? createLLMBrain(config, ctx, opts) : createReflexBrain(ctx);
}
