<script>
  import { tarjetas } from '$lib/stores/tarjetas.svelte.js';
  import { base } from '$app/paths';
  import { COLORES } from '$lib/data/colores.js';
  import TarjetaEditor from '$lib/components/TarjetaEditor.svelte';

  let fileInput;
  let mensaje = $state('');
  let error = $state('');
  let editandoId = $state(null);
  let creandoNueva = $state(false);

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
    flash('Datos restaurados');
  }

  function borrar(id) {
    if (!confirm(`¿Eliminar "${id}"?`)) return;
    tarjetas.eliminar(id);
    if (editandoId === id) cerrarEditor();
    flash('Tarjeta eliminada');
  }

  function abrirEdicion(id) {
    creandoNueva = false;
    editandoId = id;
  }
  function abrirNueva() {
    editandoId = null;
    creandoNueva = true;
  }
  function cerrarEditor() {
    editandoId = null;
    creandoNueva = false;
  }

  function guardar(data) {
    if (creandoNueva) {
      tarjetas.agregar(data);
      flash('Tarjeta creada');
    } else {
      tarjetas.actualizar(editandoId, data);
      flash('Tarjeta actualizada');
    }
    cerrarEditor();
  }

  let idsExistentes = $derived(tarjetas.tarjetas.map((t) => t.id));
  let tarjetaEditando = $derived(
    editandoId ? tarjetas.tarjetas.find((t) => t.id === editandoId) : null
  );
</script>

<div class="min-h-screen bg-gray-950 px-4 pt-6 pb-10">
  <header class="mb-5 flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold text-white tracking-tight">Configuración</h1>
      <p class="text-xs text-gray-500 mt-0.5">Datos guardados en este dispositivo</p>
    </div>
    <a href="{base}/" class="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition" >
      ← Volver
    </a>
  </header>

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

  <!-- Acciones globales -->
  <section class="space-y-2 mb-6">
    <input type="file" accept="application/json,.json" bind:this={fileInput} onchange={handleFile} class="hidden" />

    <button onclick={() => fileInput.click()}
      class="w-full text-sm font-medium py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 active:scale-[0.98] transition"
    >
      📥 Importar JSON
    </button>
    <button onclick={exportar}
      class="w-full text-sm font-medium py-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 active:scale-[0.98] transition"
    >
      📤 Exportar JSON
    </button>
    <button onclick={resetear}
      class="w-full text-sm font-medium py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 active:scale-[0.98] transition"
    >
      ↺ Restaurar datos de ejemplo
    </button>
  </section>

  <!-- Lista / Editor -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-sm font-semibold text-white">
        Tarjetas ({tarjetas.tarjetas.length})
      </h2>
      {#if !creandoNueva && !editandoId}
        <button onclick={abrirNueva}
          class="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition"
        >
          + Nueva tarjeta
        </button>
      {/if}
    </div>

    <!-- Editor: nueva tarjeta -->
    {#if creandoNueva}
      <div class="mb-3">
        <TarjetaEditor tarjeta={null} {idsExistentes} onSave={guardar} onCancel={cerrarEditor} />
      </div>
    {/if}

    {#if tarjetas.cargando}
      <p class="text-xs text-gray-500">Cargando…</p>
    {:else if !tarjetas.tarjetas.length && !creandoNueva}
      <p class="text-xs text-gray-500">
        No hay tarjetas. Pulsa <strong>+ Nueva tarjeta</strong> o importa un JSON.
      </p>
    {:else}
      <ul class="space-y-2">
        {#each tarjetas.tarjetas as t (t.id)}
          {@const c = COLORES[t.color] ?? COLORES.emerald}

          {#if editandoId === t.id}
            <!-- Editor inline -->
            <li>
              <TarjetaEditor tarjeta={t} {idsExistentes} onSave={guardar} onCancel={cerrarEditor} />
            </li>
          {:else}
            <!-- Fila resumen -->
            <li class="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl px-3 py-2" >
              <span class="w-2.5 h-2.5 rounded-full {c.fill} shrink-0"></span>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-white truncate">{t.nombre}</p>
                <p class="text-[10px] text-gray-500 truncate">
                  {t.banco} · {t.tipoPeriodo}
                  {#if t.tipoPeriodo === 'fijo'}
                    · pago {t.diaPago} · cierre {t.diaCierre}
                  {:else}
                    · {t.ciclos?.length ?? 0} ciclos
                  {/if}
                </p>
              </div>
              <button onclick={() => abrirEdicion(t.id)} class="text-[11px] px-2 py-1 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 shrink-0">
                Editar
              </button>
              <button onclick={() => borrar(t.id)} class="text-[11px] px-2 py-1 rounded-md bg-red-500/15 text-red-300 hover:bg-red-500/25 shrink-0" >
                ✕
              </button>
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </section>

  <p class="mt-6 text-[10px] text-gray-600 leading-relaxed">
    Los datos viven en el almacenamiento local de este navegador. Exporta un JSON
    para respaldarlos o transferirlos a otro dispositivo.
  </p>
</div>