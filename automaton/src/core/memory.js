/**
 * Memoria episódica simple: archivo JSONL (una entrada por línea).
 * Sin dependencias nativas — funciona en cualquier Node >= 20.
 */
import fs from 'node:fs';
import path from 'node:path';

export function createMemory(dataDir) {
  const file = path.join(dataDir, 'state', 'memory.jsonl');
  fs.mkdirSync(path.dirname(file), { recursive: true });

  function append(entry) {
    const line = JSON.stringify({ t: new Date().toISOString(), ...entry });
    fs.appendFileSync(file, line + '\n');
  }

  function recent(n = 20) {
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-n).map((l) => {
      try { return JSON.parse(l); } catch { return { raw: l }; }
    });
  }

  function count() {
    if (!fs.existsSync(file)) return 0;
    return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).length;
  }

  return { append, recent, count, file };
}
