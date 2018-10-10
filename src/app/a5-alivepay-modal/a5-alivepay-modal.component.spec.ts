import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { A5AlivepayModalComponent } from './a5-alivepay-modal.component';

describe('A5AlivepayModalComponent', () => {
  let component: A5AlivepayModalComponent;
  let fixture: ComponentFixture<A5AlivepayModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ A5AlivepayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(A5AlivepayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
