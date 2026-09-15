import { base } from '$app/paths';

const KEY = 'tarjetas:v1';

class TarjetasStore {
  tarjetas = $state([]);
  cargando = $state(true);
  error = $state(null);
  origen = $state(null); // 'local' | 'seed'

  #iniciado = false;

  async init() {
    if (this.#iniciado) return;
    if (typeof window === 'undefined') return;
    this.#iniciado = true;

    this.cargando = true;
    this.error = null;

    try {
      // 1. Intentar localStorage
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          this.tarjetas = parsed;
          this.origen = 'local';
          this.cargando = false;
          return;
        }
      }

      // 2. Fallback a seed en /static
      const res = await fetch(`${base}/data/tarjetas-seed.json`, {
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error(`No se pudo cargar el seed (HTTP ${res.status})`);
      const json = await res.json();
      this.tarjetas = json.tarjetas ?? [];
      this.origen = 'seed';
      this.#persist();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.cargando = false;
    }
  }

  #persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.tarjetas));
    } catch (e) {
      this.error = 'No se pudo guardar en el dispositivo';
    }
  }

  reemplazar(nuevas) {
    this.tarjetas = nuevas;
    this.origen = 'local';
    this.#persist();
  }

  agregar(t) {
    this.tarjetas = [...this.tarjetas, t];
    this.#persist();
  }

  actualizar(id, cambios) {
    this.tarjetas = this.tarjetas.map((t) =>
      t.id === id ? { ...t, ...cambios } : t
    );
    this.#persist();
  }

  eliminar(id) {
    this.tarjetas = this.tarjetas.filter((t) => t.id !== id);
    this.#persist();
  }

  exportar() {
    return JSON.stringify({ tarjetas: this.tarjetas }, null, 2);
  }

  importar(texto) {
    const parsed = JSON.parse(texto);
    const lista = Array.isArray(parsed) ? parsed : parsed.tarjetas;
    if (!Array.isArray(lista)) throw new Error('El JSON no contiene un array "tarjetas"');
    if (!lista.length) throw new Error('El array está vacío');
    for (const t of lista) {
      if (!t.id) throw new Error(`Tarjeta sin "id": ${JSON.stringify(t).slice(0, 60)}…`);
    }
    this.reemplazar(lista);
  }

  async resetear() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
    this.#iniciado = false;
    await this.init();
  }
}

export const tarjetas = new TarjetasStore();