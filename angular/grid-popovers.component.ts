import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';

/* ── FilterPopover ─────────────────────────────────────────── */
@Component({
  selector: 'app-filter-popover',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div
      #popoverEl
      class="popover popover--filter"
      [style.top.px]="top"
      [style.left.px]="left"
      (click)="$event.stopPropagation()">

      <div class="filter-title">Filter {{ col.label }}</div>

      <!-- Multi-select (choices) -->
      <div *ngIf="col.choices; else textFilter">
        <label *ngFor="let c of col.choices">
          <input
            type="checkbox"
            [checked]="draftArr.includes(c)"
            (change)="toggleChoice(c)" />
          <span>{{ c }}</span>
        </label>
      </div>

      <!-- Text filter -->
      <ng-template #textFilter>
        <input
          class="input"
          placeholder="Contains…"
          [value]="draftText"
          (input)="draftText = $any($event.target).value"
          autofocus />
      </ng-template>

      <div class="filter-divider"></div>
      <div class="filter-actions">
        <agsup-button class="btn btn--ghost" (click)="clear()">Clear</agsup-button>
        <agsup-button class="btn btn--primary" (click)="apply()">Apply</agsup-button>
      </div>
    </div>
  `
})
export class FilterPopoverComponent implements OnInit, OnDestroy {
  @Input() col: any = {};
  @Input() filter: any = null;
  @Input() anchor: DOMRect | null = null;
  @Output() filterChange = new EventEmitter<{ key: string; value: any }>();
  @Output() closePopover = new EventEmitter<void>();

  draftArr: string[] = [];
  draftText: string = '';

  private docListener = (e: MouseEvent) => {
    const el = (this as any)._elRef?.nativeElement as HTMLElement;
    if (el && !el.contains(e.target as Node)) {
      this.closePopover.emit();
    }
  };

  constructor(private _elRef: ElementRef) {}

  ngOnInit() {
    if (this.col.choices) {
      this.draftArr = Array.isArray(this.filter) ? [...this.filter] : [];
    } else {
      this.draftText = this.filter ?? '';
    }
    setTimeout(() => document.addEventListener('mousedown', this.docListener));
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.docListener);
  }

  get top(): number {
    return this.anchor ? this.anchor.bottom + 6 : 0;
  }

  get left(): number {
    return this.anchor
      ? Math.min(this.anchor.left, window.innerWidth - 260)
      : 0;
  }

  toggleChoice(c: string) {
    if (this.draftArr.includes(c)) {
      this.draftArr = this.draftArr.filter(x => x !== c);
    } else {
      this.draftArr = [...this.draftArr, c];
    }
  }

  clear() {
    this.filterChange.emit({
      key: this.col.key,
      value: this.col.choices ? [] : ''
    });
    this.closePopover.emit();
  }

  apply() {
    this.filterChange.emit({
      key: this.col.key,
      value: this.col.choices ? this.draftArr : this.draftText
    });
    this.closePopover.emit();
  }
}

/* ── RowActionMenu ─────────────────────────────────────────── */
@Component({
  selector: 'app-row-action-menu',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div
      #menuEl
      class="popover"
      [style.top.px]="top"
      [style.left.px]="left"
      style="min-width: 200px">

      <agsup-button class="popover__item" (click)="emit('view')">
        View details
      </agsup-button>

      <agsup-button class="popover__item" (click)="emit('edit')">
        Edit ticket
      </agsup-button>

      <div class="popover__divider"></div>

      <agsup-button
        class="popover__item popover__item--danger"
        (click)="emit('cancel')"
        [attr.aria-disabled]="row?.status === 'Closed'"
        [disabled]="row?.status === 'Closed'">
        Cancel ticket
      </agsup-button>
    </div>
  `
})
export class RowActionMenuComponent implements OnInit, OnDestroy {
  @Input() anchor: DOMRect | null = null;
  @Input() row: any = null;
  @Output() closeMenu = new EventEmitter<void>();
  @Output() action = new EventEmitter<{ action: string; row: any }>();

  private docListener = (e: MouseEvent) => {
    const el = (this as any)._elRef?.nativeElement as HTMLElement;
    if (el && !el.contains(e.target as Node)) this.closeMenu.emit();
  };

  private keyListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeMenu.emit();
  };

  constructor(private _elRef: ElementRef) {}

  ngOnInit() {
    document.addEventListener('mousedown', this.docListener);
    document.addEventListener('keydown', this.keyListener);
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.docListener);
    document.removeEventListener('keydown', this.keyListener);
  }

  get top(): number {
    return this.anchor ? this.anchor.bottom + 4 : 0;
  }

  get left(): number {
    return this.anchor
      ? Math.min(this.anchor.right - 200, window.innerWidth - 200)
      : 0;
  }

  emit(action: string) {
    this.action.emit({ action, row: this.row });
    this.closeMenu.emit();
  }
}
