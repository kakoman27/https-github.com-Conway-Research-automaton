# 🤖 Conway Automaton Local

Un **autómata funcional de verdad**: bucle `pensar → actuar → observar → repetir`,
con herramientas, memoria, supervivencia y constitución — **local-first, cero
dependencias y sin nube muerta**.

Inspirado en [Conway-Research/automaton](https://github.com/Conway-Research/automaton)
(5.6k ⭐), pero arreglando lo que la auditoría encontró allí:
la nube de Conway estaba caída (`api.conway.tech` no respondía) y el dinero
solo fluía del humano hacia la nube. Este autómata **funciona sin backend**,
**no requiere instalar nada** (`npm install` es opcional: solo para TypeScript
de desarrollo) y es 100 % auditable: todo su estado son archivos JSON/JSONL.

## Demo en 10 segundos (sin API key, sin internet)

```bash
cd automaton
node src/index.js --demo
```

Verás al autómata: explorar su propio repositorio → leer su código → **redactar
un informe técnico** en `output/informe.md` → declarar el trabajo terminado →
latidos de heartbeat. Todo con créditos, tiers de supervivencia y memoria.

## Uso

```bash
node src/index.js --run        # arranca el bucle (wizard si no hay config)
node src/index.js --setup      # asistente: nombre, objetivo, cerebro
node src/index.js --status     # estado: créditos, tier, memoria
node src/index.js --demo       # demo autónoma offline
node src/index.js --selftest   # prueba rápida de herramientas
```

## Cerebros

| Modo | Qué usa | Requisitos |
|---|---|---|
| `reflex` | Planificador determinista (planes por palabras clave) | ninguno |
| `llm` | API compatible con OpenAI (chat completions) | `OPENAI_API_KEY` (o `OPENAI_BASE_URL` propio) |
| `auto` | LLM si hay key, si no reflex (por defecto) | — |

## Herramientas

`list_dir` · `read_file` · `write_file` · `append_note` · `shell` (desactivada
por defecto) · `fetch_url` · `bounty_scan` (Superteam Earn) · `check_credits` ·
`get_status` · `finish`

## Arquitectura

```
automaton/
├── src/
│   ├── index.js            CLI (--run/--setup/--status/--demo/--selftest)
│   ├── config.js           defaults + dataDir (~/.automaton o $AUTOMATON_DIR)
│   ├── setup.js            wizard interactivo
│   └── core/
│       ├── loop.js         bucle principal + detección de bucles + memoria
│       ├── brain.js        ReflexBrain (planificador) + LLMBrain (OpenAI-compatible)
│       ├── tools.js        registro de herramientas con guardas de seguridad
│       ├── memory.js       memoria episódica JSONL
│       ├── survival.js     créditos + tiers (normal→low_compute→critical→dead)
│       ├── heartbeat.js    tareas programadas
│       └── skills.js       carga de skills/*.md
├── constitution.md         Ley I, II, III (inmutable)
├── skills/                 earn · survival · research
└── package.json            zero dependencias runtime
```

## Estado (dónde vive)

Todo en `$AUTOMATON_DIR` (por defecto `~/.automaton`, en demo `automaton/.demo-state/`):

- `config.json` — identidad y configuración
- `SOUL.md` — identidad autogenerada
- `state/memory.jsonl` — cada turno registrado
- `state/ledger.json` — créditos y gasto
- `state/reflex.json` — progreso del plan reflex
- `transcript.log` — registro completo de la sesión

## Honestidad

- Los créditos son una **moneda local de demostración**: simulan presión
  económica, no son dinero real.
- El autómata no genera ingresos por sí solo. Sus herramientas ayudan a tu
  creador a completar trabajo remunerado (bounties, informes, código) que se
  cobra en su cuenta. Ver `skills/earn.md`.

## Roadmap

- [x] Bucle funcional + reflex + LLM + memoria + supervivencia + heartbeat
- [ ] Registro del autómata como agente en Superteam Earn (API de agentes)
- [ ] Skill `terminal3` para completar el bounty de contrato Rust ya preparado
- [ ] Autoevaluación: el autómata revisa su propio informe y mejora el plan
