import { TestBed, inject } from '@angular/core/testing';

import { NgxmasonrygridService } from './ngxmasonrygrid.service';

describe('NgxmasonrygridService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxmasonrygridService]
    });
  });

  it('should be created', inject([NgxmasonrygridService], (service: NgxmasonrygridService) => {
    expect(service).toBeTruthy();
  }));
});
