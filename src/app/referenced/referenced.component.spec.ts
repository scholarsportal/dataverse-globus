import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferencedComponent } from './referenced.component';

describe('ReferencedComponent', () => {
  let component: ReferencedComponent;
  let fixture: ComponentFixture<ReferencedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferencedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferencedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
