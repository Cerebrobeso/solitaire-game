import {Injectable, inject, signal, computed} from '@angular/core';
import {Card, RANK_ORDER, isRedSuit, SUITS, Suit} from '../models/card.model';
import { TableauColumn } from '../models/tableau.model';
import { DeckService } from './deck.service';
import { DragPayload } from './drag-state.service';
import {Foundation} from '../models/foundation.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly deck = inject(DeckService);

  private readonly _tableau = signal<TableauColumn[]>([]);
  private readonly _foundations = signal<Foundation[]>(
    SUITS.map(suit => ({ suit, cards: [] }))
  );

  readonly tableau = this._tableau.asReadonly();
  readonly foundations = this._foundations.asReadonly();

  readonly foundationIds = computed(() => SUITS.map(s => `foundation-${s}`));

  readonly tableauIds = computed(() => this._tableau().map(c => c.id.toString()));
  readonly columnIds = computed(() => [
    'waste',
    ...this.foundationIds(),
    ...this.tableauIds()
  ]);
  readonly hasWon = computed(() =>
    this._foundations().every(f => f.cards.length === 13)
  );


  constructor() {
    this.dealInitial();
  }

  dealInitial(): void {
    this._foundations.set(SUITS.map(suit => ({ suit, cards: [] })));

    let columns: TableauColumn[];
    let attempts = 0;

    do {
      this.deck.reset();
      this.deck.shuffle();

      columns = Array.from({length: 7}, (_, i) => ({
        id: i,
        cards: [],
      }));

      for (let col = 0;
        col < 7;
        col++) {
        for (let row = 0;
          row <= col;
          row++) {
          const card = this.deck.draw();
          if ( !card ) continue;
          columns[col].cards.push({
            ...card,
            faceUp: row === col,
          });
        }
      }
      console.log('Attempts n. ' + (attempts + 1))
    } while (attempts++ < 50 && !this.hasInitialMoves(columns))

    this._tableau.set(columns);
  }

canDrop(card: Card, targetColumn: TableauColumn): boolean {
    if (targetColumn.cards.length === 0) {
      return card.rank === 'K';
    }
    const top = targetColumn.cards[targetColumn.cards.length - 1];
    if (!top.faceUp) return false;
    const rankOk = RANK_ORDER[card.rank] === RANK_ORDER[top.rank] - 1;
    const colorOk = isRedSuit(card.suit) !== isRedSuit(top.suit);
    return rankOk && colorOk;
  }

  moveCard(payload: DragPayload, targetColumnId: number): void {
    if (payload.sourceColumnId === -1) {
      // dalla pila stock: rimuovi dal mazzo e aggiungi alla colonna
      this._tableau.update(cols => {
        const updated = cols.map(col => ({ ...col, cards: [...col.cards] }));
        const target = updated.find(c => c.id === targetColumnId);
        if (!target) return cols;
        this.deck.draw();
        target.cards.push({ ...payload.card, faceUp: true });
        return updated;
      });
      return;
    }

    if (payload.sourceColumnId === -2) {
      // dalla waste pile: rimuovi dalla waste e aggiungi alla colonna
      this._tableau.update(cols => {
        const updated = cols.map(col => ({ ...col, cards: [...col.cards] }));
        const target = updated.find(c => c.id === targetColumnId);
        if (!target) return cols;
        this.deck.popFromWaste();
        target.cards.push({ ...payload.card, faceUp: true });
        return updated;
      });
      return;
    }

    if (payload.sourceColumnId === -3) {
      // dalla foundation: rimuovi la cima e aggiungi alla colonna
      this._foundations.update(foundations => {
        const updated = foundations.map(f => ({ ...f, cards: [...f.cards] }));
        const source = updated.find(f => f.suit === payload.card.suit);
        if (!source) return foundations;
        source.cards.pop();
        return updated;
      });
      this._tableau.update(cols => {
        const updated = cols.map(col => ({ ...col, cards: [...col.cards] }));
        const target = updated.find(c => c.id === targetColumnId);
        if (!target) return cols;
        target.cards.push({ ...payload.card, faceUp: true });
        return updated;
      });
      return;
    }

    if (payload.sourceColumnId === targetColumnId) return;

    this._tableau.update(cols => {
      const updated = cols.map(col => ({ ...col, cards: [...col.cards] }));

      const source = updated.find(c => c.id === payload.sourceColumnId);
      const target = updated.find(c => c.id === targetColumnId);
      if (!source || !target) return cols;

      const cardIndex = source.cards.findIndex(c => c.id === payload.card.id);
      if (cardIndex === -1) return cols;
      const movedCards = source.cards.splice(cardIndex);
      if (!movedCards.length) return cols;
      target.cards.push(...movedCards.map(c => ({ ...c, faceUp: true })));

      // flip the new top card of the source column face-up
      if (source.cards.length > 0) {
        const newTop = source.cards[source.cards.length - 1];
        if (!newTop.faceUp) {
          source.cards[source.cards.length - 1] = { ...newTop, faceUp: true };
        }
      }

      return updated;
    });
  }

  canDropOnFoundation(card: Card, foundation: Foundation): boolean {
    if (foundation.cards.length === 0) {
      return card.rank === 'A' && card.suit === foundation.suit;
    }
    const top = foundation.cards[foundation.cards.length - 1];
    const rankOk = RANK_ORDER[card.rank] === RANK_ORDER[top.rank] + 1;
    const suitOk = card.suit === top.suit;
    return rankOk && suitOk;
  }

  moveToFoundation(payload: DragPayload, foundationIndex: number): void {
    if (payload.sourceColumnId === -2) {
      this.deck.popFromWaste();
    } else {
      this._tableau.update(cols => {
        const updated = cols.map(col => ({ ...col, cards: [...col.cards] }));
        const source = updated.find(c => c.id === payload.sourceColumnId);
        if (!source) return cols;
        source.cards.pop();
        if (source.cards.length > 0) {
          const newTop = source.cards[source.cards.length - 1];
          if (!newTop.faceUp) {
            source.cards[source.cards.length - 1] = { ...newTop, faceUp: true };
          }
        }
        return updated;
      });
    }
    this._foundations.update(foundations => {
      const updated = foundations.map(f => ({ ...f, cards: [...f.cards] }));
      updated[foundationIndex].cards.push({ ...payload.card, faceUp: true });
      return updated;
    });
  }

  private hasInitialMoves(columns: TableauColumn[]) {
    const faceUpCards = columns.map(col => col.cards.filter(c => c.faceUp)).flat();
    for (const card of faceUpCards) {
      for (const col of columns) {
        if (card.id === col.cards[col.cards.length - 1].id) continue;
        if (this.canDrop(card, col)) return true;
      }
    }

    const stockCards = this.deck.cards();
    const topDeckCard = stockCards[stockCards.length - 1];
    if (topDeckCard) {
      for (const col of columns) {
        if (this.canDrop(topDeckCard, col)) return true;
      }
    }

    return false;
  }
}
