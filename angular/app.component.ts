import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsGridComponent } from './grid.component';
import { ApplicationApiPageComponent, seedApplications } from './api.component';
import { NewTicketModalComponent } from './modal.component';
import { LoginScreenComponent } from './login.component';
import { TwoFactorScreenComponent } from './twofactor.component';
import { ForgotPasswordScreenComponent } from './forgotpassword.component';
import {
  IconMenuComponent, IconCogComponent, IconHelpFilledComponent,
  IconPlusComponent, IconCloseComponent, IconCheckComponent
} from './icons.component';

const seedTickets: any[] = [
  { id: 'TKT-1247', type: 'API Connectivity',  status: 'In Progress',       priority: 'High',   submitter: 'Jane Smith',        plan: 'State 529 College Savings',        date: '2026-05-26T14:48:00-04:00' },
  { id: 'TKT-1250', type: 'Webhook Failure',    status: 'Ticket Submitted',  priority: 'High',   submitter: 'Taylor Evans',      plan: 'State-Funded Retirement Program',  date: '2026-05-26T11:02:00-04:00' },
  { id: 'TKT-1276', type: 'Rate Limit',         status: 'Ticket Submitted',  priority: 'Medium', submitter: 'Taylor Evans',      plan: 'ABLE Disability Savings',          date: '2026-05-25T09:34:00-04:00' },
  { id: 'TKT-1277', type: 'Authentication',     status: 'Ticket Submitted',  priority: 'Low',    submitter: 'Ari Priyanka',      plan: 'State 529 College Savings',        date: '2026-05-25T08:11:00-04:00' },
  { id: 'TKT-1281', type: 'Documentation',      status: 'Ticket Submitted',  priority: 'Low',    submitter: 'James Elson',       plan: 'State-Funded Retirement Program',  date: '2026-05-24T16:22:00-04:00' },
  { id: 'TKT-1283', type: 'Data Mismatch',      status: 'Closed',            priority: 'Medium', submitter: 'Lizzy Gronkowski',  plan: 'ABLE Disability Savings',          date: '2026-05-24T10:48:00-04:00' },
  { id: 'TKT-1290', type: 'API Connectivity',   status: 'In Progress',       priority: 'Medium', submitter: 'Marcus Lee',        plan: 'State 529 College Savings',        date: '2026-05-23T15:11:00-04:00' },
  { id: 'TKT-1291', type: 'Rate Limit',         status: 'On Hold',           priority: 'Low',    submitter: 'Priya Raman',       plan: 'State-Funded Retirement Program',  date: '2026-05-23T11:39:00-04:00' },
  { id: 'TKT-1293', type: 'Webhook Failure',    status: 'Closed',            priority: 'High',   submitter: 'Devon Brooks',      plan: 'ABLE Disability Savings',          date: '2026-05-22T17:54:00-04:00' },
  { id: 'TKT-1294', type: 'Authentication',     status: 'Ticket Submitted',  priority: 'Medium', submitter: 'Sasha Volkov',      plan: 'State 529 College Savings',        date: '2026-05-22T13:21:00-04:00' },
  { id: 'TKT-1297', type: 'Documentation',      status: 'In Progress',       priority: 'Low',    submitter: 'Owen Park',         plan: 'State-Funded Retirement Program',  date: '2026-05-21T09:08:00-04:00' },
  { id: 'TKT-1300', type: 'Data Mismatch',      status: 'Ticket Submitted',  priority: 'High',   submitter: 'Hannah Kim',        plan: 'ABLE Disability Savings',          date: '2026-05-21T08:02:00-04:00' },
  { id: 'TKT-1303', type: 'Other',              status: 'Closed',            priority: 'Low',    submitter: 'Carlos Mendez',     plan: 'State 529 College Savings',        date: '2026-05-20T14:47:00-04:00' },
  { id: 'TKT-1308', type: 'API Connectivity',   status: 'Ticket Submitted',  priority: 'Medium', submitter: 'Nina Albright',     plan: 'State-Funded Retirement Program',  date: '2026-05-20T10:30:00-04:00' },
  { id: 'TKT-1311', type: 'Authentication',     status: 'In Progress',       priority: 'High',   submitter: 'Ren Yamamoto',      plan: 'ABLE Disability Savings',          date: '2026-05-19T16:18:00-04:00' },
];

