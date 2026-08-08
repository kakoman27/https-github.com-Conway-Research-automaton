/**
 * Registro de herramientas del autómata.
 * Cada herramienta: { description, run(args) -> string }
 * Seguridad: por defecto SOLO se permiten operaciones de archivos dentro del
 * proyecto; `output/` se escribe en <dataDir>/output (junto al estado del
 * autómata); el shell está desactivado (allowShell=false).
 */
import fs from 'node:fs';
import { exec } from 'node:child_process';
import path from 'node:path';
import { PROJECT_ROOT } from '../config.js';

const clip = (s, n = 1500) => (s.length > n ? s.slice(0, n) + `\n…[truncado a ${n} chars]` : s);

function safeResolve(p, dataDir) {
  const norm = String(p).replace(/^\.\//, '');
  // output/* → <dataDir>/output (artefactos junto al estado del autómata)
  if (norm === 'output' || norm.startsWith('output/')) {
    const outDir = path.join(dataDir, 'output');
    const rel = norm === 'output' ? '' : norm.slice('output/'.length);
    const r = path.resolve(outDir, rel);
    fs.mkdirSync(path.dirname(r), { recursive: true });
    return r;
  }
  // Cualquier otra ruta relativa → dentro del proyecto (solo lectura/escritura segura)
  const r = path.resolve(PROJECT_ROOT, p);
  if (!r.startsWith(PROJECT_ROOT)) throw new Error(`ruta fuera del proyecto: ${p}`);
  return r;
}

export function createTools(config, ctx) {
  const tools = {
    list_dir: {
      description: 'Lista el contenido de un directorio. args: { path }',
      async run({ path: p = '.' }) {
        const entries = fs.readdirSync(safeResolve(p, config.dataDir), { withFileTypes: true });
        return entries.map((e) => (e.isDirectory() ? e.name + '/' : e.name)).join('\n');
      },
    },

    read_file: {
      description: 'Lee un archivo de texto (dentro del proyecto). args: { path }',
      async run({ path: p }) {
        if (!p) throw new Error('falta path');
        return clip(fs.readFileSync(safeResolve(p, config.dataDir), 'utf8'), 4000);
      },
    },

    write_file: {
      description: 'Escribe un archivo (crea carpetas). args: { path, content }',
      async run({ path: p, content = '' }) {
        const target = safeResolve(p, config.dataDir);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
        return `escrito: ${Buffer.byteLength(content)} bytes en ${p}`;
      },
    },

    append_note: {
      description: 'Añade texto al final de un archivo de notas. args: { path, text }',
      async run({ path: p, text = '' }) {
        const target = safeResolve(p, config.dataDir);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.appendFileSync(target, text + '\n');
        return `nota añadida a ${p}`;
      },
    },

    shell: {
      description: 'Ejecuta un comando shell. DESACTIVADO por defecto. args: { cmd }',
      async run({ cmd }) {
        if (!config.allowShell) return 'shell desactivado (config.allowShell=false). No se ejecutó nada.';
        return await new Promise((resolve) => {
          exec(cmd, { timeout: 10000, cwd: PROJECT_ROOT }, (err, stdout, stderr) => {
            if (err) resolve(`[error] ${err.message}\n${clip(stderr || '', 500)}`);
            else resolve(clip(stdout || '(sin salida)', 1500));
          });
        });
      },
    },

    fetch_url: {
      description: 'Hace GET a una URL y devuelve status + fragmento. args: { url }',
      async run({ url }) {
        if (!/^https?:\/\//.test(url || '')) throw new Error('URL inválida');
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        const text = await res.text();
        return `HTTP ${res.status} ${res.headers.get('content-type') || ''}\n${clip(text, 1200)}`;
      },
    },

    bounty_scan: {
      description: 'Escanea listings elegibles para agentes en Superteam Earn.',
      async run() {
        try {
          const res = await fetch('https://superteam.fun/earn/agents/listings', {
            signal: AbortSignal.timeout(15000),
          });
          const html = await res.text();
          const slugs = [...html.matchAll(/href="(\/earn\/listing\/[^"]+)"/g)].map((m) => m[1]);
          const unique = [...new Set(slugs)].slice(0, 10);
          return unique.length
            ? `Listings encontrados (${unique.length}):\n${unique.join('\n')}`
            : 'No se detectaron listings (página sin resultados o cambió el HTML).';
        } catch (e) {
          return `bounty_scan sin red (${e.cause?.code || e.message}). Ejecútalo en tu máquina con internet.`;
        }
      },
    },

    check_credits: {
      description: 'Consulta el saldo de créditos y el tier de supervivencia.',
      async run() {
        const s = ctx.survival.status();
        return `créditos: ${s.credits} | gastados: ${s.spent} | tier: ${s.tier}`;
      },
    },

    get_status: {
      description: 'Estado del autómata: nombre, objetivo, turnos, memoria.',
      async run() {
        return [
          `nombre: ${config.name}`,
          `objetivo: ${config.goal || '(sin definir)'}`,
          `cerebro: ${config.brainMode}`,
          `turnos ejecutados: ${ctx.turns}`,
          `entradas de memoria: ${ctx.memory.count()}`,
        ].join('\n');
      },
    },

    finish: {
      description: 'Declara el trabajo terminado con un resumen. args: { summary }',
      async run({ summary = 'trabajo terminado' }) {
        return `DONE: ${summary}`;
      },
    },
  };

  return tools;
}

export function toolsList(tools) {
  return Object.entries(tools).map(([name, t]) => ({ name, description: t.description }));
}
