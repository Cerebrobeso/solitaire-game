import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableauColumn } from './tableau-column';

describe('TableauColumn', () => {
  let component: TableauColumn;
  let fixture: ComponentFixture<TableauColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableauColumn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableauColumn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
