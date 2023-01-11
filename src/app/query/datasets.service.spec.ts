import { TestBed } from '@angular/core/testing';

import { DatasetsService } from './datasets.service';

describe('DatasetsService', () => {
  let service: DatasetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatasetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
