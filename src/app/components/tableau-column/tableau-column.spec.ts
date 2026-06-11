import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableauColumnComponent } from './tableau-column';

describe('TableauColumnComponent', () => {
  let component: TableauColumnComponent;
  let fixture: ComponentFixture<TableauColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableauColumnComponent);
    fixture.componentRef.setInput('column', { id: 0, cards: [] });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
