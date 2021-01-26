import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyViewedComponentComponent } from './recently-viewed-component.component';

describe('RecentlyViewedComponentComponent', () => {
  let component: RecentlyViewedComponentComponent;
  let fixture: ComponentFixture<RecentlyViewedComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentlyViewedComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyViewedComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
