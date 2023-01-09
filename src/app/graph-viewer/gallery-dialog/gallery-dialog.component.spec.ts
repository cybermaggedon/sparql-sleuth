import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryDialogComponent } from './gallery-dialog.component';

describe('GalleryDialogComponent', () => {
  let component: GalleryDialogComponent;
  let fixture: ComponentFixture<GalleryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
