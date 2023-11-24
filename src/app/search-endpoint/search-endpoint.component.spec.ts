import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchEndpointComponent } from './search-endpoint.component';

describe('SearchEndpointComponent', () => {
  let component: SearchEndpointComponent;
  let fixture: ComponentFixture<SearchEndpointComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchEndpointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
