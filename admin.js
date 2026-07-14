/**
 * admin.js
 * -----------------------------------------------------------------------
 * Lógica del panel de administrador (admin.html). Sin frameworks, DOM
 * directo, igual que el resto del proyecto.
 *
 * SEGURIDAD: la contraseña se compara acá mismo, en el navegador. Esto
 * NO es seguridad real — cualquiera que abra las herramientas de
 * desarrollador puede leer el código y ver la contraseña, o saltearse
 * la verificación. Es solo una traba simple para que un chico curioso
 * no entre por accidente. No uses este patrón para nada que necesite
 * protección de verdad.
 * -----------------------------------------------------------------------
 */

import { getRemoteValue, setRemoteValue, getCounter, EDITABLE_FIELDS, PLAYERS_COUNTER_KEY } from "./remote-config.js";

const PASSWORD = "080184";

const gate = document.getElementById("gate");
const dashboard = document.getElementById("dashboard");
const passwordInput = document.getElementById("password-input");
const gateStatus = document.getElementById("gate-status");

document.getElementById("btn-enter").addEventListener("click", checkPassword);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});

function checkPassword() {
  if (passwordInput.value === PASSWORD) {
    gate.classList.add("hidden");
    dashboard.classList.remove("hidden");
    loadDashboard();
  } else {
    gateStatus.textContent = "Contraseña incorrecta.";
  }
}

/** Carga el contador de jugadores y los campos editables actuales. */
async function loadDashboard() {
  const playersEl = document.getElementById("players-count");
  const count = await getCounter(PLAYERS_COUNTER_KEY);
  playersEl.textContent = count === null ? "sin datos todavía" : count;

  const container = document.getElementById("fields-container");
  container.innerHTML = "";

  for (const fieldDef of EDITABLE_FIELDS) {
    const defaultValue = 10; // valor visual de referencia mientras carga
    const currentValue = await getRemoteValue(fieldDef.key, defaultValue);

    const row = document.createElement("div");
    row.className = "field-row";
    row.innerHTML = `
      <div>${fieldDef.label}</div>
      <input type="number" id="field-${fieldDef.key}" value="${currentValue}" min="1" />
    `;
    container.appendChild(row);
  }
}

document.getElementById("btn-save-all").addEventListener("click", saveAllFields);

async function saveAllFields() {
  const status = document.getElementById("save-status");
  status.textContent = "Guardando...";
  status.className = "status";

  const results = await Promise.all(
    EDITABLE_FIELDS.map(async (fieldDef) => {
      const input = document.getElementById(`field-${fieldDef.key}`);
      const value = parseInt(input.value, 10);
      if (!Number.isFinite(value) || value < 1) return false;
      return setRemoteValue(fieldDef.key, value);
    })
  );

  if (results.every(Boolean)) {
    status.textContent = "Listo, se guardaron todos los cambios ✅";
    status.className = "status ok";
  } else {
    status.textContent = "Algunos valores no se pudieron guardar (probá de nuevo en unos segundos).";
    status.className = "status error";
  }
}
