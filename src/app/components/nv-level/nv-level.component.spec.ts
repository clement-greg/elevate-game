import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NvLevelComponent } from './nv-level.component';

describe('NvLevelComponent', () => {
  let component: NvLevelComponent;
  let fixture: ComponentFixture<NvLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NvLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NvLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
