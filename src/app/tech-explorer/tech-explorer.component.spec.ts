import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechExplorerComponent } from './tech-explorer.component';

describe('TechExplorerComponent', () => {
  let component: TechExplorerComponent;
  let fixture: ComponentFixture<TechExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechExplorerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
