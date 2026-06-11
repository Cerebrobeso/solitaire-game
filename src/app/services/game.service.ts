import {Injectable, inject, signal, computed} from '@angular/core';
import { Card, RANK_ORDER, isRedSuit } from '../models/card.model';
import { TableauColumn } from '../models/tableau.model';
import { DeckService } from './deck.service';
import { DragPayload } from './drag-state.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly deck = inject(DeckService);

  private readonly _tableau = signal<TableauColumn[]>([]);
  readonly tableau = this._tableau.asReadonly();
  readonly columnIds = computed(() => [
    'stock',
    ...this._tableau().map(c => c.id.toString())
  ]);

  constructor() {
    this.dealInitial();
  }

  dealInitial(): void {
    this.deck.reset();
    this.deck.shuffle();

    const columns: TableauColumn[] = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      cards: [],
    }));

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = this.deck.draw();
        if (!card) continue;
        columns[col].cards.push({
          ...card,
          faceUp: row === col,
        });
      }
    }

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
        this.deck.draw(); // rimuove dal mazzo
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
}
