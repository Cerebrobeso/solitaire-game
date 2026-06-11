import {Component, computed, inject, input, signal} from '@angular/core';
import {TableauColumn} from '../../models/tableau.model';
import {CardComponent} from '../card/card';
import {GameService} from '../../services/game.service';
import {CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tableau-column',
  imports: [
    CardComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPreview
  ],
  templateUrl: './tableau-column.html',
  styleUrl: './tableau-column.css'
})
export class TableauColumnComponent {
  column = input.required<TableauColumn>();

  private gameService = inject(GameService);

  protected connectedTo = this.gameService.columnIds;

  protected canEnter = (drag: CdkDrag) => {
    const col = this.gameService.tableau().find(c => c.id ===
      this.column().id);
    return col ? this.gameService.canDrop(drag.data, col) : false;
  };

  protected onDrop(event: CdkDragDrop<number>): void {
    this.isHovered.set(false);
    if (event.previousContainer === event.container) return;
    const sourceId = event.previousContainer.id === 'stock' ? -1 :
                     Number(event.previousContainer.id);
    const droppedCard = event.item.data;
    this.gameService.moveCard(
      {
        card: droppedCard,
        sourceColumnId: sourceId,
        cardIndexInColumn: event.previousIndex
      },
      this.column().id
    );
  }

  protected isHovered = signal(false);

  protected onEntered(): void { this.isHovered.set(true); }
  protected onExited(): void { this.isHovered.set(false); }

  private draggedCardId = signal<string | null>(null);

  private dragStartIndex = computed(() => {
    const id = this.draggedCardId();
    if (!id) return -1;
    return this.column().cards.findIndex(c => c.id === id);
  });

  protected isHiddenByDrag(cardIndex: number): boolean {
    const dragIndex = this.dragStartIndex();
    return dragIndex !== -1 && cardIndex > dragIndex;
  }

  protected onDragStarted(cardId: string): void { this.draggedCardId.set(cardId); }
  protected onDragEnded(): void { this.draggedCardId.set(null); }

}
