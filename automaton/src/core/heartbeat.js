/**
 * Heartbeat: tareas programadas mientras el autómata vive.
 * En esta versión: check_credits + ping de vida, a intervalos configurables.
 */
export async function runHeartbeatTicks(config, ctx, { intervalMs = 2000, ticks = 3 } = {}) {
  let n = 0;
  await new Promise((resolve) => {
    const id = setInterval(() => {
      n += 1;
      try {
        const s = ctx.survival.status();
        ctx.log(`[heartbeat ${n}/${ticks}] check_credits → ${s.credits} créditos (tier ${s.tier})`);
        ctx.memory.append({ type: 'heartbeat', tick: n, tier: s.tier, credits: s.credits });
      } catch (e) {
        ctx.log(`[heartbeat] error: ${e.message}`);
      }
      if (n >= ticks) {
        clearInterval(id);
        resolve();
      }
    }, intervalMs);
  });
}

export function startHeartbeat(config, ctx, { intervalSec = 30 } = {}) {
  if (!intervalSec || intervalSec <= 0) return () => {};
  const id = setInterval(() => {
    try {
      const s = ctx.survival.status();
      ctx.log(`[heartbeat] alive — ${s.credits} créditos (tier ${s.tier})`);
      ctx.memory.append({ type: 'heartbeat', tier: s.tier, credits: s.credits });
    } catch { /* el proceso principal decide si muere */ }
  }, intervalSec * 1000);
  return () => clearInterval(id);
}
