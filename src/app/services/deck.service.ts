import { Injectable, signal, computed } from '@angular/core';
import { Card, SUITS, RANKS } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private readonly _cards = signal<Card[]>([]);

  readonly cards = this._cards.asReadonly();
  readonly remaining = computed(() => this._cards().length);

  constructor() {
    this.reset();
  }

  reset(): void {
    this._cards.set(this.createDeck());
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
}
