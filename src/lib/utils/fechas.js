import {
  differenceInCalendarDays,
  startOfDay,
  addMonths,
  addDays,
  setDate,
  format,
  isBefore,
  isAfter,
  getDaysInMonth
} from 'date-fns';
import { es } from 'date-fns/locale';

/* ===================== Formato ===================== */
export function formatearFecha(fecha) {
  return format(fecha, 'd MMM', { locale: es }).toUpperCase();
}

/* ===================== Ciclo fijo ===================== */

// El pago se ubica en el mes siguiente al cierre
function pagoTrasCierre(diaPago, cierre) {
  const base = addDays(startOfDay(cierre), 1);
  const esteMes = setDate(base, Math.min(diaPago, getDaysInMonth(base)));
  if (!isBefore(esteMes, base)) return esteMes;
  const mesSig = addMonths(base, 1);
  return setDate(mesSig, Math.min(diaPago, getDaysInMonth(mesSig)));
}

// inicio = cierre − 1 mes + 1 día
function inicioDesdeCierre(cierre) {
  const mesAnt = addMonths(startOfDay(cierre), -1);
  return addDays(mesAnt, 1);
}

/**
 * Elige el ciclo fijo cuyo PAGO es el más cercano en el futuro (>= hoy).
 * Si todos están vencidos, devuelve el último.
 */
function cicloFijo(diaCierre, diaPago, hoy) {
  const hoyNorm = startOfDay(hoy);

  const candidatos = [-1, 0, 1].map((offset) => {
    const mes = addMonths(hoyNorm, offset);
    const lastDay = getDaysInMonth(mes);
    const cierre = setDate(mes, Math.min(diaCierre, lastDay));
    const pago = pagoTrasCierre(diaPago, cierre);
    return { inicio: inicioDesdeCierre(cierre), cierre, pago };
  });

  const futuros = candidatos
    .filter((c) => !isBefore(c.pago, hoyNorm))
    .sort((a, b) => a.pago - b.pago);

  if (futuros.length) return futuros[0];
  return candidatos.sort((a, b) => b.pago - a.pago)[0];
}

/* ===================== Ciclo variable ===================== */

function cicloVariable(ciclos, hoy) {
  const hoyNorm = startOfDay(hoy);
  const parseados = ciclos.map((c) => ({
    inicio: startOfDay(new Date(c.inicio + 'T00:00:00')),
    cierre: startOfDay(new Date(c.cierre + 'T00:00:00')),
    pago: startOfDay(new Date(c.pago + 'T00:00:00'))
  }));

  // Pago >= hoy, más cercano
  const futuros = parseados
    .filter((c) => !isBefore(c.pago, hoyNorm))
    .sort((a, b) => a.pago - b.pago);

  if (futuros.length) return futuros[0];

  // Fallback: el último pago disponible
  return [...parseados].sort((a, b) => b.pago - a.pago)[0];
}

/* ===================== Procesador principal ===================== */

export function procesarTarjetas(tarjetas, hoy = new Date()) {
  const hoyNorm = startOfDay(hoy);

  return tarjetas.map((t) => {
    const ciclo =
      t.tipoPeriodo === 'variable'
        ? cicloVariable(t.ciclos, hoyNorm)
        : cicloFijo(t.diaCierre, t.diaPago, hoyNorm);

    const { inicio, cierre, pago } = ciclo;

    const diasParaCierre = differenceInCalendarDays(cierre, hoyNorm);
    const diasParaPago = differenceInCalendarDays(pago, hoyNorm);

    // Fase del ciclo
    const fase = isBefore(hoyNorm, inicio)
      ? 'antes'
      : isBefore(hoyNorm, cierre)
        ? 'facturando'
        : !isAfter(hoyNorm, pago)
          ? 'porPagar'
          : 'vencido';

    // Posiciones % sobre [inicio, pago]
    const totalMs = pago.getTime() - inicio.getTime();
    const pct = (ms) =>
      totalMs <= 0 ? 0 : Math.max(0, Math.min(100, (ms / totalMs) * 100));

    const cierrePct = pct(cierre.getTime() - inicio.getTime());
    const hoyPct = pct(hoyNorm.getTime() - inicio.getTime());

    return {
      ...t,
      inicio,
      cierre,
      pago,
      diasParaCierre,
      diasParaPago,
      fase,
      cierrePct,
      hoyPct,
      inicioFmt: formatearFecha(inicio),
      cierreFmt: formatearFecha(cierre),
      pagoFmt: formatearFecha(pago),
      urgente: diasParaPago <= 3 && diasParaPago >= 0,
      advertencia: diasParaPago > 3 && diasParaPago <= 7
    };
  });
}