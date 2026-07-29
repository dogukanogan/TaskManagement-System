import { Directive, DestroyRef, inject } from '@angular/core';
import { FlexibleConnectedPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { MatDatepicker } from '@angular/material/datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

type DatepickerWithOverlay = {
  openedStream: Observable<void>;
  _overlayRef: OverlayRef | null;
};

@Directive({
  selector: 'mat-datepicker[forceDatepickerBelow]',
  standalone: true
})
export class ForceDatepickerBelowDirective {
  private readonly datepicker = inject(MatDatepicker<Date>) as unknown as DatepickerWithOverlay;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.datepicker.openedStream
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.keepPanelBelow());
  }

  private keepPanelBelow(): void {
    const overlayRef = this.datepicker._overlayRef;
    if (!overlayRef) return;

    const strategy = overlayRef.getConfig().positionStrategy;
    if (!(strategy instanceof FlexibleConnectedPositionStrategy)) return;

    strategy.withPositions([
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
      }
    ]);
    overlayRef.updatePosition();
  }
}
