import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

const SWAGGER_URL = 'https://agsup-aws-account-web-qc4.gs.ascensus.com/accounts/swagger-ui/index.html';

const ONBOARDING = [
  { title: 'Access Swagger', link: 'swagger', desc: 'Open the full API reference to review every account-service endpoint, request shape, and response code.' },
  { title: 'Set up your API key', link: 'configure', desc: 'Generate a key on each feed you intend to use in Configure APIs. Store it securely and present it as an ApiKey authorization header.' },
  { title: 'Whitelist IPs & confirm credentials', desc: 'Provide your egress CIDR ranges for non-production allow-listing and register your X.509 public certificate for assertion signing.' }
];

const PARTNER_REQS = [
  'API keys — one per enabled feed, presented as an ApiKey authorization header on every request.',
  'Egress IP ranges — your CIDR blocks, allow-listed by Ascensus for all non-production environments.',
  'Authentication — a single X.509 public certificate that signs both your client assertion and user assertion (private_key_jwt).'
];

const GLOSSARY = [
  ['API', 'A direct, server-to-server interface to the Ascensus account service. Used here for contributions.'],
  ['MFE', 'Micro Front End — an Ascensus-hosted experience you embed and reach through Partner SSO (withdrawals, exchanges).'],
  ['Feed', 'A single enableable data stream within an application. Enabling a feed generates its API key.'],
  ['API Key', 'The credential presented on each request as an ApiKey authorization header.'],
  ['Assertion', 'A short-lived, signed JWT. The client assertion identifies your system; the user assertion conveys end-user context.'],
  ['Status 91', 'The active account status. Only status 91 accounts can be modified through the API.'],
  ['Freeze code', 'A restriction on an account that blocks contributions and other transactions until removed.']
];

const FREEZE_CODES = [
  ['5','Block All Transactions'],['22','Block Contributions'],['21','CID Block All'],
  ['29','Death Notification'],['11','Legal'],['13','OFAC'],['7','10 Day Block'],
  ['19','Invalid SSN'],['9','Written Request'],['27','CID Block Contributions'],
  ['23','Abandoned Account'],['31','CID Trustee']
];

const COMMON_ERRORS = [
  { error: 'Contribution failed', cause: 'A freeze code is present on the account.', resolution: 'Remove the restriction, or submit against an eligible account.' },
  { error: 'Account cannot be modified', cause: 'The account is not in status 91 (active).', resolution: 'Only status 91 accounts can be modified. Confirm the account status before retrying.' },
  { error: 'HTTP 401 Unauthorized', cause: 'The API key was revoked or expired after the last key rotation.', resolution: 'CONFIGURE_LINK' },
  { error: 'HTTP 403 Forbidden — web access disabled', cause: 'Web access is disabled for the account, so the API rejects activity.', resolution: 'TICKET_LINK' },
  { error: 'HTTP 403 Forbidden — invalid signature', cause: 'The x-signature header could not be verified against the signing key.', resolution: 'Sign the request with the registered key pair and confirm the certificate has not expired.' },
  { error: 'HTTP 400 Validation error', cause: 'One or more request fields failed validation (e.g. an invalid routing number).', resolution: 'Read the field-level errors in the response body, correct each field, and resubmit.' }
];

const SLA = [
  ['Sev 1 — Critical', 'Production integration down or contributions fully blocked', '1 hour'],
  ['Sev 2 — High', 'Major function impaired with no workaround', '4 business hours'],
  ['Sev 3 — Medium', 'Minor or intermittent issue with a workaround', '1 business day'],
  ['Sev 4 — Low', 'Question, documentation, or enhancement request', '2 business days']
];

const TOKEN_CURL = `curl --location 'https://domain.partner.com/services/oauth2/token' \\
  --header 'x-request-id: <UUID v4>' \\
  --header 'Content-Type: application/x-www-form-urlencoded' \\
  --data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' \\
  --data-urlencode 'client_assertion=eyJhbGciO........7Y83Q' \\
  --data-urlencode 'client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer' \\
  --data-urlencode 'scope=partner-sso openid metadata' \\
  --data-urlencode 'client_id=A5935CBCE10343B4A89A511E9D236B18' \\
  --data-urlencode 'user_assertion=Gci........OiJ' \\
  --data-urlencode 'code_verifier=xm........so'`;

