import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaDialogComponent } from './schema-dialog.component';

describe('SchemaDialogComponent', () => {
  let component: SchemaDialogComponent;
  let fixture: ComponentFixture<SchemaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchemaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
