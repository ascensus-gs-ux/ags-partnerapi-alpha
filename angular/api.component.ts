import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetStartedTabComponent, HowToUseTabComponent, TroubleshootTabComponent } from './apicontent.component';
import { ApiDocsPageComponent } from './apidocs.component';

const SWAGGER_BASE = 'https://agsup-aws-account-web-qc4.gs.ascensus.com/accounts/swagger-ui/index.html';

const API_TABS = [
  { id: 'start',        label: 'Get Started' },
  { id: 'configure',    label: 'Configure APIs' },
  { id: 'use',          label: 'How to Use APIs' },
  { id: 'troubleshoot', label: 'Troubleshoot' },
];

const TAB_SECTIONS: Record<string, { id: string; label: string }[]> = {
  start: [
    { id: 'gs-checklist',    label: 'Onboarding checklist' },
    { id: 'gs-requirements', label: 'Partner requirements' },
    { id: 'gs-menu',         label: 'Integration menu' },
    { id: 'gs-glossary',     label: 'Glossary' },
    { id: 'gs-faq',          label: 'FAQs' },
  ],
  configure: [
    { id: 'cfg-table',   label: 'Applications & feeds' },
    { id: 'cfg-updates', label: 'Updates & releases' },
  ],
  use: [
    { id: 'use-reference',    label: 'Full API reference' },
    { id: 'use-sso',          label: 'SSO & authentication' },
    { id: 'use-restrictions', label: 'Restrictions & requirements' },
  ],
  troubleshoot: [
    { id: 'ts-errors',  label: 'Common errors' },
    { id: 'ts-sla',     label: 'Severity & SLA' },
    { id: 'ts-support', label: 'Submitting tickets' },
  ],
};

const DEFAULT_FEED_REQS = [
  'Account status must be 91 (active) to modify records.',
  'Freeze codes may block contributions and other transactions.',
  'Web-disabled accounts will reject API activity.',
];

const DEFAULT_FEED_DESC =
  'A single enableable data stream within this application. Generate a key to begin authenticating requests against the account service.';

function makeKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return 'sk_' + s;
}

