import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecentlyViewedComponentComponent } from './recently-viewed-component.component';

describe('RecentlyViewedComponentComponent', () => {
  let component: RecentlyViewedComponentComponent;
  let fixture: ComponentFixture<RecentlyViewedComponentComponent>;

  beforeEach(waitForAsync(() => {
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
