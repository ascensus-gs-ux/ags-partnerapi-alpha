import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/* ── StatusCell ────────────────────────────────────────────── */
@Component({
  selector: 'app-status-cell',
  standalone: true,
  template: `
    <span [class]="'status ' + cls">
      <span class="status__dot"></span>
      {{ value }}
    </span>
  `
})
export class StatusCellComponent {
  @Input() value: string = '';

  get cls(): string {
    const map: Record<string, string> = {
      'In Progress':        'status--inprogress',
      'Ticket Submitted':   'status--submitted',
      'Closed':             'status--closed',
      'On Hold':            'status--submitted',
    };
    return map[this.value] ?? 'status--submitted';
  }
}

/* ── PriorityPill ──────────────────────────────────────────── */
@Component({
  selector: 'app-priority-pill',
  standalone: true,
  template: `
    <span [class]="'pill ' + cls">{{ label }}</span>
  `
})
export class PriorityPillComponent {
  @Input() value: string = '';

  get assigned(): boolean {
    return this.value === 'High' || this.value === 'Medium' || this.value === 'Low';
  }

  get cls(): string {
    if (this.value === 'High')   return 'pill--high';
    if (this.value === 'Medium') return 'pill--medium';
    return 'pill--low';
  }

  get label(): string {
    return this.assigned ? this.value : 'Not Assigned';
  }
}

/* ── DateCell ──────────────────────────────────────────────── */
@Component({
  selector: 'app-date-cell',
  standalone: true,
  template: `
    <span class="cell-date">
      <span>{{ datePart }}</span>
      <small style="font-weight: 500">At {{ timePart }} EST</small>
    </span>
  `
})
export class DateCellComponent {
  @Input() iso: string = '';

  get datePart(): string {
    const d = new Date(this.iso);
    return d.toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric'
    });
  }

  get timePart(): string {
    const d = new Date(this.iso);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    }).toLowerCase();
  }
}