export const seedApplications: any[] = [
  {
    id: 'account', name: 'Account', status: 'error',
    statusLabel: 'Outage Reported', lastActivity: '1 day ago',
    errorContext: 'GET /account (v1.0) is returning HTTP 401 since the last key rotation. Downstream account sync is blocked.',
    error: {
      summary: 'Requests to GET /account are being rejected at authentication — account sync is blocked.',
      detail: 'Since the last key rotation on May 28, every call to GET /account v1.0 has returned HTTP 401 Unauthorized. The Authorization header is presenting an ApiKey credential the gateway no longer recognizes — the previous key was most likely revoked before the replacement was deployed. Regenerate the key on the affected feed, update your stored credential, and retry.',
      code: 'AUTH_401_INVALID_KEY',
      endpoint: 'GET https://api.yourcompany.com/account',
      timestamp: '2026-05-28T14:48:12Z',
      cause: 'API key revoked or expired after the last rotation.',
    },
    feeds: [
      { id: 'acct-delete-v10', name: '/account', method: 'DELETE', version: 'v1.0', enabled: false, status: 'ready', desc: 'Permanently removes an account record. Requires status 91; irreversible once committed.' },
      { id: 'acct-delete-v11', name: '/account', method: 'DELETE', version: 'v1.1', enabled: false, status: 'ready', desc: 'Enhanced account deletion with pre-delete validation checks and soft-delete capability.' },
      { id: 'acct-delete-v20', name: '/account', method: 'DELETE', version: 'v2.0', enabled: false, status: 'ready', desc: 'Latest account deletion endpoint. Adds full audit trail support and rollback window.' },
      { id: 'acct-get-v10', name: '/account', method: 'GET', version: 'v1.0', enabled: true, status: 'error',
        desc: 'Retrieves a full account record by account ID, including registration, ownership, and servicing attributes.',
        apiKey: 'sk_acc_9f2c81a4d7e6', endpoint: 'https://api.yourcompany.com/account', anchor: 'account',
        lastActivity: '1 day ago', mins: 1440,
        error: {
          summary: 'GET /account v1.0 is rejecting all requests — account records are no longer being returned.',
          detail: 'The feed key (sk_acc_9f2c81a4d7e6) is being rejected with HTTP 401 Unauthorized on every request to GET /account v1.0. The credential was rotated on the server but the feed is still presenting the old ApiKey. Regenerate this feed\'s key, redeploy it to your client, and the feed will resume on the next poll.',
          code: 'AUTH_401_INVALID_KEY',
          endpoint: 'GET https://api.yourcompany.com/account',
          timestamp: '2026-05-28T14:48:12Z',
          cause: 'Stored ApiKey no longer matches the active server-side key.',
        },
      },
      { id: 'acct-get-v11', name: '/account', method: 'GET', version: 'v1.1', enabled: true, status: 'active',
        desc: 'Returns the full account record with an expanded field set including beneficiary and advisor attributes.',
        apiKey: 'sk_acc_a1b2c3d4e5f6', endpoint: 'https://api.yourcompany.com/account', anchor: 'account-v11',
        lastActivity: '2 hours ago', mins: 120,
      },
      { id: 'acct-get-v20', name: '/account', method: 'GET', version: 'v2.0', enabled: false, status: 'ready', desc: 'Latest GET account version. Returns the full compliance and servicing attribute set in a redesigned response schema.' },
      { id: 'acct-put-v10', name: '/account', method: 'PUT', version: 'v1.0', enabled: false, status: 'ready', desc: 'Updates an account record. Only accounts in status 91 can be modified; write attempts on other statuses are rejected.' },
      { id: 'acct-put-v11', name: '/account', method: 'PUT', version: 'v1.1', enabled: false, status: 'ready', desc: 'Expanded PUT with support for advisor and compliance fields. Adds stronger validation error responses.' },
      { id: 'acct-put-v20', name: '/account', method: 'PUT', version: 'v2.0', enabled: false, status: 'ready', desc: 'Latest account update endpoint. Full field coverage with improved partial-update and conflict-detection support.' },
    ],
  },
  {
    id: 'accountmetric', name: 'AccountMetric', status: 'active',
    statusLabel: 'Active', lastActivity: '30 min ago',
    feeds: [
      { id: 'acctmetric-get-v10', name: '/accountmetric', method: 'GET', version: 'v1.0', enabled: true, status: 'active',
        desc: 'Returns performance and activity metrics for an account. Used for reporting, analytics, and portfolio display.',
        apiKey: 'sk_met_7g8h9i0j1k2l', endpoint: 'https://api.yourcompany.com/accountmetric', anchor: 'accountmetric',
        lastActivity: '30 min ago', mins: 30,
      },
    ],
  },
  {
    id: 'accountsearch', name: 'AccountSearch', status: 'active',
    statusLabel: 'Active', lastActivity: '5 min ago',
    feeds: [
      { id: 'acctSearch-get-v10', name: '/accountsearch', method: 'GET', version: 'v1.0', enabled: true, status: 'active',
        desc: 'Searches for accounts by participant or plan attributes. Returns a paginated list of matching account records.',
        apiKey: 'sk_src_3m4n5o6p7q8r', endpoint: 'https://api.yourcompany.com/accountsearch', anchor: 'accountsearch',
        lastActivity: '5 min ago', mins: 5,
      },
    ],
  },
  {
    id: 'enrollment', name: 'Enrollment', status: 'partial',
    statusLabel: 'Partially Enabled', lastActivity: '3 days ago',
    feeds: [
      { id: 'enroll-post-v10', name: '/enrollment', method: 'POST', version: 'v1.0', enabled: true, status: 'active',
        desc: 'Submits a new enrollment request for an eligible participant. Returns the enrollment confirmation and new account ID.',
        apiKey: 'sk_enr_9s0t1u2v3w4x', endpoint: 'https://api.yourcompany.com/enrollment', anchor: 'enrollment',
        lastActivity: '3 days ago', mins: 4320,
      },
      { id: 'enroll-post-v11', name: '/enrollment', method: 'POST', version: 'v1.1', enabled: false, status: 'ready',
        desc: 'Updated enrollment submission with expanded validation rules and support for beneficiary data at time of enrollment.',
      },
    ],
  },
  {
    id: 'entityenrollment', name: 'EntityEnrollmentValidationHandler', status: 'ready',
    statusLabel: 'Ready to Enable', lastActivity: null,
    feeds: [
      { id: 'entity-post-v10', name: '/entityenrollmentvalidation', method: 'POST', version: 'v1.0', enabled: false, status: 'ready',
        desc: 'Validates an ABLE enrollment entity before submission. Checks eligibility, identity, and required documentation completeness.',
      },
    ],
  },
  {
    id: 'partialenrollment', name: 'Partial Enrollment', status: 'ready',
    statusLabel: 'Ready to Enable', lastActivity: null,
    feeds: [
      { id: 'penroll-get-v10', name: '/partialenrollment', method: 'GET', version: 'v1.0', enabled: false, status: 'ready', desc: 'Retrieves the current state of an in-progress partial enrollment, including completed and remaining steps.' },
      { id: 'penroll-post-v10', name: '/partialenrollment', method: 'POST', version: 'v1.0', enabled: false, status: 'ready', desc: 'Submits or advances a partial enrollment. Supports step-by-step completion of the enrollment workflow.' },
      { id: 'penroll-put-v10', name: '/partialenrollment', method: 'PUT', version: 'v1.0', enabled: false, status: 'ready', desc: 'Updates an existing partial enrollment record. Used to correct or supplement previously submitted step data.' },
    ],
  },
  {
    id: 'ableenrollment', name: 'AbleEnrollment', status: 'ready',
    statusLabel: 'Ready to Enable', lastActivity: null,
    feeds: [
      { id: 'able-post-v10', name: '/ableenrollment', method: 'POST', version: 'v1.0', enabled: false, status: 'ready',
        desc: 'Submits a new ABLE (Achieving a Better Life Experience) account enrollment. Validates eligibility and initiates account creation.',
      },
    ],
  },
  {
    id: 'partialenrollmentable', name: 'Partial Enrollment ABLE', status: 'ready',
    statusLabel: 'Ready to Enable', lastActivity: null,
    feeds: [
      { id: 'penrollable-get-v10', name: '/partialenrollmentable', method: 'GET', version: 'v1.0', enabled: false, status: 'ready', desc: 'Retrieves the state of an in-progress ABLE partial enrollment, including completed and remaining steps.' },
      { id: 'penrollable-post-v10', name: '/partialenrollmentable', method: 'POST', version: 'v1.0', enabled: false, status: 'ready', desc: 'Submits or advances an ABLE partial enrollment through the step-by-step workflow.' },
      { id: 'penrollable-put-v10', name: '/partialenrollmentable', method: 'PUT', version: 'v1.0', enabled: false, status: 'ready', desc: 'Updates an existing ABLE partial enrollment record with corrected or supplementary step data.' },
    ],
  },
];

