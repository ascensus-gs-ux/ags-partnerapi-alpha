import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

const TICKET_TYPES = [
  'API Connectivity', 'Authentication', 'Data Mismatch', 'Rate Limit',
  'Webhook Failure', 'Documentation', 'Other'
];

const TYPE_RULES: Record<string, { routing: boolean }> = {
  'API Connectivity':  { routing: true },
  'Authentication':    { routing: true },
  'Data Mismatch':     { routing: true },
  'Rate Limit':        { routing: true },
  'Webhook Failure':   { routing: true },
  'Documentation':     { routing: false },
  'Other':             { routing: false }
};

const APP_SPECIAL = ['Not Applicable', "Don't Know"];

function needsRouting(type: string): boolean {
  return !!(TYPE_RULES[type] && TYPE_RULES[type].routing);
}

function isRealApp(v: string): boolean {
  return !!v && !APP_SPECIAL.includes(v);
}

export interface TicketForm {
  type: string;
  priority: string;
  plan: string;
  summary: string;
  application: string;
  feed: string;
  environment: string;
  endpoint: string;
  description: string;
  attachments: File[];
}

/* ── FileDropZone ──────────────────────────────────────────── */
@Component({
  selector: 'app-file-drop-zone',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './file-drop-zone.component.html',
})
export class FileDropZoneComponent {
  @Input() files: File[] = [];
  @Output() filesChange = new EventEmitter<File[]>();

  dragging = false;

  onDragOver(e: DragEvent) { e.preventDefault(); this.dragging = true; }
  onDragLeave() { this.dragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.dragging = false;
    this.addFiles(e.dataTransfer?.files);
  }

  addFiles(list?: FileList | null) {
    const incoming = Array.from(list || []);
    if (!incoming.length) return;
    this.filesChange.emit([...this.files, ...incoming]);
  }

  removeAt(i: number) {
    this.filesChange.emit(this.files.filter((_, idx) => idx !== i));
  }

  openPicker(input: HTMLInputElement) { input.click(); }

  onFileInput(e: Event, input: HTMLInputElement) {
    this.addFiles((e.target as HTMLInputElement).files);
    input.value = '';
  }
}

/* ── ConfirmModal ──────────────────────────────────────────── */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Are you sure?';
  @Input() message: string = '';
  @Input() confirmLabel: string = 'Yes, cancel';
  @Input() cancelLabel: string = 'No, go back';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.cancel.emit(); };

  ngOnInit() { document.addEventListener('keydown', this.keyHandler); }
  ngOnDestroy() { document.removeEventListener('keydown', this.keyHandler); }
}

/* ── NewTicketModal ────────────────────────────────────────── */
@Component({
  selector: 'app-new-ticket-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FileDropZoneComponent, ConfirmModalComponent],
  templateUrl: './modal.component.html',
})
export class NewTicketModalComponent implements OnInit, OnDestroy {
  @Input() prefill: Partial<TicketForm> | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() ticket: any = null;
  @Input() applications: any[] = [];
  @Input() plans: string[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<TicketForm>();

  TICKET_TYPES = TICKET_TYPES;
  APP_SPECIAL = APP_SPECIAL;

  isEdit = false;
  multiPlan = false;
  step = 0;
  steps = ['Ticket Details', 'Description', 'Review'];
  title = '';
  confirmCancel = false;

  form: TicketForm = {
    type: '', priority: '', plan: '', summary: '',
    application: '', feed: '', environment: 'Production',
    endpoint: '', description: '', attachments: []
  };
  errors: Record<string, string> = {};

  private keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.onClose.emit(); };

  ngOnInit() {
    this.isEdit = this.mode === 'edit';
    this.multiPlan = this.plans.length > 1;
    const src = this.isEdit ? this.ticket : this.prefill;
    this.form = {
      type:        src?.type        || '',
      priority:    src?.priority    || '',
      plan:        src?.plan        || (this.plans.length === 1 ? this.plans[0] : ''),
      summary:     src?.summary     || '',
      application: src?.application || src?.linkedApp || '',
      feed:        src?.feed        || '',
      environment: src?.environment || 'Production',
      endpoint:    src?.endpoint    || '',
      description: src?.description || '',
      attachments: src?.attachments || []
    };
    this.title = this.isEdit ? `Edit a Ticket — ${this.ticket.id}` : 'Open a New Ticket';
    document.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy() { document.removeEventListener('keydown', this.keyHandler); }

  get routing() { return needsRouting(this.form.type); }
  get realApp()  { return isRealApp(this.form.application); }

  get feedOptions(): string[] {
    if (!this.realApp) return [];
    const app = this.applications.find(a => a.name === this.form.application);
    return app ? app.feeds.map((f: any) => f.name) : [];
  }

  setField(k: keyof TicketForm, v: any) {
    (this.form as any)[k] = v;
    if (k === 'application') this.form.feed = '';
  }

  validate(idx = this.step): boolean {
    if (this.isEdit) return true;
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!this.form.type) e['type'] = 'Select a ticket type.';
      if (this.multiPlan && !this.form.plan) e['plan'] = 'Select a plan.';
      if (needsRouting(this.form.type) && !this.form.application)
        e['application'] = 'Select an application to continue.';
    }
    if (idx === 1) {
      if (!this.form.summary.trim()) e['summary'] = 'Add a short summary.';
      else if (this.form.summary.length > 120) e['summary'] = 'Keep under 120 characters.';
      if (!this.form.description.trim() || this.form.description.trim().length < 20)
        e['description'] = 'Add at least 20 characters describing the issue.';
    }
    this.errors = e;
    return Object.keys(e).length === 0;
  }

  next() { if (this.validate()) this.step = Math.min(2, this.step + 1); }
  back() { this.step = Math.max(0, this.step - 1); }

  submit() {
    if (!this.validate(1)) { this.step = 1; return; }
    const f = this.form;
    const cleaned: TicketForm = {
      ...f,
      plan:        this.multiPlan ? f.plan : this.plans[0] || '',
      application: this.routing ? f.application : '',
      feed:        this.routing && this.realApp ? f.feed : '',
      environment: this.routing ? f.environment : '',
      endpoint:    this.routing ? f.endpoint : ''
    };
    this.onSubmit.emit(cleaned);
  }
}
