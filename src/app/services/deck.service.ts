import { Injectable, signal, computed } from '@angular/core';
import { Card, SUITS, RANKS } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class DeckService {
  // DECK CARDS
  private readonly _cards = signal<Card[]>([]);

  readonly cards = this._cards.asReadonly();
  readonly remaining = computed(() => this._cards().length);

  // WASTE CARDS
  private readonly _waste = signal<Card[]>([]);
  readonly waste = this._waste.asReadonly();
  readonly topWaste = computed(() => {
    const waste = this._waste();
    return waste.length > 0 ? waste[waste.length - 1] : null;
  });

  constructor() {
    this.reset();
  }

  reset(): void {
    this._cards.set(this.createDeck());
    this._waste.set([]);
  }

  shuffle(): void {
    this._cards.update(cards => this.fisherYates([...cards]));
  }

  draw(): Card | undefined {
    let drawn: Card | undefined;
    this._cards.update(cards => {
      if (cards.length === 0) return cards;
      const copy = [...cards];
      drawn = copy.pop();
      return copy;
    });
    return drawn;
  }

  flipTop(): void {
    this._cards.update(cards => {
      if (cards.length === 0) return cards;
      const copy = [...cards];
      const top = copy[copy.length - 1];
      copy[copy.length - 1] = { ...top, faceUp: !top.faceUp };
      return copy;
    });
  }

  private createDeck(): Card[] {
    return SUITS.flatMap(suit =>
      RANKS.map(rank => ({
        id: `${rank}-${suit}`,
        suit,
        rank,
        faceUp: false,
      }))
    );
  }

  private fisherYates(cards: Card[]): Card[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  drawToWaste(): void {
    let drawn: Card | undefined;
    this._cards.update(cards => {
      if (cards.length === 0) return cards;
      const copy = [...cards];
      drawn = copy.pop();
      return copy;
    });
    if (drawn) {
      this._waste.update(w => [...w, { ...drawn!, faceUp: true }]);
    }
  }

  recycleWaste(): void {
    const waste = this._waste();
    if (!waste.length) return;
    this._cards.set([...waste].reverse().map(c => ({ ...c, faceUp: false })));
    this._waste.set([]);
  }

  popFromWaste(): void {
    this._waste.update(w => w.slice(0, -1));
  }
}