const PARTNER_PLANS = [
  'State 529 College Savings',
  'State-Funded Retirement Program',
  'ABLE Disability Savings',
];

const BRAND_LS_KEY = 'dcpp.branding';
const BRAND_KEYS = ['brandingMode', 'logoUrl', 'brandPrimary', 'brandPrimaryHover', 'brandSecondary', 'brandSecondaryHover', 'brandAction'];

export function readBrandingLS(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(BRAND_LS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      const out: Record<string, string> = {};
      for (const k of BRAND_KEYS) if (k in saved) out[k] = saved[k];
      return out;
    }
  } catch { /* localStorage unavailable */ }
  return {};
}

export function writeBrandingLS(edits: Record<string, string>) {
  const brandEdits: Record<string, string> = {};
  for (const k of BRAND_KEYS) if (k in edits) brandEdits[k] = edits[k];
  if (!Object.keys(brandEdits).length) return;
  try {
    const prev = JSON.parse(localStorage.getItem(BRAND_LS_KEY) || '{}');
    localStorage.setItem(BRAND_LS_KEY, JSON.stringify({ ...prev, ...brandEdits }));
  } catch { /* ignore */ }
}

/* ── Toast ──────────────────────────────────────────────────── */
@Component({
  selector: 'app-toast',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="toast" role="alert">
      <span class="toast__message">{{ message }}</span>
      <button class="toast__close" (click)="closed.emit()" aria-label="Dismiss">&#x2715;</button>
    </div>
  `
})
export class ToastComponent {
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();
}

/* ── TweakLogoUpload ────────────────────────────────────────── */
@Component({
  selector: 'app-tweak-logo-upload',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="twk-row">
      <span class="twk-label">Logo</span>
      <div style="display:flex;flex-direction:column;gap:6px">
        <img *ngIf="value" [src]="value" alt="Logo preview"
             style="max-height:40px;max-width:140px;object-fit:contain;border-radius:4px;background:#f2f2f2;padding:4px" />
        <div style="display:flex;gap:6px">
          <button type="button" class="twk-btn" style="flex:1" (click)="fileInput.click()">Upload</button>
          <button *ngIf="value" type="button" class="twk-btn secondary" (click)="changed.emit('')">Clear</button>
        </div>
      </div>
      <input #fileInput type="file" accept="image/*" style="display:none" (change)="onFile($event)" />
    </div>
  `
})
export class TweakLogoUploadComponent {
  @Input() value: string = '';
  @Output() changed = new EventEmitter<string>();

  onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => this.changed.emit(ev.target?.result as string);
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = '';
  }
}

