import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWonComponent } from './game-won.component';

describe('GameWonComponent', () => {
  let component: GameWonComponent;
  let fixture: ComponentFixture<GameWonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameWonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameWonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
