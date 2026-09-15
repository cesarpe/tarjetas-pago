<script>
  import { tarjetas } from '$lib/stores/tarjetas.svelte.js';
  import { procesarTarjetas } from '$lib/utils/fechas.js';
  import { base } from '$app/paths';

  let hoy = $state(new Date());

  $effect(() => {
    tarjetas.init();
  });

  $effect(() => {
    const tick = () => (hoy = new Date());
    const interval = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  });

  let procesadas = $derived(
    tarjetas.tarjetas.length
      ? procesarTarjetas(tarjetas.tarjetas, hoy).sort(
          (a, b) => a.diasParaPago - b.diasParaPago
        )
      : []
  );

  const colores = {
    // --- Verdes ---
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', fill: 'bg-emerald-500', ring: 'ring-emerald-400' },
    green:   { bg: 'bg-green-500/10',   border: 'border-green-500/30',   text: 'text-green-400',   fill: 'bg-green-500',   ring: 'ring-green-400' },
    teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    text: 'text-teal-400',    fill: 'bg-teal-500',    ring: 'ring-teal-400' },
    lime:    { bg: 'bg-lime-500/10',    border: 'border-lime-500/30',    text: 'text-lime-400',    fill: 'bg-lime-500',    ring: 'ring-lime-400' },

    // --- Cian / Azules ---
    cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    text: 'text-cyan-400',    fill: 'bg-cyan-500',    ring: 'ring-cyan-400' },
    sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     text: 'text-sky-400',     fill: 'bg-sky-500',     ring: 'ring-sky-400' },
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400',    fill: 'bg-blue-500',    ring: 'ring-blue-400' },
    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-400',  fill: 'bg-indigo-500',  ring: 'ring-indigo-400' },
    violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-400',  fill: 'bg-violet-500',  ring: 'ring-violet-400' },
    purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  text: 'text-purple-400',  fill: 'bg-purple-500',  ring: 'ring-purple-400' },

    // --- Rosados / Magentas ---
    fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', fill: 'bg-fuchsia-500', ring: 'ring-fuchsia-400' },
    pink:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    text: 'text-pink-400',    fill: 'bg-pink-500',    ring: 'ring-pink-400' },
    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    fill: 'bg-rose-500',    ring: 'ring-rose-400' },

    // --- Cálidos ---
    red:     { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     fill: 'bg-red-500',     ring: 'ring-red-400' },
    orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  fill: 'bg-orange-500',  ring: 'ring-orange-400' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   fill: 'bg-amber-500',   ring: 'ring-amber-400' },
    yellow:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  fill: 'bg-yellow-500',  ring: 'ring-yellow-400' },

    // --- Neutros ---
    slate:   { bg: 'bg-slate-500/10',   border: 'border-slate-500/30',   text: 'text-slate-300',   fill: 'bg-slate-500',   ring: 'ring-slate-400' },
    stone:   { bg: 'bg-stone-500/10',   border: 'border-stone-500/30',   text: 'text-stone-300',   fill: 'bg-stone-500',   ring: 'ring-stone-400' }
  };
</script>

<div class="min-h-screen bg-gray-950 px-4 pt-6 pb-10">
  <header class="mb-5 flex items-start justify-between">
    <div>
      <h1 class="text-xl font-bold text-white tracking-tight">Mis Tarjetas</h1>
      <p class="text-xs text-gray-500 mt-0.5">
        {hoy.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
    <a
      href="{base}/config"
      class="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
    >
      ⚙︎ Config
    </a>
  </header>

  {#if tarjetas.cargando}
    <div class="text-center text-gray-500 text-sm py-10">Cargando…</div>
  {:else if tarjetas.error}
    <div class="text-center text-red-400 text-sm py-10">{tarjetas.error}</div>
  {:else if !procesadas.length}
    <div class="text-center text-gray-500 text-sm py-10">
      No hay tarjetas configuradas.<br />
      <a href="{base}/config" class="text-emerald-400 underline">Ir a Configuración</a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each procesadas as t (t.id)}
        {@const c = colores[t.color] ?? colores.emerald}

        <article class="rounded-2xl border {c.border} {c.bg} p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="min-w-0">
              <h2 class="text-sm font-semibold text-white truncate">{t.nombre}</h2>
              <p class="text-[10px] text-gray-500">{t.banco}</p>
            </div>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2
                {t.tipoPeriodo === 'fijo'
                  ? 'bg-gray-700/60 text-gray-300'
                  : 'bg-indigo-500/20 text-indigo-300'}"
            >
              {t.tipoPeriodo}
            </span>
          </div>

          <div class="relative pt-1 pb-6">
            <div class="relative h-6 text-[9px] leading-tight">
              <div class="absolute left-0">
                <div class="text-gray-500">inicio</div>
                <div class="text-gray-300 font-semibold tracking-wide">{t.inicioFmt}</div>
              </div>
              <div class="absolute -translate-x-1/2 text-center" style="left: {t.cierrePct}%">
                <div class="text-gray-500">cierre</div>
                <div class="text-gray-200 font-semibold tracking-wide">{t.cierreFmt}</div>
              </div>
              <div class="absolute right-0 text-right">
                <div class="text-gray-500">pago</div>
                <div class="{c.text} font-semibold tracking-wide">{t.pagoFmt}</div>
              </div>
            </div>

            <div class="relative h-4 mt-1">
              <div class="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 bg-gray-800/80 rounded-full"></div>
              <div
                class="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 {c.fill} rounded-l-full"
                style="width: {t.cierrePct}%"
              ></div>
              <div
                class="absolute top-1/2 -translate-y-1/2 h-1.5 {c.fill} opacity-30 rounded-r-full"
                style="left: {t.cierrePct}%; right: 0"
              ></div>
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style="left: {t.cierrePct}%"
              >
                <div class="w-2 h-2 rounded-full bg-white ring-2 ring-gray-950"></div>
              </div>
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                style="left: 100%"
              >
                <div class="w-2 h-2 rounded-full {c.fill} ring-2 ring-white/40"></div>
              </div>
              <div
                class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                style="left: {t.hoyPct}%"
              >
                <div
                  class="w-3.5 h-3.5 rounded-full bg-white ring-2 {c.ring} shadow-md
                    {t.urgente ? 'animate-pulse' : ''}"
                ></div>
              </div>
            </div>

            <div
              class="absolute -translate-x-1/2 text-[9px] font-semibold text-white/90 whitespace-nowrap"
              style="left: {t.hoyPct}%; bottom: 0"
            >
              hoy
            </div>
          </div>

          <div class="flex flex-col gap-0.5 text-xs mt-1">
            {#if t.diasParaCierre > 0}
              <p class="text-gray-400">
                Faltan <span class="text-gray-200 font-semibold">{t.diasParaCierre}</span> días para el cierre
              </p>
            {:else if t.diasParaCierre === 0}
              <p class="text-gray-200 font-semibold">Hoy cierra el ciclo</p>
            {:else}
              <p class="text-gray-500">Ciclo cerrado hace {Math.abs(t.diasParaCierre)} días</p>
            {/if}

            {#if t.urgente}
              <p class="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Faltan {t.diasParaPago} días para el pago
              </p>
            {:else if t.advertencia}
              <p class="text-sm font-semibold text-amber-400">
                Faltan {t.diasParaPago} días para el pago
              </p>
            {:else}
              <p class="text-sm text-gray-300">
                Faltan {t.diasParaPago} días para el pago
              </p>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</div>