/* ── AppShell ───────────────────────────────────────────────── */
@Component({
  selector: 'app-shell',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    TicketsGridComponent,
    ApplicationApiPageComponent,
    NewTicketModalComponent,
    ToastComponent,
    IconMenuComponent, IconCogComponent, IconHelpFilledComponent,
    IconPlusComponent, IconCloseComponent, IconCheckComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppShellComponent implements OnInit, OnDestroy {
  @Input() initialNav: string = 'api';
  @Input() logoUrl: string = '';
  @Output() logout = new EventEmitter<void>();

  PARTNER_PLANS = PARTNER_PLANS;
  LOGO = '';

  nav = 'api';
  apiSubview = 'list';
  docsTarget: any = null;
  sidebarOpen = false;
  drawerOpen = false;
  showModal = false;
  modalPrefill: any = null;
  editingTicket: any = null;
  tickets: any[] = [...seedTickets];
  applications: any[] = [...seedApplications];
  relatedTickets = false;
  toast: string | null = null;
  private toastTimer: any;

  ngOnInit() {
    this.nav  = this.initialNav;
    this.LOGO = this.logoUrl || 'assets/partner-logo-placeholder.svg';
  }

  ngOnDestroy() { clearTimeout(this.toastTimer); }

  get hasApiError(): boolean { return this.applications.some((a: any) => a.status === 'error'); }
  get multiPlan(): boolean   { return PARTNER_PLANS.length > 1; }

  showToast(msg: string) {
    this.toast = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = null; }, 2800);
  }

  submitTicketFor(app: any, feed: any, context: string) {
    this.modalPrefill = {
      type: 'API Connectivity',
      priority: '',
      summary: feed
        ? `${app.name} — ${feed.name}: ${app.status === 'error' ? 'outage reported' : 'issue reported'}`
        : `${app.name}: ${app.statusLabel || 'issue reported'}`,
      application: app?.name || '',
      feed: feed?.name || '',
      description: context || '',
    };
    this.nav = 'tickets';
    this.sidebarOpen = false;
    this.showModal = true;
  }

  handleSubmit(form: any) {
    const num = 1320 + Math.floor(Math.random() * 60);
    const newTicket = {
      id: `TKT-${num}`,
      type: form.type,
      status: 'Ticket Submitted',
      priority: form.priority,
      submitter: 'Leia Organa',
      date: new Date().toISOString(),
      linkedApp: form.application || null,
      plan: form.plan,
      summary: form.summary,
      application: form.application,
      feed: form.feed,
      environment: form.environment,
      endpoint: form.endpoint,
      description: form.description,
      attachments: form.attachments,
    };
    this.tickets = [newTicket, ...this.tickets];
    if (form.application) this.relatedTickets = true;
    this.showModal = false;
    this.modalPrefill = null;
    this.showToast(`Ticket ${newTicket.id} opened — we'll be in touch.`);
  }

  handleEditSubmit(form: any) {
    this.tickets = this.tickets.map((t: any) =>
      t.id === this.editingTicket?.id && t.date === this.editingTicket?.date
        ? { ...t, ...form } : t
    );
    this.showToast(`Ticket ${this.editingTicket?.id} updated.`);
    this.editingTicket = null;
  }

  handleAction(event: { action: string; row: any }) {
    if (event.action === 'cancel' && event.row.status !== 'Closed') {
      this.tickets = this.tickets.map((t: any) =>
        t.id === event.row.id && t.date === event.row.date
          ? { ...t, status: 'Closed' } : t
      );
    }
  }

  updateTicket(updated: any) {
    this.tickets = this.tickets.map((t: any) =>
      t.id === updated.id && t.date === updated.date ? { ...t, ...updated } : t
    );
  }

  handleSubmitTicket(event: { app: any; feed: any; context: string }) {
    this.submitTicketFor(event.app, event.feed, event.context);
  }

  openBlankTicket() { this.modalPrefill = null; this.showModal = true; }

  goToApi() { this.nav = 'api'; this.apiSubview = 'list'; this.sidebarOpen = false; }

  viewDocs(apiId: string, endpointId?: string) {
    this.docsTarget = apiId ? { apiId, endpointId } : null;
    this.apiSubview = 'docs';
    this.sidebarOpen = false;
  }
}

/* ── AppRootComponent ───────────────────────────────────────── */
const FORGOT_STEPS: Record<string, number> = {
  'forgot-verify': 1,
  'forgot-pin-request': 2,
  'forgot-pin-auth': 3,
  'forgot-new-password': 4,
  'forgot-success': 5,
};

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    LoginScreenComponent,
    TwoFactorScreenComponent,
    ForgotPasswordScreenComponent,
    AppShellComponent,
  ],
  templateUrl: './app-root.component.html',
})
export class AppRootComponent implements OnInit {
  screen = 'login';
  notice: string | null = null;
  brandLogo = '';

  ngOnInit() {
    const saved = readBrandingLS();
    if (saved['logoUrl']) this.brandLogo = saved['logoUrl'];
  }

  go(s: string) { this.screen = s; }

  get isForgotScreen(): boolean {
    return this.screen in FORGOT_STEPS || this.screen === 'forgot-password';
  }

  get is2fa(): boolean {
    return this.screen === '2fa-request' || this.screen === '2fa-pin';
  }

  get isDashboard(): boolean {
    return !this.isForgotScreen && !this.is2fa && this.screen !== 'login';
  }

  get forgotInitialStep(): number {
    return FORGOT_STEPS[this.screen] || 1;
  }

  get twoFactorInitialStep(): number {
    return this.screen === '2fa-pin' ? 2 : 1;
  }

  get dashboardInitialNav(): string {
    return this.screen === 'dashboard-tickets' ? 'tickets' : 'api';
  }
}
