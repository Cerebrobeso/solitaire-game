import { Component, inject } from '@angular/core';
import { StockPileComponent } from './components/stock-pile/stock-pile';
import { DeckService } from './services/deck.service';
import {GameService} from './services/game.service';
import {TableauColumnComponent} from './components/tableau-column/tableau-column';
import {WastePileComponent} from './components/waste-pile/waste-pile';
import {FoundationPileComponent} from './components/foundation-pile/foundation-pile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockPileComponent, TableauColumnComponent, WastePileComponent, FoundationPileComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected game = inject(GameService);
  protected foundationIndices = [0, 1, 2, 3];

  protected onNewGame(): void {
    this.game.dealInitial();
  }

}
