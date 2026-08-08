/**
 * Sistema de supervivencia local (inspirado en Conway, sin nube):
 * créditos de demostración + tiers normal → low_compute → critical → dead.
 * Es una MONEDA LOCAL de demostración, NO dinero real.
 */
import fs from 'node:fs';
import path from 'node:path';

const TIERS = [
  { name: 'normal', min: 50 },
  { name: 'low_compute', min: 10 },
  { name: 'critical', min: 1 },
  { name: 'dead', min: 0 },
];

export function createSurvival(config) {
  const file = path.join(config.dataDir, 'state', 'ledger.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });

  let ledger = { credits: config.startingCredits, spent: 0, startedAt: new Date().toISOString() };
  if (fs.existsSync(file)) {
    try { ledger = { ...ledger, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { /* usar defaults */ }
  }

  function save() {
    fs.writeFileSync(file, JSON.stringify(ledger, null, 2));
  }

  function tier() {
    for (const t of TIERS) if (ledger.credits >= t.min) return t.name;
    return 'dead';
  }

  function charge(cost) {
    ledger.credits = Math.max(0, ledger.credits - cost);
    ledger.spent += cost;
    save();
    return ledger.credits;
  }

  function status() {
    return { credits: ledger.credits, spent: ledger.spent, tier: tier(), startedAt: ledger.startedAt };
  }

  return { charge, status, file };
}
