import { isRedSuit, RANK_ORDER, SUITS, RANKS } from './card.model';

describe('card.model', () => {
  describe('isRedSuit', () => {
    it('returns true for hearts', () => {
      expect(isRedSuit('hearts')).toBe(true);
    });

    it('returns true for diamonds', () => {
      expect(isRedSuit('diamonds')).toBe(true);
    });

    it('returns false for spades', () => {
      expect(isRedSuit('spades')).toBe(false);
    });

    it('returns false for clubs', () => {
      expect(isRedSuit('clubs')).toBe(false);
    });
  });

  describe('RANK_ORDER', () => {
    it('assigns 1 to Ace', () => {
      expect(RANK_ORDER['A']).toBe(1);
    });

    it('assigns 13 to King', () => {
      expect(RANK_ORDER['K']).toBe(13);
    });

    it('has sequential values matching RANKS order', () => {
      RANKS.forEach((rank, i) => {
        expect(RANK_ORDER[rank]).toBe(i + 1);
      });
    });
  });

  describe('SUITS', () => {
    it('contains exactly 4 suits', () => {
      expect(SUITS.length).toBe(4);
    });
  });

  describe('RANKS', () => {
    it('contains exactly 13 ranks', () => {
      expect(RANKS.length).toBe(13);
    });
  });
});
