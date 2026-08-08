/**
 * Terminal3 ADK — Quickstart + Walkthrough completo (pasos 1 a 4)
 * ---------------------------------------------------------------
 * Preparado para el bounty "Create Agent ID, claim free tokens, & deploy
 * first RUST contract on the network" (LOL ventures / Terminal3, Superteam Earn).
 *
 * CÓMO USARLO:
 *   1) export T3N_API_KEY="<tu key de la claim page>"
 *   2) npx tsx quickstart.ts
 *
 * El script ejecuta en orden:
 *   [A] Conectar y autenticar (Quickstart)          -> imprime tu did:t3n:...
 *   [B] Crear TenantClient (Set Up Dev Env)          -> imprime "TenantClient ready."
 *   [C] Registrar el contrato WASM (Register)        -> imprime contract id
 *   [D] Auto-grant + invocación directa (Invoke)     -> imprime el resultado
 *
 * Requisitos previos:
 *   - Node >= 20 (verificado: v22 funciona)
 *   - npm install (ya está en package.json)
 *   - El contrato compilado en ../z-tenant-flight/target/wasm32-wasip2/release/z_tenant_flight.wasm
 *     (ver GUIA-PASO-A-PASO.md, paso 5)
 */

import {
  T3nClient,
  TenantClient,
  setEnvironment,
  loadWasmComponent,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
  getNodeUrl,
  getScriptVersion,
} from "@terminal3/t3n-sdk";
import { readFile } from "fs/promises";

// ── Config ──────────────────────────────────────────────────────────────────
setEnvironment("testnet"); // IMPORTANTE: testnet mientras construyes

const T3N_API_KEY = process.env.T3N_API_KEY!;
if (!T3N_API_KEY) {
  console.error("[ERROR] Define T3N_API_KEY primero:\n  export T3N_API_KEY=\"<tu key de la claim page>\"");
  process.exit(1);
}

const WASM_PATH = "../z-tenant-flight/target/wasm32-wasip2/release/z_tenant_flight.wasm";
const CONTRACT_TAIL = "travel-contracts"; // nombre local del contrato (corto, sin '/')
const CONTRACT_VERSION = "0.1.0";

// ── [A] Quickstart: conectar y autenticar ───────────────────────────────────
console.log("\n[A] Conectando con Terminal3...");
const wasmComponent = await loadWasmComponent(); // toda la cripto corre dentro de este componente
const address = eth_get_address(T3N_API_KEY);

const t3n = new T3nClient({
  wasmComponent,
  // ⚠️ trustAnchor es OBLIGATORIO en el SDK v4.30+ y las docs oficiales NO lo incluyen
  // (esa omisión es la causa raíz del error "unsafe_trust_server undefined" que
  // reportaron otros participantes — ver REPORTE-BUGS.md, Bug 4).
  // `unsafe_trust_server: true` es el opt-out para dev/testnet; en producción
  // hay que fijar expected_peer_ids + rtmr3_allowlist reales.
  trustAnchor: { unsafe_trust_server: true },
  handlers: {
    EthSign: metamask_sign(address, undefined, T3N_API_KEY),
  },
});

await t3n.handshake();
const did = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = did.value; // did:t3n:... — se reutiliza en todos los pasos
console.log("Connected as:", tenantDid);

// ── [B] TenantClient: gestionar tu despliegue ───────────────────────────────
console.log("\n[B] Creando TenantClient...");
const tenant = new TenantClient({
  t3n,                    // el cliente ya autenticado
  baseUrl: getNodeUrl(),  // el nodo activo (testnet)
  tenantDid,               // did.value del paso A — nunca lo inventes a mano
});

await tenant.tenant.me(); // lanza error si algo falla; confirma que el cliente funciona
console.log("TenantClient ready.");

// ── [C] Registrar el contrato WASM (compilado en el paso 5 de la guía) ───────
console.log("\n[C] Registrando contrato...");
const wasmBytes = await readFile(WASM_PATH);

