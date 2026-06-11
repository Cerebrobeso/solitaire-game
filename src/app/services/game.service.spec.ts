import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { DeckService } from './deck.service';
import { Card, Rank, Suit, RANKS, SUITS } from '../models/card.model';
import { TableauColumn } from '../models/tableau.model';
import { Foundation } from '../models/foundation.model';
import { DragPayload } from './drag-state.service';

function c(rank: Rank, suit: Suit, faceUp = true): Card {
  return { id: `${rank}-${suit}`, rank, suit, faceUp };
}

function col(id: number, cards: Card[]): TableauColumn {
  return { id, cards };
}

describe('GameService', () => {
  let service: GameService;
  let deck: DeckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    deck = TestBed.inject(DeckService);
  });

  function setTableau(columns: TableauColumn[]): void {
    (service as any)._tableau.set(columns);
  }

  function setFoundations(foundations: Foundation[]): void {
    (service as any)._foundations.set(foundations);
  }

  function emptyFoundations(): Foundation[] {
    return SUITS.map(suit => ({ suit, cards: [] }));
  }

  describe('dealInitial', () => {
    it('creates 7 columns', () => {
      expect(service.tableau().length).toBe(7);
    });

    it('column i has i+1 cards', () => {
      service.tableau().forEach((column, i) => {
        expect(column.cards.length).toBe(i + 1);
      });
    });

    it('only the top card of each column is face-up', () => {
      service.tableau().forEach(column => {
        column.cards.forEach((card, i) => {
          expect(card.faceUp).toBe(i === column.cards.length - 1);
        });
      });
    });

    it('leaves 24 cards in stock', () => {
      expect(deck.remaining()).toBe(24);
    });

    it('resets all foundations to empty', () => {
      service.foundations().forEach(f => expect(f.cards.length).toBe(0));
    });

    it('assigns sequential ids 0-6 to columns', () => {
      const ids = service.tableau().map(col => col.id);
      expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('canDrop', () => {
    it('allows King on empty column', () => {
      expect(service.canDrop(c('K', 'spades'), col(0, []))).toBe(true);
    });

    it('rejects non-King on empty column', () => {
      expect(service.canDrop(c('Q', 'hearts'), col(0, []))).toBe(false);
    });

    it('allows red card on black card one rank higher', () => {
      expect(service.canDrop(c('7', 'hearts'), col(0, [c('8', 'spades')]))).toBe(true);
    });

    it('allows black card on red card one rank higher', () => {
      expect(service.canDrop(c('7', 'clubs'), col(0, [c('8', 'diamonds')]))).toBe(true);
    });

    it('rejects same-color cards', () => {
      expect(service.canDrop(c('7', 'hearts'), col(0, [c('8', 'diamonds')]))).toBe(false);
    });

    it('rejects non-adjacent ranks', () => {
      expect(service.canDrop(c('6', 'hearts'), col(0, [c('8', 'spades')]))).toBe(false);
    });

    it('rejects card equal in rank', () => {
      expect(service.canDrop(c('8', 'hearts'), col(0, [c('8', 'spades')]))).toBe(false);
    });

    it('rejects drop on face-down card', () => {
      expect(service.canDrop(c('7', 'hearts'), col(0, [c('8', 'spades', false)]))).toBe(false);
    });

    it('allows Ace on 2', () => {
      expect(service.canDrop(c('A', 'hearts'), col(0, [c('2', 'spades')]))).toBe(true);
    });
  });

  describe('canDropOnFoundation', () => {
    it('allows Ace on empty matching-suit foundation', () => {
      expect(service.canDropOnFoundation(c('A', 'spades'), { suit: 'spades', cards: [] })).toBe(true);
    });

    it('rejects Ace on empty wrong-suit foundation', () => {
      expect(service.canDropOnFoundation(c('A', 'spades'), { suit: 'hearts', cards: [] })).toBe(false);
    });

    it('rejects non-Ace on empty foundation', () => {
      expect(service.canDropOnFoundation(c('2', 'spades'), { suit: 'spades', cards: [] })).toBe(false);
    });

    it('allows next rank of same suit', () => {
      const foundation: Foundation = { suit: 'spades', cards: [c('A', 'spades')] };
      expect(service.canDropOnFoundation(c('2', 'spades'), foundation)).toBe(true);
    });

    it('rejects wrong suit on non-empty foundation', () => {
      const foundation: Foundation = { suit: 'spades', cards: [c('A', 'spades')] };
      expect(service.canDropOnFoundation(c('2', 'hearts'), foundation)).toBe(false);
    });

    it('rejects non-sequential rank', () => {
      const foundation: Foundation = { suit: 'spades', cards: [c('A', 'spades')] };
      expect(service.canDropOnFoundation(c('3', 'spades'), foundation)).toBe(false);
    });

    it('allows King as last card on Queen', () => {
      const foundation: Foundation = { suit: 'hearts', cards: [c('Q', 'hearts')] };
      expect(service.canDropOnFoundation(c('K', 'hearts'), foundation)).toBe(true);
    });
  });

  describe('moveCard', () => {
    describe('from stock (sourceColumnId -1)', () => {
      it('adds the card to the target column face-up', () => {
        const topCard = deck.cards()[deck.cards().length - 1];
        setTableau([col(0, [])]);

        service.moveCard({ card: topCard, sourceColumnId: -1, cardIndexInColumn: 0 }, 0);

        expect(service.tableau()[0].cards.length).toBe(1);
        expect(service.tableau()[0].cards[0].faceUp).toBe(true);
      });

      it('decrements the stock', () => {
        const topCard = deck.cards()[deck.cards().length - 1];
        const countBefore = deck.remaining();
        setTableau([col(0, [])]);

        service.moveCard({ card: topCard, sourceColumnId: -1, cardIndexInColumn: 0 }, 0);

        expect(deck.remaining()).toBe(countBefore - 1);
      });
    });

    describe('from waste (sourceColumnId -2)', () => {
      it('pops the waste card and adds it to the target column face-up', () => {
        deck.drawToWaste();
        const wasteCard = deck.topWaste()!;
        setTableau([col(0, [])]);

        service.moveCard({ card: wasteCard, sourceColumnId: -2, cardIndexInColumn: 0 }, 0);

        expect(deck.waste().length).toBe(0);
        expect(service.tableau()[0].cards[0].id).toBe(wasteCard.id);
        expect(service.tableau()[0].cards[0].faceUp).toBe(true);
      });
    });

    describe('from foundation (sourceColumnId -3)', () => {
      it('removes top card from the matching foundation and adds to target column', () => {
        const foundationCard = c('A', 'spades');
        setFoundations([
          { suit: 'spades', cards: [foundationCard] },
          { suit: 'hearts', cards: [] },
          { suit: 'diamonds', cards: [] },
          { suit: 'clubs', cards: [] },
        ]);
        setTableau([col(0, [])]);

        service.moveCard({ card: foundationCard, sourceColumnId: -3, cardIndexInColumn: 0 }, 0);

        expect(service.foundations()[0].cards.length).toBe(0);
        expect(service.tableau()[0].cards.length).toBe(1);
        expect(service.tableau()[0].cards[0].faceUp).toBe(true);
      });
    });

    describe('from tableau', () => {
      it('moves a single card from source to target', () => {
        const movingCard = c('7', 'hearts');
        setTableau([col(0, [c('9', 'clubs', false), movingCard]), col(1, [c('8', 'spades')])]);

        service.moveCard({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 1 }, 1);

        expect(service.tableau()[0].cards.length).toBe(1);
        expect(service.tableau()[1].cards.length).toBe(2);
        expect(service.tableau()[1].cards[1].id).toBe(movingCard.id);
      });

      it('moved card is face-up in the target column', () => {
        const movingCard = c('7', 'hearts');
        setTableau([col(0, [movingCard]), col(1, [c('8', 'spades')])]);

        service.moveCard({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 0 }, 1);

        expect(service.tableau()[1].cards[1].faceUp).toBe(true);
      });

      it('moves an entire sequence starting from the dragged card', () => {
        const seq1 = c('7', 'hearts');
        const seq2 = c('6', 'spades');
        setTableau([col(0, [c('9', 'clubs', false), seq1, seq2]), col(1, [c('8', 'spades')])]);

        service.moveCard({ card: seq1, sourceColumnId: 0, cardIndexInColumn: 1 }, 1);

        expect(service.tableau()[0].cards.length).toBe(1);
        expect(service.tableau()[1].cards.length).toBe(3);
        expect(service.tableau()[1].cards[1].id).toBe(seq1.id);
        expect(service.tableau()[1].cards[2].id).toBe(seq2.id);
      });

      it('auto-flips newly exposed face-down card', () => {
        const hiddenCard = c('9', 'clubs', false);
        const movingCard = c('7', 'hearts');
        setTableau([col(0, [hiddenCard, movingCard]), col(1, [c('8', 'spades')])]);

        service.moveCard({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 1 }, 1);

        expect(service.tableau()[0].cards[0].faceUp).toBe(true);
      });

      it('does not flip card that is already face-up', () => {
        const topCard = c('9', 'clubs');
        const movingCard = c('7', 'hearts');
        setTableau([col(0, [topCard, movingCard]), col(1, [c('8', 'spades')])]);

        service.moveCard({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 1 }, 1);

        expect(service.tableau()[0].cards[0].faceUp).toBe(true);
      });

      it('ignores same-column move', () => {
        const movingCard = c('7', 'hearts');
        setTableau([col(0, [c('9', 'clubs', false), movingCard])]);

        service.moveCard({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 1 }, 0);

        expect(service.tableau()[0].cards.length).toBe(2);
      });
    });
  });

  describe('moveToFoundation', () => {
    it('from waste: pops waste and adds card to foundation', () => {
      deck.drawToWaste();
      const wasteCard = deck.topWaste()!;
      setFoundations(emptyFoundations());

      service.moveToFoundation({ card: wasteCard, sourceColumnId: -2, cardIndexInColumn: 0 }, 0);

      expect(deck.waste().length).toBe(0);
      expect(service.foundations()[0].cards.length).toBe(1);
      expect(service.foundations()[0].cards[0].faceUp).toBe(true);
    });

    it('from tableau: removes top card and adds to foundation', () => {
      const movingCard = c('A', 'spades');
      setTableau([col(0, [movingCard])]);
      setFoundations(emptyFoundations());

      service.moveToFoundation({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 0 }, 0);

      expect(service.tableau()[0].cards.length).toBe(0);
      expect(service.foundations()[0].cards.length).toBe(1);
      expect(service.foundations()[0].cards[0].faceUp).toBe(true);
    });

    it('from tableau: auto-flips newly exposed face-down card', () => {
      const hiddenCard = c('2', 'spades', false);
      const movingCard = c('A', 'spades');
      setTableau([col(0, [hiddenCard, movingCard])]);
      setFoundations(emptyFoundations());

      service.moveToFoundation({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 1 }, 0);

      expect(service.tableau()[0].cards[0].faceUp).toBe(true);
    });

    it('adds card with faceUp true regardless of original state', () => {
      const movingCard = c('A', 'spades', false);
      setTableau([col(0, [movingCard])]);
      setFoundations(emptyFoundations());

      service.moveToFoundation({ card: movingCard, sourceColumnId: 0, cardIndexInColumn: 0 }, 0);

      expect(service.foundations()[0].cards[0].faceUp).toBe(true);
    });
  });

  describe('hasWon', () => {
    it('is false after initial deal', () => {
      expect(service.hasWon()).toBe(false);
    });

    it('is true when all foundations have 13 cards', () => {
      setFoundations(
        SUITS.map(suit => ({
          suit,
          cards: RANKS.map(rank => c(rank, suit)),
        }))
      );
      expect(service.hasWon()).toBe(true);
    });

    it('is false when only some foundations are complete', () => {
      setFoundations(
        SUITS.map((suit, i) => ({
          suit,
          cards: i < 3 ? RANKS.map(rank => c(rank, suit)) : [],
        }))
      );
      expect(service.hasWon()).toBe(false);
    });
  });

  describe('computed IDs', () => {
    it('foundationIds contains all 4 suits with prefix', () => {
      expect(service.foundationIds()).toEqual([
        'foundation-spades',
        'foundation-hearts',
        'foundation-diamonds',
        'foundation-clubs',
      ]);
    });

    it('tableauIds has 7 entries after deal', () => {
      expect(service.tableauIds().length).toBe(7);
    });

    it('tableauIds are string column ids', () => {
      expect(service.tableauIds()).toEqual(['0', '1', '2', '3', '4', '5', '6']);
    });

    it('columnIds starts with waste', () => {
      expect(service.columnIds()[0]).toBe('waste');
    });

    it('columnIds includes all foundation ids', () => {
      const colIds = service.columnIds();
      service.foundationIds().forEach(fId => expect(colIds).toContain(fId));
    });

    it('columnIds includes all tableau ids', () => {
      const colIds = service.columnIds();
      service.tableauIds().forEach(tId => expect(colIds).toContain(tId));
    });
  });
});
