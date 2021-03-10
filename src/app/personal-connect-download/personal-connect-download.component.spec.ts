import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalConnectDownloadComponent } from './personal-connect-download.component';

describe('PersonalConnectDownloadComponent', () => {
  let component: PersonalConnectDownloadComponent;
  let fixture: ComponentFixture<PersonalConnectDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalConnectDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalConnectDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
