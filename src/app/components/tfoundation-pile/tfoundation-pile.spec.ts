import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TfoundationPile } from './tfoundation-pile';

describe('TfoundationPile', () => {
  let component: TfoundationPile;
  let fixture: ComponentFixture<TfoundationPile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TfoundationPile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TfoundationPile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
