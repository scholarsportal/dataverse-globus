import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PersonalConnectComponent } from './personal-connect.component';

describe('PersonalConnectComponent', () => {
  let component: PersonalConnectComponent;
  let fixture: ComponentFixture<PersonalConnectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalConnectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
