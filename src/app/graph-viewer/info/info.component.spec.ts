import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpInfoComponent } from './help-info.component';

describe('HelpInfoComponent', () => {
  let component: HelpInfoComponent;
  let fixture: ComponentFixture<HelpInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
