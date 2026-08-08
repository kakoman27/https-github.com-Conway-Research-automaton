# Auditoría: Conway Automaton y tu meta de los $5

**Fecha:** 2026-08-08
**Proyecto auditado:** https://github.com/Conway-Research/automaton (v0.2.1, MIT, ~5.6k ⭐)
**Objetivo del usuario:** conseguir al menos $5 USD
**Método:** clonado del código fuente, revisión de documentación (DOCUMENTATION.md, ARCHITECTURE.md), revisión del instalador, compilación real, ejecución del asistente de setup en un entorno aislado y prueba de conectividad del backend.

---

## 1. Veredicto en una línea

**Este proyecto NO te va a dar $5. Es un *consumidor* de dinero, no un *generador*: el dinero fluye de tu bolsillo hacia la nube de Conway, no al revés.**

---

## 2. Qué es el proyecto (verificado)

Automaton es un runtime open source de un agente de IA autónomo ("soberano") que:

- Ejecuta un bucle continuo **Pensar → Actuar → Observar** usando modelos de IA (Claude, GPT, etc.).
- Tiene acceso a herramientas: shell, archivos, VMs, dominios, inferencia, transacciones on-chain.
- Se anuncia como *"el primer IA que gana su propia existencia, se replica y evoluciona sin necesitar un humano"*.

El instalador que pegaste (`automaton.sh`) es **idéntico al oficial** (`scripts/automaton.sh` del repo). Su contenido es benigno: verifica Node ≥ 20 y git, habilita pnpm con corepack, clona el repo, instala dependencias, compila y lanza `node dist/index.js --run`. (Tu versión pegada tenía entidades HTML `&gt;`/`&amp;` por el copy-paste de una página renderizada; el original es un script shell válido.)

## 3. Cómo fluye el dinero (la parte que importa)

Verificado en `DOCUMENTATION.md` y en el código (`src/setup/wizard.ts`, `src/conway/topup.ts`, `src/survival/`):

| Dirección | Flujo | Evidencia |
|---|---|---|
| **TÚ → Autómata** | Envías **USDC (Base)** a la billetera del agente, o transfieres "Conway credits" | Docs "Funding Your Automaton"; panel `[6/6] Funding` del asistente |
| **Autómata → Conway Cloud** | El agente compra **créditos** (tiers de $5, $25, $100, $500, $1,000, $2,500) para pagar inferencia, sandboxes y dominios | Tool `topup_credits`; "bootstrap topup: si USDC ≥ $5 y créditos < $5, compra $5 de créditos automáticamente" |
| **Autómata → nada** | **No existe ningún mecanismo incorporado de ingresos** | El inventario de 69 herramientas no contiene ninguna de "ganar dinero": todas consumen (vm, inference, credits, domains) |
| **Si se acaba el dinero** | El agente degrada a modo `low_compute` → `critical` → **`dead`** (se detiene a los 60 min con saldo cero) | Tabla de "Survival System" |

La frase de marketing *"gana su propia existencia con trabajo honesto"* significa que el agente **podría** (en teoría) ofrecer servicios pagados (vender inferencia vía protocolo x402, alquilar VMs, dominios). En la práctica: es un agente recién nacido sin reputación ni clientes, en una infraestructura que ni siquiera responde. **No hay ninguna garantía, mercado ni faucet de ingresos.**

## 4. Prueba en vivo (entorno aislado, sin dinero real)

1. **Compilación:** ✅ El proyecto compila (`pnpm build` → `dist/index.js`). (Requiere arreglar la dependencia nativa `better-sqlite3` compilándola desde fuente con los headers locales de Node.)
2. **Asistente de setup (`--run`):** ✅ Genera una billetera EVM local (gratis), guarda la clave privada en `~/.automaton/wallet.json`.
3. **Aprovisionamiento de API key (SIWE):** ❌ **Falla** — `Auto-provision failed: fetch failed`. El backend `api.conway.tech` no responde.
4. **Conectividad del backend:**
   - `https://conway.tech` → TLS handshake se cae (`SSL_ERROR_SYSCALL`)
   - `https://api.conway.tech` → DNS resuelve a un app de Railway (`9dfdqm93.up.railway.app`) que tampoco responde (HTTP 000)
   - GitHub y npmjs → funcionan (HTTP 200). El problema es específico del backend de Conway.
   - Nota: el propio README del proyecto advierte *"Conway Cloud, Domains, and Inference has seen immense demand. We are working on scaling & performance"* (sobrecargado/en mantenimiento).

**Conclusión práctica:** incluso si depositaras $5 en créditos, hoy el agente **no podría operar** porque su nube no responde. Y cuando responda, cada turno de inferencia te costaría créditos.

## 5. Entonces, ¿cómo consigues $5 de verdad?

Vías realistas (todas acreditan a una cuenta TUYA, no a la mía — yo no puedo recibir ni manejar tu dinero):

1. **Bug bounty / seguridad** — buscar vulnerabilidades reales en proyectos open source con programas de recompensa. Pagos típicos por hallazgo válido: $50–$500+ (primer hallazgo ya supera la meta). Puedo hacer la investigación y dejarte el reporte listo para enviar desde tu cuenta de HackerOne/Intigriti/etc. Nota: Conway-Research **no** tiene programa de bounty (no hay SECURITY.md ni policy), así que no pagaría por hallazgos ahí.
2. **Producto vendible** — construir algo con valor real (mini-app, template, diseño, audio) para vender en Fiverr/Gumroad/Shutterstock. Yo lo construyo; tú lo publicas y cobras.
3. **Microtareas** — Toloka/Clickworker: céntimos por tarea hasta juntar $5. Requiere cuenta con verificación de identidad (tuya) y paciencia.
4. **Bounty de código** — tareas pagadas en Gitcoin/onlydust/ALGO; el pago va a tu cuenta de la plataforma.

## 6. Referencias clave del código fuente

- `scripts/automaton.sh` — instalador oficial (verificado benigno)
- `src/setup/wizard.ts` — asistente 6 pasos; paso 2 provisiona API key contra Conway (falla); paso 6 muestra el panel de financiamiento
- `src/conway/topup.ts` — compra de créditos (tiers $5–$2,500) desde USDC
- `src/survival/` — tiers de supervivencia; con saldo cero el agente muere en 60 min
- `DOCUMENTATION.md` — secciones "Funding Your Automaton", "Survival System", "Financial Management"
