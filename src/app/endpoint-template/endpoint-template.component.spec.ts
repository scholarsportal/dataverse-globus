import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EndpointTemplateComponent } from './endpoint-template.component';

describe('EndpointTemplateComponent', () => {
  let component: EndpointTemplateComponent;
  let fixture: ComponentFixture<EndpointTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EndpointTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
