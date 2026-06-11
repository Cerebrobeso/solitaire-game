import { Component, input, computed } from '@angular/core';
import { Card, SUIT_SYMBOLS, isRedSuit } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
})
export class CardComponent {
  card = input.required<Card>();

  protected symbol = computed(() => SUIT_SYMBOLS[this.card().suit]);
  protected isRed = computed(() => isRedSuit(this.card().suit));
  protected label = computed(() => `${this.card().rank}${SUIT_SYMBOLS[this.card().suit]}`);
}
