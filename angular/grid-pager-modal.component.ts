import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCellComponent, PriorityPillComponent, DateCellComponent } from './grid-cells.component';

/* ── Pager ─────────────────────────────────────────────────── */
@Component({
  selector: 'app-pager',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="k-pager" aria-label="Pagination">

      <div class="k-pager-sizes">
        <span class="k-pager-select">
          <select
            [value]="pageSize"
            (change)="onPageSizeChange($any($event.target).value)"
            aria-label="Items per page">
            <option *ngFor="let n of pageSizeOptions" [value]="n">{{ n }}</option>
          </select>
        </span>
        <span class="k-pager-sizes-label">items per page</span>
      </div>

      <div class="k-pager-info">{{ startIdx }}–{{ endIdx }} of {{ total }}</div>

      <nav class="k-pager-nav" aria-label="Pagination">
        <agsup-button
          class="k-pager-btn k-pager-arrow"
          (click)="pageChange.emit(page - 1)"
          [disabled]="page === 1"
          aria-label="Previous page">
          &#8249;
        </agsup-button>

        <ng-container *ngFor="let p of pages; let i = index">
          <span *ngIf="p === '…'" class="k-pager-ellipsis">…</span>
          <agsup-button
            *ngIf="p !== '…'"
            [class]="'k-pager-btn' + (p === page ? ' is-selected' : '')"
            (click)="pageChange.emit(p)"
            [attr.aria-label]="'Page ' + p"
            [attr.aria-current]="p === page ? 'page' : null">
            {{ p }}
          </agsup-button>
        </ng-container>

        <agsup-button
          class="k-pager-btn k-pager-arrow"
          (click)="pageChange.emit(page + 1)"
          [disabled]="page >= pageCount"
          aria-label="Next page">
          &#8250;
        </agsup-button>
      </nav>

    </div>
  `
})
export class PagerComponent {
  @Input() page: number = 1;
  @Input() pageCount: number = 1;
  @Input() pageSize: number = 10;
  @Input() total: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  pageSizeOptions = [5, 10, 20, 50];

  get startIdx(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endIdx(): number {
    return Math.min(this.total, this.page * this.pageSize);
  }

  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= this.pageCount; i++) {
      if (i === 1 || i === this.pageCount ||
          (i >= this.page - 1 && i <= this.page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }
    return pages;
  }

  onPageSizeChange(val: string) {
    this.pageSizeChange.emit(Number(val));
  }
}

/* ── ViewTicketModal ───────────────────────────────────────── */
@Component({
  selector: 'app-view-ticket-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, StatusCellComponent, PriorityPillComponent, DateCellComponent],
  template: `
    <div
      class="modal-overlay"
      (mousedown)="onOverlayClick($event)">
      <div
        class="modal modal--ticket-view"
        role="dialog"
        aria-labelledby="view-ticket-title">

        <div class="modal__head">
          <div>
            <h2 class="modal__title" id="view-ticket-title">Ticket Details</h2>
          </div>
          <agsup-button class="modal__close" (click)="close.emit()" aria-label="Close dialog">
            &#x2715;
          </agsup-button>
        </div>

        <div class="modal__body">
          <div class="review">
            <dl>
              <dt>Ticket ID:</dt><dd>{{ ticket.id }}</dd>
              <dt>Type:</dt><dd>{{ ticket.type }}</dd>
              <dt>Status:</dt>
              <dd><app-status-cell [value]="ticket.status"></app-status-cell></dd>
              <dt>Priority:</dt>
              <dd><app-priority-pill [value]="ticket.priority"></app-priority-pill></dd>
              <ng-container *ngIf="multiPlan">
                <dt>Plan:</dt><dd>{{ ticket.plan || '—' }}</dd>
              </ng-container>
              <dt>Submitted by:</dt><dd>{{ ticket.submitter }}</dd>
              <dt>Date:</dt>
              <dd><app-date-cell [iso]="ticket.date"></app-date-cell></dd>
            </dl>
          </div>
        </div>

        <div class="modal__foot">
          <agsup-button class="btn btn--primary modal__foot--full" (click)="close.emit()">
            Close
          </agsup-button>
        </div>

      </div>
    </div>
  `
})
export class ViewTicketModalComponent implements OnInit, OnDestroy {
  @Input() ticket: any = {};
  @Input() multiPlan: boolean = false;
  @Output() close = new EventEmitter<void>();

  private keyListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close.emit();
  };

  ngOnInit() {
    document.addEventListener('keydown', this.keyListener);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyListener);
  }

  onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }
}
