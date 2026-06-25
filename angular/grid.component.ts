import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from './modal.component';

/* ── Column definition ─────────────────────────────────────── */
export interface GridColumn {
  key: string;
  label: string;
  width: number;
  filterable: boolean;
  sortable?: boolean;
  choices?: string[];
}

/* ── StatusCell ────────────────────────────────────────────── */
@Component({
  selector: 'app-status-cell',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <span [class]="'status ' + cls">
      <span class="status__dot"></span>{{ value }}
    </span>
  `
})
export class StatusCellComponent {
  @Input() value: string = '';
  get cls(): string {
    const map: Record<string, string> = {
      'In Progress':      'status--inprogress',
      'Ticket Submitted': 'status--submitted',
      'Closed':           'status--closed',
      'On Hold':          'status--submitted'
    };
    return map[this.value] || 'status--submitted';
  }
}

/* ── PriorityPill ──────────────────────────────────────────── */
@Component({
  selector: 'app-priority-pill',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<span [class]="'pill ' + cls">{{ label }}</span>`
})
export class PriorityPillComponent {
  @Input() value: string = '';
  get assigned() { return this.value === 'High' || this.value === 'Medium' || this.value === 'Low'; }
  get label()    { return this.assigned ? this.value : 'Not Assigned'; }
  get cls(): string {
    return this.value === 'High' ? 'pill--high' : this.value === 'Medium' ? 'pill--medium' : 'pill--low';
  }
}

