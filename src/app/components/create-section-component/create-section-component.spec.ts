import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSectionComponent } from './create-section-component';

describe('CreateSectionComponent', () => {
  let component: CreateSectionComponent;
  let fixture: ComponentFixture<CreateSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
