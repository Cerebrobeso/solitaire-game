import {Component, computed, inject, signal} from '@angular/core';
import {CardComponent} from '../card/card';
import {DeckService} from '../../services/deck.service';
import {CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';
import {GameService} from '../../services/game.service';
import {LucideRotateCcw} from '@lucide/angular';

@Component({
  selector: 'app-stock-pile',
  standalone: true,
  imports: [CardComponent, CdkDropList, CdkDrag, LucideRotateCcw],
  templateUrl: './stock-pile.html'
})
export class StockPileComponent {
  protected deck = inject(DeckService);
  private gameService = inject(GameService);

  protected connectedTo = this.gameService.columnIds;
  protected isDragging = signal(false);

  protected topCard = computed(() => {
    const cards = this.deck.cards();
    return cards.length > 0 ? cards[cards.length - 1] : null;
  });

  protected onFlip(): void {
    if ( this.topCard()?.faceUp ) {
      return;
    }
    this.deck.flipTop();
  }
}
