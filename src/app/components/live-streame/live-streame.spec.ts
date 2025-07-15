import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveStreame } from './live-streame';

describe('LiveStreame', () => {
  let component: LiveStreame;
  let fixture: ComponentFixture<LiveStreame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveStreame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveStreame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
