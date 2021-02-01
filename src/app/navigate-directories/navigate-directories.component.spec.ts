import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigateDirectoriesComponent } from './navigate-directories.component';

describe('NavigateDirectoriesComponent', () => {
  let component: NavigateDirectoriesComponent;
  let fixture: ComponentFixture<NavigateDirectoriesComponent>;

  beforeEach(async(() => {
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
