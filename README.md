# Tarjeta-Pago

Este programa muestra visualmente las fecha de las tarjetas de crédito. La informacion se puede adicionar mediante un .json o desde la interface. Siempre la data es local. 


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


Accede a la página [tarjetas-pago](https://cesarpe.github.io/tarjetas-pago/) .



## Colores soportados
```
--- Verdes ---
emerald:
green:  
teal:   
lime:   

--- Cian / Azules ---
cyan:   
sky:    
blue:   
indigo: 
violet: 
purple: 

--- Rosados / Magentas ---
fuchsia:
pink:   
rose:   

--- Cálidos ---
red:    
orange: 
amber:  
yellow: 

--- Neutros ---
slate: 
stone: 
```

##  Ejemplos de json 
```json
{
  "tarjetas": [
    {
      "id": "mio",
      "nombre": "Tarjeta IO",
      "banco": "Bcp",
      "tipoPeriodo": "fijo",
      "diaPago": 12,
      "diaCierre": 25,
      "color": "sky"
    },
    {
      "id": "interbank-light",
      "nombre": "Interbank Light",
      "banco": "Interbank",
      "tipoPeriodo": "fijo",
      "diaPago": 5,
      "diaCierre": 28,
      "color": "rose"
    },
    {
      "id": "bcp-qore",
      "nombre": "BCP Qore",
      "banco": "BCP",
      "tipoPeriodo": "variable",
      "color": "amber",
      "ciclos": [       
        { "inicio": "2025-11-26", "cierre": "2025-12-24", "pago": "2026-01-20" },
        { "inicio": "2025-12-25", "cierre": "2026-01-25", "pago": "2026-02-22" },
        { "inicio": "2026-01-26", "cierre": "2026-02-24", "pago": "2026-03-20" },
        { "inicio": "2026-02-25", "cierre": "2026-03-25", "pago": "2026-04-22" },
        { "inicio": "2026-03-26", "cierre": "2026-04-25", "pago": "2026-05-20" },
        { "inicio": "2026-04-26", "cierre": "2026-05-23", "pago": "2026-06-23" },
        { "inicio": "2026-05-24", "cierre": "2026-06-25", "pago": "2026-07-22" },
        { "inicio": "2026-06-26", "cierre": "2026-07-24", "pago": "2026-08-20" },
        { "inicio": "2026-07-25", "cierre": "2026-08-25", "pago": "2026-09-22" },
        { "inicio": "2026-08-26", "cierre": "2026-09-25", "pago": "2026-10-20" },
        { "inicio": "2026-09-26", "cierre": "2026-10-23", "pago": "2026-11-23" },
        { "inicio": "2026-10-24", "cierre": "2026-11-25", "pago": "2026-12-22" },
        { "inicio": "2026-11-26", "cierre": "2026-12-24", "pago": "2027-01-20" },
        { "inicio": "2026-12-25", "cierre": "2027-01-25", "pago": "2027-02-22" }
      ]
    },
    
  ]
}
```
---
Programa creado en Svelte, tailwind y date-fns (pare el manejo de las fechas).