function exampleCurl(feed: any): string {
  const method = feed.method || 'GET';
  return `curl -X ${method} ${feed.endpoint} \\\n  -H "Authorization: ApiKey ${feed.apiKey}"`;
}

function appActivity(app: any): string {
  const enabled = app.feeds.filter((f: any) => f.enabled && f.mins != null);
  if (!enabled.length) return '';
  return enabled.reduce((a: any, b: any) => b.mins < a.mins ? b : a).lastActivity;
}

/* ── ApiStatus ──────────────────────────────────────────────── */
@Component({
  selector: 'app-api-status',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <span class="tl-status-row">
      <span [class]="'tl-status tl-status--' + status">
        <span class="tl-status__dot"></span>{{ label }}
      </span>
      <button *ngIf="status === 'error' && showInfo"
        type="button"
        class="tl-status__info"
        aria-label="View outage details"
        title="View outage details"
        (click)="$event.stopPropagation(); infoClick.emit()">
        &#9432;
      </button>
    </span>
  `
})
export class ApiStatusComponent {
  @Input() status: string = '';
  @Input() label: string = '';
  @Input() showInfo: boolean = false;
  @Output() infoClick = new EventEmitter<void>();
}

/* ── ErrorDetailsModal ──────────────────────────────────────── */
@Component({
  selector: 'app-error-details-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (mousedown)="onOverlay($event)">
      <div class="modal modal--error" role="dialog" aria-labelledby="err-modal-title" aria-modal="true">
        <div class="modal__head">
          <div><h2 class="modal__title" id="err-modal-title">Outage Details</h2></div>
          <agsup-button class="modal__close" (click)="close.emit()" aria-label="Close dialog">&#x2715;</agsup-button>
        </div>
        <div class="modal__body">
          <p class="err-subhead">{{ title }}</p>
          <p class="err-summary">{{ error?.summary }}</p>
          <div class="err-section">
            <span class="err-section__label">What happened:</span>
            <p class="err-section__text">{{ error?.detail }}</p>
          </div>
          <div class="err-section">
            <span class="err-section__label">Technical details:</span>
            <div class="err-tech">
              <div class="err-tech__row"><span class="err-tech__key">error_code</span><span class="err-tech__val">{{ error?.code }}</span></div>
              <div class="err-tech__row"><span class="err-tech__key">endpoint</span><span class="err-tech__val">{{ error?.endpoint }}</span></div>
              <div class="err-tech__row"><span class="err-tech__key">timestamp</span><span class="err-tech__val">{{ error?.timestamp }}</span></div>
              <div class="err-tech__row"><span class="err-tech__key">cause</span><span class="err-tech__val">{{ error?.cause }}</span></div>
            </div>
          </div>
        </div>
        <div class="modal__foot" style="background-color:rgb(255,255,255)">
          <agsup-button [class]="'btn btn--secondary btn--icon-right' + (copied ? ' btn--copied' : '')" (click)="copy()">
            {{ copied ? 'Copied ✓' : 'Copy Outage Details' }}
          </agsup-button>
          <agsup-button class="btn btn--primary" (click)="close.emit()">Close</agsup-button>
        </div>
      </div>
    </div>
  `
})
export class ErrorDetailsModalComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() error: any = null;
  @Output() close = new EventEmitter<void>();

  copied = false;
  private timer: any;
  private keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.close.emit(); };

  ngOnInit()    { document.addEventListener('keydown', this.keyHandler); }
  ngOnDestroy() { document.removeEventListener('keydown', this.keyHandler); clearTimeout(this.timer); }

  onOverlay(e: MouseEvent) { if (e.target === e.currentTarget) this.close.emit(); }

  get payload(): string {
    const err = this.error;
    return `Outage Details — ${this.title}\nStatus: Outage Reported\n\nSummary:\n${err?.summary}\n\nExplanation:\n${err?.detail}\n\nTechnical details:\n  Error code: ${err?.code}\n  Endpoint:   ${err?.endpoint}\n  Timestamp:  ${err?.timestamp}\n  Cause:      ${err?.cause}`;
  }

  copy() {
    navigator.clipboard?.writeText(this.payload).catch(() => {});
    this.copied = true;
    this.timer = setTimeout(() => { this.copied = false; }, 1800);
  }
}