const USER_ASSERTION = `{
  "iss": "https://domain.partner.com",
  "sub": "03E1AFF244C2EF89E0638D1F19AC1F78",
  "nbf": 1767210764,
  "exp": 1767210764,
  "iat": 1767207164,
  "jti": "7A44F6DA-DD5D-4C56-9585-5CE0051F9F82",
  "cid": "FCB5459B0E6547DD9FC03AAF3FDA640A",
  "brd": "[Brand Code]",
  "eul": "89ACE456-DA5B-4C65-9689-5CE3498F9F24",
  "cvc": "xm6iRaHwaHRFuiMclILq5lAjbs16a89KuDXZ8fNtJso",
  "chm": "S256"
}`;

const RESTRICTIONS_JSON = `{
  "accountId": "03E1AFF244C2EF89E0638D1F19AC1F78",
  "accountStatus": "91",
  "webDisabled": false,
  "restrictions": [
    { "code": "22", "description": "Block Contributions", "effectiveDate": "2026-02-18", "source": "Servicing" },
    { "code": "13", "description": "OFAC", "effectiveDate": "2026-01-09", "source": "Compliance" },
    { "code": "7",  "description": "10 Day Block", "effectiveDate": "2026-05-30", "source": "Risk" }
  ]
}`;

/* ── GetStartedTab ─────────────────────────────────────────── */
@Component({
  selector: 'app-get-started-tab',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './get-started-tab.component.html',
})
export class GetStartedTabComponent {
  @Output() onGoConfigure = new EventEmitter<void>();
  @Output() onGoTickets   = new EventEmitter<void>();
  @Output() onGoTroubleshoot = new EventEmitter<void>();

  SWAGGER_URL = SWAGGER_URL;
  ONBOARDING  = ONBOARDING;
  PARTNER_REQS = PARTNER_REQS;
  GLOSSARY = GLOSSARY;

  faqOpen: number | null = null;
  toggleFaq(i: number) { this.faqOpen = this.faqOpen === i ? null : i; }

  holidays = [
    ['New Year\'s Day','Thu, Jan 1, 2026'],['Martin Luther King Jr. Day','Mon, Jan 19, 2026'],
    ['Presidents\' Day','Mon, Feb 16, 2026'],['Memorial Day','Mon, May 25, 2026'],
    ['Juneteenth','Fri, Jun 19, 2026'],['Independence Day (observed)','Fri, Jul 3, 2026'],
    ['Labor Day','Mon, Sep 7, 2026'],['Columbus Day','Mon, Oct 12, 2026'],
    ['Veterans Day','Wed, Nov 11, 2026'],['Thanksgiving Day','Thu, Nov 26, 2026'],
    ['Christmas Day','Fri, Dec 25, 2026']
  ];
}

/* ── HowToUseTab ───────────────────────────────────────────── */
@Component({
  selector: 'app-how-to-use-tab',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './how-to-use-tab.component.html',
})
export class HowToUseTabComponent {
  @Output() onToast = new EventEmitter<string>();
  @Output() onGoConfigure = new EventEmitter<void>();
  @Output() onGoTickets   = new EventEmitter<void>();

  SWAGGER_URL = SWAGGER_URL;
  TOKEN_CURL = TOKEN_CURL;
  USER_ASSERTION = USER_ASSERTION;
  RESTRICTIONS_JSON = RESTRICTIONS_JSON;
  FREEZE_CODES = FREEZE_CODES;

  restrictionOpen: number | null = null;
  toggleRestriction(i: number) { this.restrictionOpen = this.restrictionOpen === i ? null : i; }

  copied: Record<string, boolean> = {};
  copy(key: string, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    this.copied[key] = true;
    this.onToast.emit('Copied to clipboard');
    setTimeout(() => { this.copied[key] = false; }, 1600);
  }
}

/* ── TroubleshootTab ───────────────────────────────────────── */
@Component({
  selector: 'app-troubleshoot-tab',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  templateUrl: './troubleshoot-tab.component.html',
})
export class TroubleshootTabComponent {
  @Output() onGoTickets   = new EventEmitter<void>();
  @Output() onGoConfigure = new EventEmitter<void>();

  COMMON_ERRORS = COMMON_ERRORS;
  SLA = SLA;
}
