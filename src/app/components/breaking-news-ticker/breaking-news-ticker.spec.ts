import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakingNewsTicker } from './breaking-news-ticker';

describe('BreakingNewsTicker', () => {
  let component: BreakingNewsTicker;
  let fixture: ComponentFixture<BreakingNewsTicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakingNewsTicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakingNewsTicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
