import {Component, computed, inject, input} from '@angular/core';
import {CardComponent} from '../card/card';
import {GameService} from '../../services/game.service';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {SUIT_SYMBOLS} from '../../models/card.model';

@Component({
  selector: 'app-foundation-pile',
  standalone: true,
  imports: [CardComponent, CdkDropList, CdkDrag],
  templateUrl: './foundation-pile.html'
})
export class FoundationPileComponent {
  index = input.required<number>();

  private gameService = inject(GameService);

  protected foundation = computed(() => this.gameService.foundations()[this.index()]);
  protected topCard = computed(() => this.foundation().cards.at(-1) ?? null);
  protected suitSymbol = computed(() => SUIT_SYMBOLS[this.foundation().suit]);
  protected connectedTo = this.gameService.tableauIds;

  protected canEnter = (drag: CdkDrag) =>
    this.gameService.canDropOnFoundation(drag.data, this.foundation());

  protected onDrop(event: CdkDragDrop<number>): void {
    const prevId = event.previousContainer.id;
    const sourceId = prevId === 'waste' ? -2
      : prevId.startsWith('foundation-') ? -3
      : Number(prevId);
    this.gameService.moveToFoundation(
      { card: event.item.data, sourceColumnId: sourceId, cardIndexInColumn: event.previousIndex },
      this.index()
    );
  }
}
