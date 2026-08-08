# 🎯 Bounty: "Create Agent ID, claim free tokens, & deploy first RUST contract on the network"

**Sponsor:** LOL ventures (Terminal3) · **Plataforma:** [Superteam Earn](https://superteam.fun/earn/listing/ai-id)
**Premios:** 1º = 50 USDC · 2º–6º = 30 USDC · **Deadline:** ~10 días desde el 2026-08-08
**Categoría:** Backend · **Región:** 🌍 Global (abierto para Perú)

> ⚠️ **Nota honesta:** este bounty es competitivo (~14 submissions al momento de preparar esto).
> La ventaja se consigue siendo de los primeros con un entregable completo y bien documentado
> ("earlier, faster and more efficient the better" según el propio sponsor). Todo lo que necesitas
> para el entregable ya está preparado y verificado en esta carpeta.

---

## Lo que pide el bounty (resumen verificado)

1. Registrarte vía SSO en **go.terminal3.io/adk-community** (usa ESE link, no el genérico — incluye créditos de campaña).
2. Anotar tu ID (`did:t3n:...`) y tu **API key privada** (se muestra UNA sola vez).
3. Completar el **Quickstart** y el **Walkthrough** de las docs de Terminal3 (conectar SDK → compilar contrato Rust → registrar → invocar).
4. Entregar: **Google Doc público + repo de GitHub público + screenshots + bugs encontrados**.

---

## Requisitos previos (todo gratis)

| Requisito | Dónde | Tiempo |
|---|---|---|
| Node.js ≥ 20 | https://nodejs.org | 2 min |
| Rust (rustup) | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` | 5 min |
| Email de trabajo (para el SSO) | Gmail sirve | 1 min |
| Cuenta Superteam Earn + wallet Phantom | ver `GUIA-SUPERTEAM-EARN.md` | 10 min |

---

## Paso 1 — Obtén tu API key y créditos (2 min)

1. Abre **https://go.terminal3.io/adk-community** y firma con SSO (email de trabajo).
2. Verás tu **T3N ID** (`did:t3n:...`) y tu **API key** — ⚠️ cópiala YA, solo se muestra una vez.
3. Si el formulario pide **campaign code**, escribe el que corresponda a la campaña del bounty
   (el link `adk-community` ya debería aplicarlo; si no, pregunta en https://t.me/wardumb con tu DID y "Superteam").

## Paso 2 — Proyecto Node (ya listo ✅)

Todo el código está preparado en `my-t3n-app/`. Solo:

```bash
cd my-t3n-app
npm install
export T3N_API_KEY="<tu API key del paso 1>"
```

## Paso 3 — Quickstart: conectar (3 min)

```bash
npx tsx quickstart.ts
```

👉 **Hasta aquí** debe imprimir:

```
[A] Conectando con Terminal3...
Connected as: did:t3n:9f2a...
[B] Creando TenantClient...
TenantClient ready.
```

**📸 Screenshot #1** de esta salida (conexión autenticada).

> ❗ Si `handshake()` falla con un error tipo `unsafe_trust_server undefined` o `ERR_CONNECTION_REFUSED`,
> NO es culpa tuya: es un problema conocido del SDK/infra (ver `REPORTE-BUGS.md`).
> **En este paquete ya está resuelto**: el script incluye `trustAnchor: { unsafe_trust_server: true }`,
> que es el campo que el SDK v4.30 exige y que las docs oficiales omiten (esa es la causa raíz
> del error que reportaron otros participantes). Documenta el error con el paso exacto y el stack
> trace — **reportar bugs bien documentados también puntúa** ("Bug submission quality").
> Reintenta pasados unos minutos si ves errores de conexión (infra intermitente).

## Paso 4 — Compilar el contrato Rust (5–10 min)

El contrato de referencia ya está incluido en `z-tenant-flight/` (clonado de
https://github.com/Terminal-3/z-tenant-flight — es el repo oficial del walkthrough).

```bash
cd z-tenant-flight
rustup target add wasm32-wasip2
cargo build --target wasm32-wasip2 --release
ls -lh target/wasm32-wasip2/release/z_tenant_flight.wasm   # debe existir
```

Opcional (verificación de la interfaz):
```bash
cargo install wasm-tools    # tarda ~2 min, es normal
wasm-tools component wit target/wasm32-wasip2/release/z_tenant_flight.wasm
# debe mostrar "export contracts;" y los imports host:interfaces/kv-store, logging, http...
```

**📸 Screenshot #2** del build exitoso (y del `wasm-tools` si lo instalaste).

## Paso 5 — Registrar el contrato (2 min)

Vuelve a `my-t3n-app/` y ejecuta el script completo (que ya incluye el registro y la invocación):

```bash
cd ../my-t3n-app
npx tsx quickstart.ts
```

Debe imprimir (además de los pasos A y B):

```
[C] Registrando contrato...
registered z:<tid>:travel-contracts as contract id 42
[D] Preparando grants y mapas (self-grant)...
...
[RESULTADO] search-offers -> {...}
```

**📸 Screenshot #3** del registro + **📸 Screenshot #4** de la invocación.

> 💡 **Para el demo completo de Duffel** (opcional pero recomendado): saca una **API key de test gratis**
> en https://www.duffel.com/developers (usa la tarjeta de prueba 4242 4242 4242 4242) y:
> ```bash
> export DUFFEL_API_KEY="<tu key de Duffel>"
> npx tsx quickstart.ts
> ```
> Así `search-offers` devuelve vuelos reales de prueba y el demo queda redondo.
> Sin la key, el contrato igual se ejecuta y devuelve el error controlado `duffel_api_key not found`
> (también válido como demo del ciclo completo).

## Paso 6 (BONO 💰) — Ir más allá del primer contrato

El criterio de evaluación incluye: *"Bonus: Willingness to go beyond the first contract and provide us an initial use case"*.
Ideas de bajo esfuerzo que suman puntos:

- **Usa el contrato desde un agente real** (no self-grant): crea una segunda sesión con `AGENT_KEY` y firma el `agent-auth-update` como usuario (código en las docs: *Invoke your TEE contract*).
- **Prueba el KV map**: crea un mapa propio y escríbelo/leelo con el SDK (docs: *Create Tenant KV maps*).
- **Reporta un bug real**: el SDK npm publicado está **ofuscado** (`/* t3n-sdk-obfuscated */` al inicio de `dist/index.esm.js`, nombres de variables `_0x...`), lo que dificulta el debugging. Ya documentado en `REPORTE-BUGS.md` — adjúntalo.
- Propón un caso de uso para TEEs (ej. un oráculo privado, un bot de trading con estrategia cifrada, un agente que firma sin exponer su key).

## Paso 7 — Armar el Google Doc (15 min)

Crea un **Google Doc público** (Compartir → "Cualquier persona con el enlace") con esta estructura — ya tienes el contenido en esta guía:

```
Título: Terminal3 ADK — Onboarding + primer contrato TEE en Rust (bounty LOL ventures)
1. Resumen (2-3 líneas: qué hiciste y qué demuestra)
2. Evidencia paso a paso (los 4 screenshots con 1 línea de contexto cada uno)
3. Código: link al repo público (https://github.com/kakoman27/https-github.com-Conway-Research-automaton)
   — carpeta bounty-terminal3/
4. Bugs encontrados (ver REPORTE-BUGS.md): SDK ofuscado, errores de conexión si los viste
5. Use case propuesto (el bono del paso 6)
6. Tiempo total invertido y dificultad (transparencia que valoran los sponsors)
```

## Paso 8 — Enviar el submission (5 min)

1. Entra a https://superteam.fun/earn/listing/ai-id (logueado).
2. Botón **"Submit Now"** → pega:
   - **Link:** el Google Doc público
   - **Other info / notas:** link al repo público + resumen de 3 líneas
3. Si el formulario pide screenshots, adjunta los 4.

**Fecha límite:** ~18 de agosto de 2026 (verifica el contador en el listing).
**Anuncio de ganadores:** 14 de agosto de 2026 según el listing (revisa, puede variar).

---

## Checklist final

- [ ] API key + DID copiados
- [ ] `Connected as: did:t3n:...` ✅ (screenshot)
- [ ] `TenantClient ready.` ✅
- [ ] `target/wasm32-wasip2/release/z_tenant_flight.wasm` compilado ✅ (screenshot)
- [ ] `registered z:... as contract id N` ✅ (screenshot)
- [ ] Invocación con resultado ✅ (screenshot)
- [ ] Google Doc público con la estructura del paso 7
- [ ] Submission enviado en Superteam Earn con link + repo
- [ ] Perfil de Superteam Earn completo + wallet conectada (para cobrar)

---

## Referencias oficiales

- Listing: https://superteam.fun/earn/listing/ai-id
- Claim page: https://www.terminal3.io/claim-page (o go.terminal3.io/adk-community para la campaña)
- Docs: https://docs.terminal3.io/developers/adk/get-started/quickstart
- Contrato de referencia: https://github.com/Terminal-3/z-tenant-flight
- Contacto del sponsor: https://t.me/wardumb (para tokens extra: "DM con tu DID y 'Superteam'")
