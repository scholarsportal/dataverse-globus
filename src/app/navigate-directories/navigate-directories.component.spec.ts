import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NavigateDirectoriesComponent } from './navigate-directories.component';

describe('NavigateDirectoriesComponent', () => {
  let component: NavigateDirectoriesComponent;
  let fixture: ComponentFixture<NavigateDirectoriesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigateDirectoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigateDirectoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
