# Informe técnico generado por el autómata

Fecha: 2026-08-08T16:20:06.332Z

### list_dir .
.demo-state/
README.md
constitution.md
examples/
output/
package.json
skills/
src/

### read_file README.md
# 🤖 Conway Automaton Local

Un **autómata funcional de verdad**: bucle `pensar → actuar → observar → repetir`,
con herramientas, memoria, supervivencia y constitución — **local-first, cero
dependencias y sin nube muerta**.

Inspirado en [Conway-Research/automaton](https://github.com/Conway-Research/automaton)
(5.6k ⭐), pero arreglando lo que la auditoría encontró allí:
la nube de Conway estaba caída (`api.conway.tech` no respondía) y el dinero
solo fluía del humano hacia la nube. Este autómata 

### read_file package.json
{
  "name": "automaton-local",
  "version": "0.1.0",
  "description": "Autómata local funcional: bucle pensar → actuar → observar con herramientas, memoria, supervivencia y constitución. Sin dependencias nativas ni backend externo.",
  "type": "module",
  "bin": {
    "automaton": "src/index.js"
  },
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "demo": "node src/index.js --demo",
    "run": "node src/index.js --run",
    "setup": "node src/index.js --setup",
    "status": "node src/

### list_dir src
config.js
core/
index.js
setup.js

### read_file src/core/loop.js
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

const READ_ONLY = n

### read_file src/core/brain.js
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
/* Pla

---
Generado por DemoBot (reflex) en 7 turnos.