/* ── CopyButton ─────────────────────────────────────────────── */
@Component({
  selector: 'app-copy-button',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <agsup-button
      [class]="'btn btn--secondary btn--icon-right' + (copied ? ' btn--copied' : '')"
      (click)="onClick($event)">
      {{ copied ? 'Copied ✓' : 'Copy' }}
    </agsup-button>
  `
})
export class CopyButtonComponent implements OnDestroy {
  @Input() value: string = '';
  @Output() toasted = new EventEmitter<string>();

  copied = false;
  private timer: any;

  onClick(e: MouseEvent) {
    e.stopPropagation();
    navigator.clipboard?.writeText(this.value).catch(() => {});
    this.copied = true;
    this.toasted.emit('Copied to clipboard');
    this.timer = setTimeout(() => { this.copied = false; }, 1600);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}

/* ── SecretField ────────────────────────────────────────────── */
@Component({
  selector: 'app-secret-field',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, CopyButtonComponent],
  template: `
    <div class="feed-field">
      <span class="feed-field__label">{{ label }}</span>
      <div class="feed-field__row">
        <div [class]="'feed-field__box' + (secret && !shown ? ' is-masked' : '')"
             [title]="shown ? value : 'Hidden'">
          {{ display }}
        </div>
        <div class="feed-field__buttons">
          <agsup-button *ngIf="secret" class="btn btn--secondary btn--icon-right"
            (click)="$event.stopPropagation(); shown = !shown">
            {{ shown ? 'Hide' : 'Show' }}
          </agsup-button>
          <app-copy-button [value]="value" (toasted)="toasted.emit($event)"></app-copy-button>
        </div>
      </div>
    </div>
  `
})
export class SecretFieldComponent implements OnInit {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() secret: boolean = false;
  @Output() toasted = new EventEmitter<string>();

  shown = false;

  ngOnInit() { this.shown = !this.secret; }

  get display(): string {
    return this.secret && !this.shown
      ? '•'.repeat(Math.min(this.value.length, 22))
      : this.value;
  }
}

/* ── FeedPanel ──────────────────────────────────────────────── */
@Component({
  selector: 'app-feed-panel',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SecretFieldComponent],
  template: `
    <div class="feed-panel">
      <p *ngIf="feed?.method || feed?.name" class="feed-panel__feed-id">
        <ng-container *ngIf="feed?.method">{{ feed.method }} </ng-container>{{ feed?.name }}<ng-container *ngIf="feed?.version"> ({{ feed.version }})</ng-container>
      </p>
      <p class="feed-panel__desc">{{ feed?.desc || defaultDesc }}</p>
      <app-secret-field label="API Key:" [value]="feed?.apiKey || ''" [secret]="true" (toasted)="toasted.emit($event)"></app-secret-field>
      <app-secret-field label="Endpoint:" [value]="feed?.endpoint || ''" (toasted)="toasted.emit($event)"></app-secret-field>
      <app-secret-field label="Example:" [value]="curlExample" (toasted)="toasted.emit($event)"></app-secret-field>
      <div class="callout callout--warn callout--onpanel">
        <div class="callout__label">&#9888; Requirements</div>
        <ul class="callout__list">
          <li *ngFor="let r of reqs">{{ r }}</li>
        </ul>
      </div>
      <div class="feed-panel__actions">
        <a class="btn btn--primary btn--icon-right"
           [href]="swaggerBase" target="_blank" rel="noopener noreferrer"
           (click)="$event.stopPropagation()">
          View Full API Reference &#8599;
        </a>
        <agsup-button class="btn btn--secondary btn--icon-right"
          (click)="$event.stopPropagation(); regenerate.emit()">
          Regenerate Key &#9881;
        </agsup-button>
        <button type="button" class="feed-panel__report-link"
          (click)="$event.stopPropagation(); submitTicket.emit()">
          &#9888; Report a Problem
        </button>
      </div>
    </div>
  `
})
export class FeedPanelComponent {
  @Input() feed: any = null;
  @Output() toasted = new EventEmitter<string>();
  @Output() regenerate = new EventEmitter<void>();
  @Output() submitTicket = new EventEmitter<void>();

  swaggerBase = SWAGGER_BASE;
  defaultDesc = DEFAULT_FEED_DESC;

  get reqs(): string[] { return this.feed?.requirements || DEFAULT_FEED_REQS; }
  get curlExample(): string { return this.feed ? exampleCurl(this.feed) : ''; }
}

/* ── FeedEnablePanel ────────────────────────────────────────── */
@Component({
  selector: 'app-feed-enable-panel',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="feed-panel feed-panel--enable">
      <p *ngIf="feed?.method || feed?.name" class="feed-panel__feed-id">
        <ng-container *ngIf="feed?.method">{{ feed.method }} </ng-container>{{ feed?.name }}<ng-container *ngIf="feed?.version"> ({{ feed.version }})</ng-container>
      </p>
      <p class="feed-panel__desc">{{ feed?.desc || defaultDesc }}</p>
      <div class="callout callout--warn callout--onpanel">
        <div class="callout__label">&#9888; Requirements</div>
        <ul class="callout__list">
          <li *ngFor="let r of reqs">{{ r }}</li>
        </ul>
      </div>
      <div class="feed-panel__actions">
        <a class="btn btn--secondary btn--icon-right"
           [href]="swaggerBase" target="_blank" rel="noopener noreferrer"
           (click)="$event.stopPropagation()">
          View Full API Reference &#8599;
        </a>
        <agsup-button class="btn btn--primary btn--icon-right"
          (click)="$event.stopPropagation(); generate.emit()">
          Generate Key &#9881;
        </agsup-button>
      </div>
    </div>
  `
})
export class FeedEnablePanelComponent {
  @Input() feed: any = null;
  @Output() generate = new EventEmitter<void>();

