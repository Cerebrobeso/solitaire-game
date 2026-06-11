import { Injectable, signal } from '@angular/core';
import { Card } from '../models/card.model';

export interface DragPayload {
  card: Card;
  sourceColumnId: number;
  cardIndexInColumn: number;
}

@Injectable({ providedIn: 'root' })
export class DragStateService {
  private readonly _dragging = signal<DragPayload | null>(null);
  readonly dragging = this._dragging.asReadonly();

  startDrag(payload: DragPayload): void {
    this._dragging.set(payload);
  }

  endDrag(): void {
    this._dragging.set(null);
  }
}
