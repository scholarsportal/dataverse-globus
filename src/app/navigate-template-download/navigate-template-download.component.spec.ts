import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigateTemplateDownloadComponent } from './navigate-template-download.component';

describe('NavigateTemplateDownloadComponent', () => {
  let component: NavigateTemplateDownloadComponent;
  let fixture: ComponentFixture<NavigateTemplateDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigateTemplateDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigateTemplateDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
