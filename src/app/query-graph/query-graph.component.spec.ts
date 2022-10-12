import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryGraphComponent } from './query-graph.component';

describe('QueryGraphComponent', () => {
  let component: QueryGraphComponent;
  let fixture: ComponentFixture<QueryGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
