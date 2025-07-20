import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingNewsComponent } from './pending-news-component';

describe('PendingNewsComponent', () => {
  let component: PendingNewsComponent;
  let fixture: ComponentFixture<PendingNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingNewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
