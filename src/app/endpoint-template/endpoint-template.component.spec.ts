import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndpointTemplateComponent } from './endpoint-template.component';

describe('EndpointTemplateComponent', () => {
  let component: EndpointTemplateComponent;
  let fixture: ComponentFixture<EndpointTemplateComponent>;

  beforeEach(async(() => {
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
