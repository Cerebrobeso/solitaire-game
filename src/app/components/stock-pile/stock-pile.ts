import {Component, computed, inject} from '@angular/core';
import {CardComponent} from '../card/card';
import {DeckService} from '../../services/deck.service';
import {LucideRotateCcw} from '@lucide/angular';

@Component({
  selector: 'app-stock-pile',
  standalone: true,
  imports: [CardComponent, LucideRotateCcw],
  templateUrl: './stock-pile.html'
})
export class StockPileComponent {
  protected deck = inject(DeckService);

  protected topCard = computed(() => {
    const cards = this.deck.cards();
    return cards.length > 0 ? cards[cards.length - 1] : null;
  });

  protected onDraw(): void {
    if (this.deck.cards().length > 0) {
      this.deck.drawToWaste();
    } else {
      this.deck.recycleWaste();
    }
  }
}