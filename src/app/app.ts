import { Component, inject } from '@angular/core';
import { StockPileComponent } from './components/stock-pile/stock-pile';
import { DeckService } from './services/deck.service';
import {GameService} from './services/game.service';
import {TableauColumnComponent} from './components/tableau-column/tableau-column';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StockPileComponent, TableauColumnComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected game = inject(GameService);

  protected onNewGame(): void {
    this.game.dealInitial();
  }

}
