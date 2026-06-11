import { TestBed } from '@angular/core/testing';
import { DragStateService, DragPayload } from './drag-state.service';
import { Card } from '../models/card.model';

describe('DragStateService', () => {
  let service: DragStateService;

  const mockCard: Card = { id: 'A-spades', suit: 'spades', rank: 'A', faceUp: true };
  const mockPayload: DragPayload = { card: mockCard, sourceColumnId: 0, cardIndexInColumn: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragStateService);
  });

  it('dragging is null initially', () => {
    expect(service.dragging()).toBeNull();
  });

  it('startDrag sets the drag payload', () => {
    service.startDrag(mockPayload);
    expect(service.dragging()).toEqual(mockPayload);
  });

  it('endDrag clears the payload', () => {
    service.startDrag(mockPayload);
    service.endDrag();
    expect(service.dragging()).toBeNull();
  });

  it('startDrag overwrites a previous payload', () => {
    const otherCard: Card = { id: 'K-hearts', suit: 'hearts', rank: 'K', faceUp: true };
    const otherPayload: DragPayload = { card: otherCard, sourceColumnId: 1, cardIndexInColumn: 3 };

    service.startDrag(mockPayload);
    service.startDrag(otherPayload);
    expect(service.dragging()?.card.id).toBe('K-hearts');
  });
});
