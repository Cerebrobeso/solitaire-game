# Solitario 🃏

Un clone del classico **Klondike Solitaire** costruito con Angular 21, sviluppato con l'assistenza di [Claude AI](https://claude.ai) e [Claude Code](https://claude.ai/code).

🎮 **[Gioca online](https://cerebrobeso.github.io/solitaire-game/)**

---

## Tecnologie

| Tecnologia | Versione | Uso |
|---|---|---|
| [Angular](https://angular.dev) | 21 | Framework principale |
| [Angular CDK](https://material.angular.io/cdk) | 21 | Drag & Drop |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Stili |
| [Lucide Angular](https://lucide.dev) | latest | Icone SVG |
| [Vitest](https://vitest.dev) | 4 | Unit test |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Linguaggio |

---

## Funzionalità

- Mazzo completo da 52 carte con shuffle Fisher-Yates
- Tableau con 7 colonne e giro automatico delle carte scoperte
- Pila degli scarti (waste pile) con possibilità di riciclo
- 4 fondamenta per completare il gioco dall'Asso al Re per ogni seme
- Drag & drop nativo con validazione delle mosse in tempo reale
- Spostamento di sequenze intere di carte con un solo trascinamento
- Modale di vittoria al completamento del gioco
- Nuova partita in qualsiasi momento

---

## Architettura

Il progetto usa il pattern **standalone components** di Angular 21 con **signals** per la gestione dello stato reattivo, senza NgModules né RxJS.

```
src/app/
├── components/
│   ├── card/               # Singola carta (fronte/retro)
│   ├── stock-pile/         # Pila del mazzo
│   ├── waste-pile/         # Pila degli scarti
│   ├── foundation-pile/    # Le 4 fondamenta
│   └── tableau-column/     # Le 7 colonne di gioco
├── services/
│   ├── game.service.ts     # Stato di gioco, validazione, mosse
│   ├── deck.service.ts     # Gestione del mazzo (signal-based)
│   └── drag-state.service.ts  # Coordinamento drag & drop
└── models/
    ├── card.model.ts       # Tipi Card, Suit, Rank e utilità
    ├── tableau.model.ts    # Interfaccia TableauColumn
    └── foundation.model.ts # Interfaccia Foundation
```

**Pattern chiave:**

- Stato gestito esclusivamente con `signal()` e `computed()`
- Drag & drop tramite CDK con predicato `canEnter` per validazione prima del drop
- ID computati per i drop zone cross-component (`columnIds`, `foundationIds`, `tableauIds`)

---

## Come è stato creato — con l'aiuto di Claude AI

Questo progetto è stato sviluppato in **pair programming interattivo** con [Claude Code](https://claude.ai/code), il tool CLI di Anthropic per lo sviluppo software assistito da AI.

### Il processo di sviluppo

L'idea di partenza era costruire un solitario funzionante in Angular usando le API moderne. Claude ha supportato ogni fase:

1. **Progettazione dell'architettura** — separazione tra servizi, scelta dei signal come unico strato di stato, struttura dei modelli
2. **Logica di gioco** — implementazione di `canDrop`, `canDropOnFoundation`, gestione del mazzo, riciclo degli scarti
3. **CDK Drag & Drop** — coordinare drop zone tra componenti diversi, trascinare sequenze di carte, drag preview
4. **Edge case** — flip automatico della carta esposta dopo uno spostamento, mosse dalle fondamenta al tableau, condizione di vittoria
5. **Deploy** — configurazione del workflow GitHub Actions per GitHub Pages con OIDC (nessun token manuale)

### I test scritti dagli agenti

La parte più interessante del progetto: i **test unit sono stati scritti usando gli agenti di Claude Code**.

Invece di scrivere i test manualmente, ho avviato il comando `/test` di Claude Code: un agente ha esplorato in profondità il codebase analizzando ogni metodo e contratto dei servizi, un altro ha progettato la strategia di copertura, e infine Claude ha implementato **94 test** distribuiti su 4 file:

| File | Cosa testa |
|---|---|
| `card.model.spec.ts` | `isRedSuit()`, `RANK_ORDER`, costanti |
| `deck.service.spec.ts` | Reset, shuffle, draw, waste, riciclo |
| `drag-state.service.spec.ts` | Payload drag, segnale `dragging` |
| `game.service.spec.ts` | Deal iniziale, `canDrop`, `canDropOnFoundation`, `moveCard` da tutte le sorgenti, `moveToFoundation`, `hasWon` |

Gli agenti hanno trovato e corretto anche due test preesistenti rotti: un import sbagliato in `tableau-column.spec.ts` e un testo atteso errato in `app.spec.ts`.

```
Test Files  7 passed (7)
      Tests  94 passed (94)
```

---

## Esegui in locale

```bash
# Clona il repo
git clone https://github.com/Cerebrobeso/solitaire-game.git
cd solitaire-game

# Installa le dipendenze
npm install

# Avvia il dev server
npm start
# → http://localhost:4200
```

```bash
# Esegui i test
npm test

# Build di produzione
npm run build
```

---

## Deploy su GitHub Pages

Il deploy è automatico via **GitHub Actions** ad ogni push su `master`.

Il workflow (`.github/workflows/deploy.yml`):
1. Installa le dipendenze con `npm ci`
2. Builda con `--base-href /solitaire-game/`
3. Pubblica `dist/solitaire/browser/` su GitHub Pages tramite OIDC (nessun token manuale necessario)

---

## Licenza

MIT
