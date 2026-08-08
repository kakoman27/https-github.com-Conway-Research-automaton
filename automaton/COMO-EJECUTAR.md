# 🚀 Cómo ejecutar el autómata en TU máquina

Guía probada de principio a fin. Todo funciona con **Node.js ≥ 20** y **sin instalar nada más**.

---

## 0. Requisitos (1 min)

```bash
node --version   # debe decir v20 o superior
```

- **Windows:** instala Node desde https://nodejs.org (LTS). Para los comandos `cd`/`node`,
  usa PowerShell o CMD normal.
- **macOS/Linux:** si no tienes Node, instálalo con https://nodejs.org o con tu gestor
  (brew/apt). En Linux a veces hay que instalar `nodejs` + `npm` por separado.

No necesitas `npm install`: el autómata usa **solo módulos nativos de Node**.

---

## 1. Consigue el código (2 min)

Opción A — **clonar tu repositorio** (recomendado, así también tienes el bounty Terminal3):

```bash
git clone https://github.com/kakoman27/https-github.com-Conway-Research-automaton.git
cd https-github.com-Conway-Research-automaton/automaton
```

> 💡 Si no usas git, descarga el ZIP desde GitHub → "Code" → "Download ZIP" → descomprime
> y entra a la carpeta `automaton`.

---

## 2. Pruébalo en 10 segundos (sin configurar nada)

```bash
node src/index.js --demo
```

Verás al autómata explorar su propio código y **escribir un informe técnico** en
`~/.automaton/demo/output/informe.md` (o donde apunte `AUTOMATON_DIR`). La demo usa
estado propio (`automaton/.demo-state/`), no toca tu configuración real.

---

## 3. Configúralo (2 min, una sola vez)

```bash
node src/index.js --setup
```

Te hará 5 preguntas:

| Pregunta | Qué poner | Ejemplo |
|---|---|---|
| Nombre | El nombre de tu autómata | `MiBot` |
| Objetivo | La misión que debe cumplir cada vez que lo lances | `Busca bounties en superteam y documenta la estrategia` |
| Cerebro | `auto` (recomendado), `llm` o `reflex` | `auto` |
| ¿Permitir shell? | **`n`** (recomendado; solo actívalo si entiendes el riesgo) | `n` |
| Máximo de turnos | Cuántos pasos puede dar antes de parar | `10` |

Al terminar crea:
- `~/.automaton/config.json` — tu configuración
- `~/.automaton/SOUL.md` — identidad del autómata

> 💡 En Windows la carpeta será `C:\Users\TU_USUARIO\.automaton`.
> Puedes cambiarla con la variable de entorno `AUTOMATON_DIR`.

---

## 4. Ejecútalo (cada vez que quieras)

```bash
node src/index.js --run
```

El autómata ejecuta su plan (según el objetivo que le diste), cobra créditos por turno,
registra todo en memoria y termina con un resumen.

Verás algo así:

```
[16:19:34] 🚀 MiBot arranca. Objetivo: Busca bounties...
[16:19:34] ▶ turno 1/10 [normal] Estado actual → get_status
[16:19:34] ▶ turno 2/10 [normal] Escaneo de bounties → bounty_scan
[16:19:34] ▶ turno 3/10 [normal] Estrategia honesta → append_note
[16:19:34] ✅ Plan "/bount|.../" completado.
```

**Estado rápido en cualquier momento:**

```bash
node src/index.js --status
```

---

## 5. Activa el cerebro LLM (opcional, para objetivos complejos)

El modo `reflex` (sin API key) solo sabe hacer unos planes fijos. Para que el autómata
**piense por sí mismo**, dale una API key de OpenAI (o de cualquier servicio compatible):

```bash
# Linux / macOS
export OPENAI_API_KEY="sk-..."
# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."
```

Con `brainMode: auto` (el recomendado en el setup), usará el LLM si hay key y
`reflex` si no la hay. Puedes forzar uno u otro en `~/.automaton/config.json`
(campo `brainMode`: `"llm"` o `"reflex"`).

> 🔒 La key se lee de la variable de entorno, nunca se guarda en el disco.

---

## 6. Dónde está todo (para que no te pierdas)

Todo el estado vive en `~/.automaton/` (o `$AUTOMATON_DIR`):

| Archivo | Qué contiene |
|---|---|
| `config.json` | Tu configuración (nombre, objetivo, cerebro, créditos…) |
| `SOUL.md` | Identidad del autómata |
| `state/memory.jsonl` | Memoria: cada turno registrado |
| `state/ledger.json` | Créditos y gasto acumulado |
| `state/reflex.json` | Progreso del plan reflex |
| `output/` | **Artefactos que genera** (informes, estrategias) |
| `transcript.log` | Registro completo de la sesión |

**Recargar créditos** (si el autómata llega a `dead`): edita `state/ledger.json`
y sube `credits`, o cambia `startingCredits` en `config.json` y borra el ledger.
Los créditos son una **moneda local de demostración**, no dinero real.

---

## 7. Solución de problemas

| Problema | Solución |
|---|---|
| `node: command not found` | Instala Node ≥ 20 desde https://nodejs.org |
| Error de permisos al crear `~/.automaton` | Revisa que tu usuario tenga permisos de escritura en tu carpeta de usuario |
| El `--setup` parece no responder | Escribe y pulsa Enter en cada pregunta (si lo ejecutas desde un script, usa `--setup < respuestas.txt`) |
| `bounty_scan` dice "sin red" | Normal si no hay internet o el sitio bloquea la petición; en tu máquina con internet funciona |
| Quiero empezar de cero | Borra la carpeta `~/.automaton` (o `$AUTOMATON_DIR`) y vuelve al paso 3 |
| El autómata termina con "sin plan específico" | Tu objetivo no coincide con ningún plan conocido; pon algo como *"explora este repo y escribe un informe"* o activa el modo LLM |

---

## 8. Trucos útiles

- **Objetivo de informes:** `explora este repo y escribe un informe técnico` → genera
  `output/informe.md` con lo que leyó.
- **Objetivo de bounties:** `Busca bounties en superteam y documenta la estrategia` →
  escanea Superteam Earn (con internet) y escribe `output/estrategia.md`.
- **Demo sin tocar nada:** `node src/index.js --demo` (usa su propio directorio).
- **Automatizar:** `echo -e "MiBot\nmi objetivo\nreflex\nn\n10" | node src/index.js --setup`
  configura sin preguntar (útil en servidores).
