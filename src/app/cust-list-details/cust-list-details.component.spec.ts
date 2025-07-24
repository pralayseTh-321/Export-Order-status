import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustListDetailsComponent } from './cust-list-details.component';

describe('CustListDetailsComponent', () => {
  let component: CustListDetailsComponent;
  let fixture: ComponentFixture<CustListDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustListDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