  swaggerBase = SWAGGER_BASE;
  defaultDesc = DEFAULT_FEED_DESC;

  get reqs(): string[] { return this.feed?.requirements || DEFAULT_FEED_REQS; }
}

/* ── OutageBanner ───────────────────────────────────────────── */
@Component({
  selector: 'app-outage-banner',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div class="api-banner" role="alert">
      <div class="api-banner__body">
        <svg class="api-banner__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L22 12L12 22L2 12Z" fill="var(--color-error)" />
          <text x="12" y="16.5" text-anchor="middle" fill="white" font-size="13" font-weight="900" font-family="sans-serif">!</text>
        </svg>
        <span class="api-banner__text">There is currently an outage affecting one or more of your APIs. Please check your configurations to resolve the issue.</span>
      </div>
      <agsup-button class="api-banner__close" (click)="dismiss.emit()" aria-label="Dismiss">&#x2715;</agsup-button>
    </div>
  `
})
export class OutageBannerComponent {
  @Output() dismiss = new EventEmitter<void>();
}

/* ── ApplicationApiPage ─────────────────────────────────────── */
@Component({
  selector: 'app-application-api-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ApiStatusComponent,
    ErrorDetailsModalComponent,
    FeedPanelComponent,
    FeedEnablePanelComponent,
    OutageBannerComponent,
    GetStartedTabComponent,
    HowToUseTabComponent,
    TroubleshootTabComponent,
    ApiDocsPageComponent,
  ],
  templateUrl: './api.component.html',
})
export class ApplicationApiPageComponent {
  @Input() applications: any[] = [];
  @Input() apiSubview: string = '';
  @Input() docsTarget: any = null;
  @Output() applicationsChange = new EventEmitter<any[]>();
  @Output() submitTicket = new EventEmitter<{ app: any; feed: any; context: string }>();
  @Output() goToTickets = new EventEmitter<void>();
  @Output() backToList = new EventEmitter<void>();
  @Output() toasted = new EventEmitter<string>();

  API_TABS = API_TABS;
  TAB_SECTIONS = TAB_SECTIONS;
  SWAGGER_BASE = SWAGGER_BASE;

  expandedApps = new Set<string>();
  expandedFeed: string | null = null;
  sort: { key: string | null; dir: string | null } = { key: null, dir: null };
  errorModal: { title: string; error: any } | null = null;
  tab = 'configure';
  bannerDismissed = false;

  private STATUS_RANK: Record<string, number> = { error: 0, partial: 1, active: 2, ready: 3 };

  get hasOutage(): boolean { return this.applications.some(a => a.status === 'error'); }

  get sortedApps(): any[] {
    if (!this.sort.key) return this.applications;
    const dir = this.sort.dir === 'asc' ? 1 : -1;
    return [...this.applications].sort((a, b) => {
      if (this.sort.key === 'status') return (this.STATUS_RANK[a.status] - this.STATUS_RANK[b.status]) * dir;
      if (this.sort.key === 'name')   return a.name.localeCompare(b.name) * dir;
      return 0;
    });
  }

  tabSections(tabId: string): { id: string; label: string }[] {
    return TAB_SECTIONS[tabId] || [];
  }

  sortClass(col: string): string {
    if (this.sort.key !== col) return '';
    return this.sort.dir === 'asc' ? 'is-sorted sort-asc' : 'is-sorted sort-desc';
  }

  isAppOpen(id: string): boolean  { return this.expandedApps.has(id); }
  isFeedOpen(id: string): boolean { return this.expandedFeed === id; }

  appActivity(app: any): string { return appActivity(app); }

  toggleApp(id: string) {
    const next = new Set(this.expandedApps);
    next.has(id) ? next.delete(id) : next.add(id);
    this.expandedApps = next;
  }

  toggleFeed(feed: any) {
    this.expandedFeed = this.expandedFeed === feed.id ? null : feed.id;
  }

  onSort(key: string) {
    if (this.sort.key !== key)        { this.sort = { key, dir: 'asc' };  return; }
    if (this.sort.dir === 'asc')      { this.sort = { key, dir: 'desc' }; return; }
    this.sort = { key: null, dir: null };
  }

  enableFeed(appId: string, feedId: string) {
    const updated = this.applications.map(a => {
      if (a.id !== appId) return a;
      const feeds = a.feeds.map((f: any) => {
        if (f.id !== feedId) return f;
        return { ...f, enabled: true, status: 'active', apiKey: makeKey(),
          endpoint: `https://api.yourcompany.com${f.name}`,
          anchor: f.name.replace(/^\//, ''),
          lastActivity: 'Less than a min ago', mins: 0 };
      });
      const allActive = feeds.every((f: any) => f.enabled);
      const anyActive = feeds.some((f: any) => f.enabled);
      const status      = a.status === 'error' ? 'error'  : allActive ? 'active'  : anyActive ? 'partial'            : a.status;
      const statusLabel = a.status === 'error' ? a.statusLabel : allActive ? 'Active' : anyActive ? 'Partially Enabled' : a.statusLabel;
      return { ...a, feeds, status, statusLabel, lastActivity: 'Less than a min ago' };
    });
    this.applicationsChange.emit(updated);
    this.expandedFeed = feedId;
    this.toasted.emit('Keys generated — feed is now active.');
  }

  regenerate(appId: string, feedId: string) {
    const updated = this.applications.map(a =>
      a.id !== appId ? a : {
        ...a,
        feeds: a.feeds.map((f: any) => f.id === feedId ? { ...f, apiKey: makeKey() } : f)
      }
    );
    this.applicationsChange.emit(updated);
    this.toasted.emit('New keys generated.');
  }

  onSubmitTicket(app: any, feed: any, context: string) {
    this.submitTicket.emit({ app, feed, context });
  }

  scrollToId(id: string) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(id);
      const scroller = el && el.closest('.page') as HTMLElement | null;
      if (!el || !scroller) return;
      const target = Math.max(0,
        el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 12);
      const start = scroller.scrollTop;
      const dist  = target - start;
      if (Math.abs(dist) < 2) return;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { scroller.scrollTop = target; return; }
      const dur = 460;
      const t0  = performance.now();
      const ease = (p: number) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        scroller.scrollTop = start + dist * ease(p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }));
  }

  onGoConfigure() { this.tab = 'configure'; this.scrollToId('cfg-table'); }
}