const result = await tenant.contracts.register({
  tail: CONTRACT_TAIL,
  version: CONTRACT_VERSION,
  wasm: wasmBytes,
});

const contractId = result.contract_id;
const tenantId = tenantDid.slice("did:t3n:".length);
const scriptName = `z:${tenantId}:${CONTRACT_TAIL}`;

console.log(`registered ${scriptName} as contract id ${contractId}`);
console.log("  ^ Anota este contract_id — lo necesitas para los ACL de los KV maps (secrets).");

// ── [D] Invocación directa (self-grant) ─────────────────────────────────────
// El contrato de ejemplo (z-tenant-flight) llama a la API de Duffel. Antes de
// invocar necesita: (1) el KV map "secrets" con duffel_api_key, y (2) un grant
// de egress a api.duffel.com. Para el demo con self-grant hacemos ambos aquí.
// Si no tienes una API key de Duffel (gratis en https://www.duffel.com/developers
// con tarjeta de test 4242...), el contrato igual se ejecuta y devuelve el
// error controlado "duffel_api_key not found" — eso ya demuestra el ciclo
// completo registro -> carga -> ejecución dentro del enclave.
console.log("\n[D] Preparando grants y mapas (self-grant)...");

// 1) Crear el KV map 'secrets' (necesario para que el contrato lea la key)
//    NOTA: `readers` es OBLIGATORIO — el KV governor niega por defecto (AccessDenied).
try {
  await tenant.maps.create({
    tail: "secrets",
    visibility: "private",
    writers: { only: [contractId] },
    readers: { only: [contractId] },
  });
  console.log("  KV map 'secrets' creado (ACL -> contractId " + contractId + ")");
} catch (e) {
  console.log("  KV map 'secrets': " + (e instanceof Error ? e.message : String(e)) + " (MapAlreadyExists es idempotente, ignorar)");
}

// 2) Sembrar la Duffel API key (opcional — prueba gratis en https://www.duffel.com/developers)
//    `entrySet` es un write del control plane: salta el ACL de writers del mapa.
const duffelKey = process.env.DUFFEL_API_KEY;
if (duffelKey) {
  await tenant.maps.entrySet("secrets", "duffel_api_key", duffelKey);
  console.log("  duffel_api_key sellada en z:<tid>:secrets (invisible fuera del TEE)");
} else {
  console.log("  (sin DUFFEL_API_KEY: el contrato se ejecutará y reportará la key faltante)");
}

// 3) Self-grant: autorizar al propio usuario (self) para invocar el contrato
const scriptVersion = await getScriptVersion(getNodeUrl(), scriptName);
const userAddress = eth_get_address(T3N_API_KEY);
await t3n.execute({
  script_name: "tee:user/contracts",
  script_version: await getScriptVersion(getNodeUrl(), "tee:user/contracts"),
  function_name: "agent-auth-update",
  input: {
    agents: [{
      agentDid: `did:t3n:${userAddress}`, // self-grant: el propio usuario
      scripts: [{
        scriptName,
        versionReq: scriptVersion,
        functions: ["search-offers", "book-offer"],
        allowedHosts: ["api.duffel.com"], // hosts que el contrato puede llamar
      }],
    }],
  },
});
console.log("  Self-grant aplicado. Invocando search-offers...");

// 4) Invocar el contrato
const search = await t3n.executeAndDecode({
  script_name: scriptName,
  script_version: scriptVersion,
  function_name: "search-offers",
  input: {
    origin: "LHR",
    destination: "JFK",
    departure_date: "2026-09-01",
    cabin_class: "economy",
    adult_count: 1,
  },
});

console.log("\n[RESULTADO] search-offers ->");
console.log(JSON.stringify(search, null, 2));

// Si quieres continuar con book-offer, el contrato devuelve offer.id y
// passenger_ids en `search.offers[0]` (requiere Duffel key + PII placeholders).
console.log("\n✅ Flujo completo: conectado, autenticado, contrato registrado e invocado.");
console.log("   Haz capturas de pantalla de CADA paso para tu submission.");
