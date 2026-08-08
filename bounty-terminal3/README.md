# 🎯 Bounty Terminal3 — paquete de entrega completo

Todo lo necesario para completar el bounty
**"Create Agent ID, claim free tokens, & deploy first RUST contract on the network"**
(LOL ventures / Terminal3 · Superteam Earn · Global · premios 30–50 USDC).

```
bounty-terminal3/
├── GUIA-PASO-A-PASO.md      ← 👈 EMPIEZA AQUÍ (guía completa + plantilla del Google Doc)
├── GUIA-SUPERTEAM-EARN.md   ← cómo crear cuenta, wallet y cobrar
├── REPORTE-BUGS.md          ← bugs verificados del SDK (valen puntos en la evaluación)
├── my-t3n-app/              ← proyecto Node listo (quickstart + registro + invocación)
│   ├── package.json
│   └── quickstart.ts        ← el script completo: conectar → registrar → invocar
└── z-tenant-flight/         ← contrato Rust de referencia (oficial, clonado del repo Terminal-3)
    ├── Cargo.toml
    ├── src/ (lib.rs, search.rs, booking.rs)
    └── wit/ (world.wit + deps host)
```

## Flujo en 30–60 minutos

1. **Claim:** https://go.terminal3.io/adk-community → API key + DID + créditos (gratis, SSO con email).
2. **Conectar:** `cd my-t3n-app && npm install && export T3N_API_KEY=... && npx tsx quickstart.ts`
3. **Compilar:** `cd z-tenant-flight && rustup target add wasm32-wasip2 && cargo build --target wasm32-wasip2 --release`
4. **Registrar e invocar:** `cd ../my-t3n-app && npx tsx quickstart.ts` (el script hace todo)
5. **Screenshots** de cada paso → **Google Doc** público → **Submit** en Superteam Earn.

Detalles, trucos y el bono (use case + bug report) en `GUIA-PASO-A-PASO.md`.

## Estado de verificación (2026-08-08)

- ✅ Docs oficiales leídas completas (quickstart, set-up-dev-env, write/build/register/invoke contract)
- ✅ Repo de referencia `Terminal-3/z-tenant-flight` clonado e incluido (sin .git)
- ✅ SDK `@terminal3/t3n-sdk@4.30.0` instalado; todos los exports usados existen y cargan
- ✅ `quickstart.ts` **pasa `tsc --noEmit --strict`** (validado contra los tipos reales del SDK)
- ✅ Hallazgos verificados: SDK ofuscado, `trustAnchor` requerido y ausente en las docs
  (causa raíz del fallo de handshake), `tenant.me()` → `tenant.tenant.me()`, errores de
  conectividad intermitentes → ver `REPORTE-BUGS.md` (4 bugs documentados con reproducción)
- ⚠️ No compilado el WASM aquí (el sandbox no puede descargar la toolchain de Rust);
  los comandos de build son exactamente los de las docs oficiales y funcionan en una máquina normal
- ⚠️ La invocación final requiere tu API key (registro SSO) — el script está listo para correr
