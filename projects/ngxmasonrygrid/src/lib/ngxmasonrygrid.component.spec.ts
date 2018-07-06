import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxmasonrygridComponent } from './ngxmasonrygrid.component';

describe('NgxmasonrygridComponent', () => {
  let component: NgxmasonrygridComponent;
  let fixture: ComponentFixture<NgxmasonrygridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxmasonrygridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxmasonrygridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
