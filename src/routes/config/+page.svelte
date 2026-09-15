<script>
  import { tarjetas } from '$lib/stores/tarjetas.svelte.js';
  import { base } from '$app/paths';

  let fileInput;
  let mensaje = $state('');
  let error = $state('');
  let nuevoJson = $state('');
  let mostrarPegar = $state(false);

  $effect(() => {
    tarjetas.init();
  });

  function flash(msg) {
    mensaje = msg;
    error = '';
    setTimeout(() => (mensaje = ''), 3000);
  }

  function flashError(msg) {
    error = msg;
    mensaje = '';
    setTimeout(() => (error = ''), 5000);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const texto = await file.text();
      tarjetas.importar(texto);
      flash(`Importadas ${tarjetas.tarjetas.length} tarjetas`);
    } catch (err) {
      flashError(`Error al importar: ${err.message}`);
    }
    fileInput.value = '';
  }

  function exportar() {
    const json = tarjetas.exportar();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarjetas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('JSON descargado');
  }

  async function resetear() {
    if (!confirm('¿Restaurar los datos de ejemplo? Se perderán tus cambios.')) return;
    await tarjetas.resetear();
    flash('Datos restaurados de la semilla');
  }

  function agregarPegado() {
    try {
      const parsed = JSON.parse(nuevoJson);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (!item.id) throw new Error('Cada tarjeta necesita un "id"');
        if (tarjetas.tarjetas.some((t) => t.id === item.id)) {
          throw new Error(`Ya existe una tarjeta con id "${item.id}"`);
        }
      }
      for (const item of items) tarjetas.agregar(item);
      nuevoJson = '';
      mostrarPegar = false;
      flash(`Agregada(s) ${items.length} tarjeta(s)`);
    } catch (err) {
      flashError(`Error: ${err.message}`);
    }
  }

  function borrar(id) {
    if (!confirm(`¿Eliminar "${id}"?`)) return;
    tarjetas.eliminar(id);
    flash('Tarjeta eliminada');
  }

  const plantillaFija = `{
  "id": "mi-tarjeta",
  "nombre": "Mi Tarjeta",
  "banco": "Banco X",
  "tipoPeriodo": "fijo",
  "diaPago": 15,
  "diaCierre": 20,
  "color": "green"
}`;

  const plantillaVariable = `{
  "id": "mi-tarjeta-var",
  "nombre": "Mi Tarjeta Variable",
  "banco": "Banco Y",
  "tipoPeriodo": "variable",
  "color": "orange",
  "ciclos": [
    { "inicio": "2026-01-25", "cierre": "2026-02-24", "pago": "2026-03-20" }
  ]
}`;

  function cargarPlantilla(cual) {
    nuevoJson = cual === 'fija' ? plantillaFija : plantillaVariable;
    mostrarPegar = true;
  }
</script>

<div class="min-h-screen bg-gray-950 px-4 pt-6 pb-10">
  <header class="mb-5 flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-white tracking-tight">Configuración</h1>
      <p class="text-xs text-gray-500 mt-0.5">Datos guardados en este dispositivo</p>
    </div>
    <a
      href="{base}/"
      class="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
    >
      ← Volver
    </a>
  </header>

  <!-- Mensajes -->
  {#if mensaje}
    <div class="mb-4 text-xs px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
      {mensaje}
    </div>
  {/if}
  {#if error}
    <div class="mb-4 text-xs px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300">
      {error}
    </div>
  {/if}

  <!-- Acciones principales -->
  <section class="space-y-2 mb-6">
    <input
      type="file"
      accept="application/json,.json"
      bind:this={fileInput}
      onchange={handleFile}
      class="hidden"
    />
    <button
      onclick={() => fileInput.click()}
      class="w-full text-sm font-medium py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 active:scale-[0.98] transition"
    >
      📥 Importar JSON
    </button>
    <button
      onclick={exportar}
      class="w-full text-sm font-medium py-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 active:scale-[0.98] transition"
    >
      📤 Exportar JSON
    </button>
    <button
      onclick={resetear}
      class="w-full text-sm font-medium py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 active:scale-[0.98] transition"
    >
      ↺ Restaurar datos de ejemplo
    </button>
  </section>

  <!-- Agregar tarjeta -->
  <section class="mb-6">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-sm font-semibold text-white">Agregar tarjeta</h2>
      <button
        onclick={() => (mostrarPegar = !mostrarPegar)}
        class="text-[11px] text-gray-400 hover:text-gray-200"
      >
        {mostrarPegar ? 'Cancelar' : 'Abrir'}
      </button>
    </div>

    {#if mostrarPegar}
      <div class="space-y-2">
        <div class="flex gap-2">
          <button
            onclick={() => cargarPlantilla('fija')}
            class="flex-1 text-[11px] py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Plantilla fija
          </button>
          <button
            onclick={() => cargarPlantilla('variable')}
            class="flex-1 text-[11px] py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            Plantilla variable
          </button>
        </div>
        <textarea
          bind:value={nuevoJson}
          rows="10"
          placeholder="Pega aquí el JSON de la tarjeta o tarjetas..."
          class="w-full text-xs font-mono bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
        ></textarea>
        <button
          onclick={agregarPegado}
          disabled={!nuevoJson.trim()}
          class="w-full text-sm font-medium py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 disabled:opacity-40 active:scale-[0.98] transition"
        >
          Agregar
        </button>
      </div>
    {/if}
  </section>

  <!-- Listado actual -->
  <section>
    <h2 class="text-sm font-semibold text-white mb-2">
      Tarjetas actuales ({tarjetas.tarjetas.length})
    </h2>

    {#if tarjetas.cargando}
      <p class="text-xs text-gray-500">Cargando…</p>
    {:else if !tarjetas.tarjetas.length}
      <p class="text-xs text-gray-500">No hay tarjetas.</p>
    {:else}
      <ul class="space-y-2">
        {#each tarjetas.tarjetas as t (t.id)}
          <li class="flex items-center justify-between gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2">
            <div class="min-w-0">
              <p class="text-xs font-medium text-white truncate">{t.nombre}</p>
              <p class="text-[10px] text-gray-500 truncate">
                {t.banco} · {t.tipoPeriodo} · {t.color}
              </p>
            </div>
            <button
              onclick={() => borrar(t.id)}
              class="text-[11px] px-2 py-1 rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25 shrink-0"
            >
              Eliminar
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <!-- Info -->
  <p class="mt-6 text-[10px] text-gray-600 leading-relaxed">
    Los datos viven en el almacenamiento local de este navegador. Exporta un JSON
    para respaldarlos o transferirlos a otro dispositivo.
  </p>
</div>