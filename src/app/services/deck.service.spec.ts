import { TestBed } from '@angular/core/testing';
import { DeckService } from './deck.service';

describe('DeckService', () => {
  let service: DeckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeckService);
  });

  describe('initial state (after reset)', () => {
    it('creates 52 cards', () => {
      expect(service.cards().length).toBe(52);
    });

    it('all stock cards are face-down', () => {
      expect(service.cards().every(c => !c.faceUp)).toBe(true);
    });

    it('waste is empty', () => {
      expect(service.waste().length).toBe(0);
    });

    it('remaining equals 52', () => {
      expect(service.remaining()).toBe(52);
    });

    it('topWaste is null', () => {
      expect(service.topWaste()).toBeNull();
    });
  });

  describe('reset', () => {
    it('restores 52 cards after drawing some', () => {
      service.draw();
      service.draw();
      service.reset();
      expect(service.cards().length).toBe(52);
    });

    it('clears the waste pile', () => {
      service.drawToWaste();
      service.reset();
      expect(service.waste().length).toBe(0);
    });

    it('all cards are face-down after reset', () => {
      service.flipTop();
      service.reset();
      expect(service.cards().every(c => !c.faceUp)).toBe(true);
    });

    it('generates unique card ids', () => {
      const ids = service.cards().map(c => c.id);
      expect(new Set(ids).size).toBe(52);
    });
  });

  describe('shuffle', () => {
    it('keeps 52 cards after shuffle', () => {
      service.shuffle();
      expect(service.cards().length).toBe(52);
    });

    it('preserves all card ids after shuffle', () => {
      const before = new Set(service.cards().map(c => c.id));
      service.shuffle();
      const after = new Set(service.cards().map(c => c.id));
      expect(after).toEqual(before);
    });

    it('changes card order', () => {
      const before = service.cards().map(c => c.id).join(',');
      service.shuffle();
      const after = service.cards().map(c => c.id).join(',');
      expect(before).not.toBe(after);
    });
  });

  describe('draw', () => {
    it('returns the top card', () => {
      const top = service.cards()[service.cards().length - 1];
      const drawn = service.draw();
      expect(drawn?.id).toBe(top.id);
    });

    it('removes the card from the deck', () => {
      service.draw();
      expect(service.cards().length).toBe(51);
    });

    it('returns undefined when deck is empty', () => {
      while (service.cards().length > 0) service.draw();
      expect(service.draw()).toBeUndefined();
    });

    it('decrements remaining', () => {
      service.draw();
      expect(service.remaining()).toBe(51);
    });
  });

  describe('flipTop', () => {
    it('toggles top card from face-down to face-up', () => {
      service.flipTop();
      expect(service.cards()[service.cards().length - 1].faceUp).toBe(true);
    });

    it('toggles top card back to face-down', () => {
      service.flipTop();
      service.flipTop();
      expect(service.cards()[service.cards().length - 1].faceUp).toBe(false);
    });

    it('does nothing on empty deck', () => {
      while (service.cards().length > 0) service.draw();
      expect(() => service.flipTop()).not.toThrow();
    });
  });

  describe('drawToWaste', () => {
    it('moves top card from stock to waste', () => {
      const top = service.cards()[service.cards().length - 1];
      service.drawToWaste();
      expect(service.waste()[0].id).toBe(top.id);
    });

    it('decrements stock by 1', () => {
      service.drawToWaste();
      expect(service.cards().length).toBe(51);
    });

    it('increments waste by 1', () => {
      service.drawToWaste();
      expect(service.waste().length).toBe(1);
    });

    it('drawn card is face-up in waste', () => {
      service.drawToWaste();
      expect(service.topWaste()?.faceUp).toBe(true);
    });

    it('topWaste reflects last drawn card', () => {
      service.drawToWaste();
      service.drawToWaste();
      expect(service.topWaste()?.id).toBe(service.waste()[1].id);
    });

    it('does nothing when stock is empty', () => {
      while (service.cards().length > 0) service.draw();
      service.drawToWaste();
      expect(service.waste().length).toBe(0);
    });
  });

  describe('recycleWaste', () => {
    it('moves waste cards back to stock', () => {
      service.drawToWaste();
      service.drawToWaste();
      service.recycleWaste();
      expect(service.cards().length).toBe(2);
      expect(service.waste().length).toBe(0);
    });

    it('recycled cards are face-down', () => {
      service.drawToWaste();
      service.recycleWaste();
      expect(service.cards().every(c => !c.faceUp)).toBe(true);
    });

    it('reverses waste order so first drawn becomes new top', () => {
      service.drawToWaste();
      service.drawToWaste();
      const firstDrawnId = service.waste()[0].id;
      service.recycleWaste();
      expect(service.cards()[service.cards().length - 1].id).toBe(firstDrawnId);
    });

    it('does nothing when waste is empty', () => {
      const countBefore = service.cards().length;
      service.recycleWaste();
      expect(service.cards().length).toBe(countBefore);
    });
  });

  describe('popFromWaste', () => {
    it('removes the top waste card', () => {
      service.drawToWaste();
      service.drawToWaste();
      service.popFromWaste();
      expect(service.waste().length).toBe(1);
    });

    it('does not affect stock', () => {
      service.drawToWaste();
      const stockCount = service.cards().length;
      service.popFromWaste();
      expect(service.cards().length).toBe(stockCount);
    });

    it('topWaste updates after pop', () => {
      service.drawToWaste();
      service.drawToWaste();
      const secondCard = service.waste()[0].id;
      service.popFromWaste();
      expect(service.topWaste()?.id).toBe(secondCard);
    });
  });
});
