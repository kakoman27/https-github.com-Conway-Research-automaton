# Conway Automaton Research

Repositorio de trabajo con auditorías, bounties y un autómata funcional.

## Contenido

| Carpeta / archivo | Qué es |
|---|---|
| `REPORTE-AUDITORIA-AUTOMATON.md` | Auditoría del proyecto Conway-Research/automaton (¿puede generar ingresos? → no) |
| `bounty-terminal3/` | 🎯 Entregable del bounty "Create Agent ID, claim free tokens, & deploy first RUST contract" (Terminal3 / LOL ventures, Superteam Earn) — guía paso a paso, código Node verificado, contrato Rust de referencia y reporte de 4 bugs con causa raíz |
| `automaton/` | 🤖 **Autómata funcional local-first** (cero dependencias): bucle pensar→actuar→observar, herramientas, memoria JSONL, supervivencia con créditos, constitución, cerebro reflex (sin API key) y LLM (OpenAI-compatible). Demo ejecutada y verificada en `examples/` |

## Autómata — acceso rápido

- Demo de 10 segundos: `cd automaton && node src/index.js --demo`
- Documentación completa: `automaton/README.md`
- Prueba ejecutada de verdad: `automaton/examples/demo-transcript.txt` + informe autogenerado `automaton/examples/demo-informe.md`

## Bounty Terminal3 — acceso rápido

- Guía paso a paso (base del Google Doc del submission): `bounty-terminal3/GUIA-PASO-A-PASO.md`
- Cómo cobrar (Superteam Earn + wallet): `bounty-terminal3/GUIA-SUPERTEAM-EARN.md`
- Código Node listo: `bounty-terminal3/my-t3n-app/`
- Contrato Rust de referencia: `bounty-terminal3/z-tenant-flight/`
- Bugs verificados: `bounty-terminal3/REPORTE-BUGS.md`
