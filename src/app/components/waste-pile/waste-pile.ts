import {Component, computed, inject} from '@angular/core';
import {CardComponent} from '../card/card';
import {DeckService} from '../../services/deck.service';
import {GameService} from '../../services/game.service';
import {CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-waste-pile',
  standalone: true,
  imports: [CardComponent, CdkDropList, CdkDrag],
  templateUrl: './waste-pile.html'
})
export class WastePileComponent {
  protected deck = inject(DeckService);
  private gameService = inject(GameService);

  protected connectedTo = computed(() => [
    ...this.gameService.foundationIds(),
    ...this.gameService.tableauIds(),
  ]);
}
