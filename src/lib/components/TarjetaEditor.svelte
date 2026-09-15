<script>
  import { untrack } from 'svelte';
  import { COLORES, LISTA_COLORES } from '$lib/data/colores.js';

  let {
    tarjeta = null,
    idsExistentes = [],
    onSave,
    onCancel
  } = $props();


  // 1) Lee el prop sin reactividad
  const inicial = untrack(() => tarjeta);

  // 2) Convierte el proxy de Svelte en objeto plano (clon seguro)
  const tarjetaInicial = inicial ? $state.snapshot(inicial) : null;

  const esNueva = tarjetaInicial === null;

   // 3) Inicializa el formulario desde el objeto plano
  let form = $state(
    tarjetaInicial ?? {
      id: '',
      nombre: '',
      banco: '',
      tipoPeriodo: 'fijo',
      diaPago: 15,
      diaCierre: 20,
      color: 'emerald',
      ciclos: [{ inicio: '', cierre: '', pago: '' }]
    }
  );


  let errores = $state({});

  /* ------------------ Validación ------------------ */
  function validar() {
    const e = {};
    const id = (form.id ?? '').trim();

    if (!id) e.id = 'Requerido';
    else if (!/^[a-z0-9-]+$/.test(id)) e.id = 'Solo minúsculas, números y guiones';
    else if (esNueva && idsExistentes.includes(id)) e.id = 'Ya existe una tarjeta con ese id';

    if (!form.nombre?.trim()) e.nombre = 'Requerido';
    if (!form.banco?.trim()) e.banco = 'Requerido';

    if (form.tipoPeriodo === 'fijo') {
      if (!Number.isInteger(+form.diaPago) || +form.diaPago < 1 || +form.diaPago > 31)
        e.diaPago = 'Día 1–31';
      if (!Number.isInteger(+form.diaCierre) || +form.diaCierre < 1 || +form.diaCierre > 31)
        e.diaCierre = 'Día 1–31';
    } else {
      if (!form.ciclos?.length) e.ciclos = 'Agrega al menos un ciclo';
      else {
        form.ciclos.forEach((c, i) => {
          if (!c.inicio || !c.cierre || !c.pago) e[`ciclo-${i}`] = 'Completa las 3 fechas';
          else if (!(c.inicio < c.cierre && c.cierre < c.pago))
            e[`ciclo-${i}`] = 'Debe cumplir inicio < cierre < pago';
        });
      }
    }

    errores = e;
    return Object.keys(e).length === 0;
  }

  /* ------------------ Guardar ------------------ */
  function guardar() {
    if (!validar()) return;
    const limpio = { ...form, id: form.id.trim() };
    if (limpio.tipoPeriodo === 'fijo') {
      delete limpio.ciclos;
      limpio.diaPago = +limpio.diaPago;
      limpio.diaCierre = +limpio.diaCierre;
    } else {
      delete limpio.diaPago;
      delete limpio.diaCierre;
    }
    onSave(limpio);
  }

  /* ------------------ Ciclos ------------------ */
  function agregarCiclo() {
    form.ciclos = [...form.ciclos, { inicio: '', cierre: '', pago: '' }];
  }
  function eliminarCiclo(i) {
    form.ciclos = form.ciclos.filter((_, idx) => idx !== i);
  }

  /* ------------------ Auto-id ------------------ */
  function sugerirId() {
    if (esNueva && form.nombre && !form.id) {
      form.id = form.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  /* ------------------ Estilos ------------------ */
  const inputBase =
    'w-full text-xs bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-2 text-gray-200 placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none';
  const labelBase = 'block text-[10px] font-medium text-gray-400 mb-1';
  const errBase = 'text-[10px] text-red-400 mt-0.5';
</script>

<form
  onsubmit={(e) => { e.preventDefault(); guardar(); }}
  class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3"
>
  <!-- Encabezado -->
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold text-white">
      {esNueva ? 'Nueva tarjeta' : 'Editar tarjeta'}
    </h3>
    <button
      type="button"
      onclick={onCancel}
      class="text-[11px] text-gray-400 hover:text-gray-200"
    >
      Cancelar
    </button>
  </div>

  <!-- Nombre / Banco (label envuelve al input) -->
  <div class="grid grid-cols-2 gap-2">
    <label class="block">
      <span class={labelBase}>Nombre</span>
      <input
        type="text"
        class={inputBase}
        bind:value={form.nombre}
        onblur={sugerirId}
        placeholder="Ej. BCP Qore"
      />
      {#if errores.nombre}<span class={errBase + ' block'}>{errores.nombre}</span>{/if}
    </label>
    <label class="block">
      <span class={labelBase}>Banco</span>
      <input
        type="text"
        class={inputBase}
        bind:value={form.banco}
        placeholder="Ej. BCP"
      />
      {#if errores.banco}<span class={errBase + ' block'}>{errores.banco}</span>{/if}
    </label>
  </div>

  <!-- ID -->
  <label class="block">
    <span class={labelBase}>ID (identificador único)</span>
    <input
      type="text"
      class={inputBase}
      bind:value={form.id}
      placeholder="bcp-qore"
      disabled={!esNueva}
    />
    {#if errores.id}<span class={errBase + ' block'}>{errores.id}</span>{/if}
  </label>

  <!-- Tipo de periodo -->
  <div>
    <span class={labelBase}>Tipo de periodo</span>
    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        onclick={() => (form.tipoPeriodo = 'fijo')}
        class="text-xs py-2 rounded-lg border transition
          {form.tipoPeriodo === 'fijo'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : 'bg-gray-900 border-gray-800 text-gray-400'}"
      >
        Fijo
      </button>
      <button
        type="button"
        onclick={() => {
          form.tipoPeriodo = 'variable';
          if (!form.ciclos?.length) form.ciclos = [{ inicio: '', cierre: '', pago: '' }];
        }}
        class="text-xs py-2 rounded-lg border transition
          {form.tipoPeriodo === 'variable'
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            : 'bg-gray-900 border-gray-800 text-gray-400'}"
      >
        Variable
      </button>
    </div>
  </div>

  <!-- Campos según tipo -->
  {#if form.tipoPeriodo === 'fijo'}
    <div class="grid grid-cols-2 gap-2">
      <label class="block">
        <span class={labelBase}>Día de pago</span>
        <input type="number" min="1" max="31" class={inputBase} bind:value={form.diaPago} />
        {#if errores.diaPago}<span class={errBase + ' block'}>{errores.diaPago}</span>{/if}
      </label>
      <label class="block">
        <span class={labelBase}>Día de cierre</span>
        <input type="number" min="1" max="31" class={inputBase} bind:value={form.diaCierre} />
        {#if errores.diaCierre}<span class={errBase + ' block'}>{errores.diaCierre}</span>{/if}
      </label>
    </div>
    <p class="text-[10px] text-gray-500 leading-relaxed">
      El <em>inicio</em> del ciclo se calcula automáticamente como <code>cierre − 1 mes + 1 día</code>.
    </p>
  {:else}
    <div>
      <div class="flex items-center justify-between mb-1">
        <span class={labelBase + ' mb-0'}>Ciclos ({form.ciclos.length})</span>
        <button
          type="button"
          onclick={agregarCiclo}
          class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
        >
          + Añadir
        </button>
      </div>

      {#if errores.ciclos}
        <p class={errBase + ' mb-1'}>{errores.ciclos}</p>
      {/if}

      <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
        {#each form.ciclos as ciclo, i}
          <div class="rounded-lg border border-gray-800 bg-gray-900/60 p-2">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] text-gray-500">Ciclo #{i + 1}</span>
              <button
                type="button"
                onclick={() => eliminarCiclo(i)}
                class="text-[10px] text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
            <div class="grid grid-cols-3 gap-1.5">
              <label class="block">
                <span class="block text-[9px] text-gray-500 mb-0.5">Inicio</span>
                <input type="date" class={inputBase + ' px-1.5! py-1! text-[10px]'} bind:value={ciclo.inicio} />
              </label>
              <label class="block">
                <span class="block text-[9px] text-gray-500 mb-0.5">Cierre</span>
                <input type="date" class={inputBase + ' px-1.5! py-1! text-[10px]'} bind:value={ciclo.cierre} />
              </label>
              <label class="block">
                <span class="block text-[9px] text-gray-500 mb-0.5">Pago</span>
                <input type="date" class={inputBase + ' px-1.5! py-1! text-[10px]'} bind:value={ciclo.pago} />
              </label>
            </div>
            {#if errores[`ciclo-${i}`]}
              <p class={errBase}>{errores[`ciclo-${i}`]}</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Color -->
  <div>
    <span class={labelBase}>Color</span>
    <div class="flex flex-wrap gap-2">
      {#each LISTA_COLORES as c}
        <button
          type="button"
          onclick={() => (form.color = c)}
          aria-label="Color {c}"
          aria-pressed={form.color === c}
          title={c}
          class="w-6 h-6 rounded-full {COLORES[c].fill} transition
            {form.color === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}"
        ></button>
      {/each}
    </div>
  </div>

  <!-- Acciones -->
  <div class="flex gap-2 pt-1">
    <button
      type="button"
      onclick={onCancel}
      class="flex-1 text-xs font-medium py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 active:scale-[0.98] transition"
    >
      Cancelar
    </button>
    <button
      type="submit"
      class="flex-1 text-xs font-medium py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 active:scale-[0.98] transition"
    >
      {esNueva ? 'Crear' : 'Guardar'}
    </button>
  </div>
</form>