import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepList } from './step-list';

describe('StepList', () => {
  let component: StepList;
  let fixture: ComponentFixture<StepList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
