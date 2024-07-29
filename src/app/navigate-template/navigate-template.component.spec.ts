import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavigateTemplateComponent } from './navigate-template.component';

describe('NavigateTemplateComponent', () => {
  let component: NavigateTemplateComponent;
  let fixture: ComponentFixture<NavigateTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigateTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigateTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
