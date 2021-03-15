import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectDirectoryComponent } from './select-directory.component';

describe('SelectDirectoryComponent', () => {
  let component: SelectDirectoryComponent;
  let fixture: ComponentFixture<SelectDirectoryComponent>;

  beforeEach(async(() => {
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
