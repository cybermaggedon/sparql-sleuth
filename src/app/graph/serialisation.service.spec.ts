import { TestBed } from '@angular/core/testing';

import { SerialisationService } from './serialisation.service';

describe('SerialisationService', () => {
  let service: SerialisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerialisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