/* ── DateCell ──────────────────────────────────────────────── */
@Component({
  selector: 'app-date-cell',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <span class="cell-date">
      <span>{{ datePart }}</span>
      <small style="font-weight:500">At {{ timePart }} EST</small>
    </span>
  `
})
export class DateCellComponent {
  @Input() iso: string = '';
  get datePart(): string {
    return new Date(this.iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }
  get timePart(): string {
    return new Date(this.iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }
}

/* ── ViewTicketModal ───────────────────────────────────────── */
@Component({
  selector: 'app-view-ticket-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, StatusCellComponent, PriorityPillComponent, DateCellComponent],
  templateUrl: './view-ticket-modal.component.html',
})
export class ViewTicketModalComponent implements OnInit, OnDestroy {
  @Input() ticket: any = null;
  @Input() multiPlan: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  private keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.onClose.emit(); };
  ngOnInit()    { document.addEventListener('keydown', this.keyHandler); }
  ngOnDestroy() { document.removeEventListener('keydown', this.keyHandler); }

  overlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.onClose.emit();
  }
}

/* ── TicketsGrid ───────────────────────────────────────────── */
@Component({
  selector: 'app-tickets-grid',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    StatusCellComponent, PriorityPillComponent, DateCellComponent,
    ViewTicketModalComponent, ConfirmModalComponent
  ],
  templateUrl: './grid.component.html',
})
export class TicketsGridComponent implements OnInit {
  @Input() rows: any[] = [];
  @Input() multiPlan: boolean = false;
  @Input() planChoices: string[] = [];
  @Output() onAction = new EventEmitter<{ action: string; row: any }>();
  @Output() onToast = new EventEmitter<string>();
  @Output() onEditTicket = new EventEmitter<any>();
  @Output() onUpdateTicket = new EventEmitter<any>();

  private PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

  columns: GridColumn[] = [];
  sort: { key: string | null; dir: string | null } = { key: null, dir: null };
  filters: Record<string, any> = {};
  search: string = '';
  page: number = 1;
  pageSize: number = 10;
  activeMenu: { row: any; anchor: DOMRect } | null = null;
  viewTicket: any = null;
  confirmCancel: any = null;

  /* filter popover state */
  filterOpen: string | null = null;
  filterDraft: any = null;

  ngOnInit() {
    this.columns = [
      { key: 'id',        label: 'Ticket ID',          width: 140, filterable: true },
      { key: 'type',      label: 'Ticket Type',         width: 220, filterable: true, choices: ['API Connectivity','Authentication','Data Mismatch','Rate Limit','Webhook Failure','Documentation','Other'] },
      { key: 'status',    label: 'Status',              width: 200, filterable: true, choices: ['Ticket Submitted','In Progress','On Hold','Closed'] },
      { key: 'priority',  label: 'Priority',            width: 160, filterable: true, choices: ['High','Medium','Low','Not Assigned'] },
      this.multiPlan
        ? { key: 'plan',      label: 'Plan',                width: 240, filterable: true, choices: this.planChoices }
        : { key: 'submitter', label: 'Name of Submittor',   width: 200, filterable: true },
      { key: 'date',      label: 'Date',                width: 200, filterable: false },
      { key: 'actions',   label: '',                    width: 64,  filterable: false, sortable: false },
    ];
  }

  /* ── Sorting ─────────────────────────────────────────────── */
  onSort(key: string) {
    if (this.sort.key !== key) { this.sort = { key, dir: 'asc' }; return; }
    if (this.sort.dir === 'asc') { this.sort = { key, dir: 'desc' }; return; }
    this.sort = { key: null, dir: null };
  }

  sortClass(col: GridColumn): string {
    if (this.sort.key !== col.key) return '';
    return this.sort.dir === 'asc' ? 'is-sorted sort-asc' : 'is-sorted sort-desc';
  }

  /* ── Filtering ───────────────────────────────────────────── */
  openFilter(col: GridColumn, btnEl: HTMLElement) {
    this.filterOpen = col.key;
    this.filterDraft = this.filters[col.key] ?? (col.choices ? [] : '');
  }

  applyFilter(col: GridColumn) {
    const v = this.filterDraft;
    if (Array.isArray(v) && v.length === 0 || v === '' || v == null) {
      const next = { ...this.filters };
      delete next[col.key];
      this.filters = next;
    } else {
      this.filters = { ...this.filters, [col.key]: v };
    }
    this.filterOpen = null;
    this.page = 1;
  }

  clearFilter(col: GridColumn) {
    const next = { ...this.filters };
    delete next[col.key];
    this.filters = next;
    this.filterOpen = null;
    this.page = 1;
  }

  clearAllFilters() { this.filters = {}; }

  toggleDraftChoice(choice: string) {
    const draft: string[] = this.filterDraft || [];
    this.filterDraft = draft.includes(choice)
      ? draft.filter(x => x !== choice)
      : [...draft, choice];
  }

  hasFilter(col: GridColumn): boolean {
    const f = this.filters[col.key];
    return Array.isArray(f) ? f.length > 0 : !!f;
  }

  get filterKeys(): number { return Object.keys(this.filters).length; }

  /* ── Column resize ───────────────────────────────────────── */
  startResize(e: MouseEvent, col: GridColumn) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = col.width;
    const onMove = (ev: MouseEvent) => {
      col.width = Math.max(80, startW + (ev.clientX - startX));
      this.columns = [...this.columns];
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /* ── Processed rows (replaces useMemo) ──────────────────── */
  get processed(): any[] {
    let out = this.rows;
    const q = this.search.trim().toLowerCase();
    if (q) {
      out = out.filter(r =>
        [r.id, r.type, r.status, r.priority, r.submitter, r.plan]
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    Object.entries(this.filters).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        out = out.filter(r => {
          if (k === 'priority') {
            const norm = ['High','Medium','Low'].includes(r.priority) ? r.priority : 'Not Assigned';
            return v.includes(norm);
          }
          return v.includes(r[k]);
        });
      } else if (typeof v === 'string' && v) {
        out = out.filter(r => String(r[k] ?? '').toLowerCase().includes(v.toLowerCase()));
      }
    });
    if (this.sort.key) {
      const dir = this.sort.dir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => {
        if (this.sort.key === 'priority') {
          const rank = (v: string) => v in this.PRIORITY_RANK ? this.PRIORITY_RANK[v] : 3;
          return (rank(a.priority) - rank(b.priority)) * dir;
        }
        if (this.sort.key === 'date') return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
        const av = String(a[this.sort.key!] ?? '').toLowerCase();
        const bv = String(b[this.sort.key!] ?? '').toLowerCase();
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return out;
  }

  get total()     { return this.processed.length; }
  get pageCount() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get safePage()  { return Math.min(this.page, this.pageCount); }
  get paged()     { const s = (this.safePage - 1) * this.pageSize; return this.processed.slice(s, s + this.pageSize); }
  get minWidth()  { return this.columns.reduce((s, c) => s + c.width, 0); }

  /* ── Pager pages list ────────────────────────────────────── */
  get pages(): (number | string)[] {
    const list: (number | string)[] = [];
    for (let i = 1; i <= this.pageCount; i++) {
      if (i === 1 || i === this.pageCount || (i >= this.safePage - 1 && i <= this.safePage + 1)) {
        list.push(i);
      } else if (list[list.length - 1] !== '…') {
        list.push('…');
      }
    }
    return list;
  }

  get startIdx() { return this.total === 0 ? 0 : (this.safePage - 1) * this.pageSize + 1; }
  get endIdx()   { return Math.min(this.total, this.safePage * this.pageSize); }

  onSearchChange(val: string) { this.search = val; this.page = 1; }
  onPageSizeChange(n: number) { this.pageSize = n; this.page = 1; }
  isPage(p: any): p is number { return typeof p === 'number'; }

  /* ── Row / menu actions ──────────────────────────────────── */
  handleRowClick(row: any, e: MouseEvent) {
    const tr = e.currentTarget as HTMLElement;
    const btn = tr.querySelector('.row-more-btn');
    if (!btn) return;
    this.activeMenu = { row, anchor: btn.getBoundingClientRect() };
  }

  openMenu(row: any, e: MouseEvent) {
    e.stopPropagation();
    this.activeMenu = { row, anchor: (e.currentTarget as HTMLElement).getBoundingClientRect() };
  }

  handleAction(action: string, row: any) {
    this.activeMenu = null;
    if (action === 'cancel') {
      this.confirmCancel = row;
    } else if (action === 'edit') {
      this.onEditTicket.emit(row);
    } else {
      this.viewTicket = row;
    }
  }

  doCancel() {
    this.onToast.emit(`Ticket ${this.confirmCancel.id} cancellation requested.`);
    this.onAction.emit({ action: 'cancel', row: this.confirmCancel });
    this.confirmCancel = null;
  }

  menuTop():  number { return this.activeMenu ? this.activeMenu.anchor.bottom + 4 : 0; }
  menuLeft(): number {
    if (!this.activeMenu) return 0;
    return Math.min(this.activeMenu.anchor.right - 200, window.innerWidth - 200);
  }
}
