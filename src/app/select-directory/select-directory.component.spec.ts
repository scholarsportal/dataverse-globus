import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectDirectoryComponent } from './select-directory.component';

describe('SelectDirectoryComponent', () => {
  let component: SelectDirectoryComponent;
  let fixture: ComponentFixture<SelectDirectoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
