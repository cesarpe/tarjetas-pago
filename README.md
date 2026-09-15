# Tarjeta-Pago

Este programa muestra visualmente las fecha de las tarjetas de credito


## Flujo

```text

┌─────────────── PRIMERA VEZ ───────────────┐
│  PWA abierta                              │
│  → localStorage vacío                     │
│  → fetch /data/tarjetas-seed.json         │
│  → guarda en localStorage['tarjetas:v1']  │
└───────────────────────────────────────────┘

┌─────────── SIGUIENTES VECES ──────────────┐
│  PWA abierta                              │
│  → lee localStorage['tarjetas:v1']        │
│  → NUNCA toca el seed                     │
└───────────────────────────────────────────┘

┌─────────── USUARIO EDITA ─────────────────┐
│  Config → importar / agregar / eliminar   │
│  → escribe en localStorage inmediatamente │
│  → la home se actualiza reactivamente     │
└───────────────────────────────────────────┘
```

Accede a [tarjetas-pago](https://cesarpe.github.io/tarjetas-pago/) .


