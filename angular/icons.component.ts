import { Component, Input } from '@angular/core';

const SVG_DEFAULTS = `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;

/* ── Cog ─────────────────────────────────────────────────── */
@Component({ selector: 'app-icon-cog', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>` })
export class IconCogComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Plus (circle) ───────────────────────────────────────── */
@Component({ selector: 'app-icon-plus', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>` })
export class IconPlusComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── More (vertical dots) ────────────────────────────────── */
@Component({ selector: 'app-icon-more', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="5"  r="1.4" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.4" fill="currentColor"/>
  </svg>` })
export class IconMoreComponent { @Input() size = 24; }

/* ── Search ──────────────────────────────────────────────── */
@Component({ selector: 'app-icon-search', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7"/>
    <line x1="20" y1="20" x2="16.65" y2="16.65"/>
  </svg>` })
export class IconSearchComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Filter ──────────────────────────────────────────────── */
@Component({ selector: 'app-icon-filter', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>` })
export class IconFilterComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Close (X) ───────────────────────────────────────────── */
@Component({ selector: 'app-icon-close', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>` })
export class IconCloseComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Check ───────────────────────────────────────────────── */
@Component({ selector: 'app-icon-check', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>` })
export class IconCheckComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Chevrons ────────────────────────────────────────────── */
@Component({ selector: 'app-icon-chevron-left', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>` })
export class IconChevronLeftComponent { @Input() size = 24; @Input() stroke = 2; }

@Component({ selector: 'app-icon-chevron-right', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>` })
export class IconChevronRightComponent { @Input() size = 24; @Input() stroke = 2; }

@Component({ selector: 'app-icon-chevron-down', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>` })
export class IconChevronDownComponent { @Input() size = 24; @Input() stroke = 2; }

@Component({ selector: 'app-icon-chevrons-left', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="11 17 6 12 11 7"/>
    <polyline points="18 17 13 12 18 7"/>
  </svg>` })
export class IconChevronsLeftComponent { @Input() size = 24; @Input() stroke = 2; }

@Component({ selector: 'app-icon-chevrons-right', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="13 17 18 12 13 7"/>
    <polyline points="6 17 11 12 6 7"/>
  </svg>` })
export class IconChevronsRightComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Arrow Right ─────────────────────────────────────────── */
@Component({ selector: 'app-icon-arrow-right', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>` })
export class IconArrowRightComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Eye / EyeOff ────────────────────────────────────────── */
@Component({ selector: 'app-icon-eye', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>` })
export class IconEyeComponent { @Input() size = 24; @Input() stroke = 2; }

@Component({ selector: 'app-icon-eye-off', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>` })
export class IconEyeOffComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Copy ────────────────────────────────────────────────── */
@Component({ selector: 'app-icon-copy', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>` })
export class IconCopyComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── External ────────────────────────────────────────────── */
@Component({ selector: 'app-icon-external', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>` })
export class IconExternalComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Download ────────────────────────────────────────────── */
@Component({ selector: 'app-icon-download', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>` })
export class IconDownloadComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Caret (small disclosure triangle) ───────────────────── */
@Component({ selector: 'app-icon-caret', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 16 16"
       fill="currentColor" aria-hidden="true">
    <path d="M5 3l6 5-6 5V3z"/>
  </svg>` })
export class IconCaretComponent { @Input() size = 16; }

/* ── Pencil ──────────────────────────────────────────────── */
@Component({ selector: 'app-icon-pencil', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>` })
export class IconPencilComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Ban ─────────────────────────────────────────────────── */
@Component({ selector: 'app-icon-ban', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>` })
export class IconBanComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Menu (hamburger) ────────────────────────────────────── */
@Component({ selector: 'app-icon-menu', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>` })
export class IconMenuComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Alert ───────────────────────────────────────────────── */
@Component({ selector: 'app-icon-alert', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8"  x2="12"   y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>` })
export class IconAlertComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Info ────────────────────────────────────────────────── */
@Component({ selector: 'app-icon-info', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12"   y2="12"/>
    <line x1="12" y1="8"  x2="12.01" y2="8"/>
  </svg>` })
export class IconInfoComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Envelope ────────────────────────────────────────────── */
@Component({ selector: 'app-icon-envelope', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>` })
export class IconEnvelopeComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Check Circle ────────────────────────────────────────── */
@Component({ selector: 'app-icon-check-circle', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>` })
export class IconCheckCircleComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Phone ───────────────────────────────────────────────── */
@Component({ selector: 'app-icon-phone', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" [attr.stroke-width]="stroke"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>` })
export class IconPhoneComponent { @Input() size = 24; @Input() stroke = 2; }

/* ── Phone Circle ────────────────────────────────────────── */
@Component({ selector: 'app-icon-phone-circle', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="currentColor"/>
    <path fill="#2D65B4" d="M7.53271 4.93333C7.59938 4.93333 7.59938 4.93333 7.53271 4.93333C7.59938 5 7.59938 5.06667 7.59938 5.13333C7.66605 5.4 7.79938 5.8 7.93271 6.26667C8.39938 7.46667 8.59938 8 8.66605 8.2C8.53271 8.46667 8.33271 8.66667 8.06605 8.93333C7.33271 9.6 7.19938 10.2667 7.53271 11C7.79938 11.5333 8.59938 13 9.73271 14.1333L9.86605 14.2667C11.066 15.4 12.466 16.2 12.9994 16.4667C13.1994 16.6 13.3994 16.6 13.666 16.6C14.3327 16.6 14.7994 16.1333 15.066 15.8667L15.1327 15.8C15.3994 15.4667 15.5994 15.3333 15.866 15.2C16.066 15.2667 16.5994 15.4667 17.7994 15.8667C18.1994 16 18.5994 16.1333 18.9327 16.2667C18.9994 16.2667 19.066 16.3333 19.1327 16.3333C19.1327 16.4667 19.1327 16.6 19.1327 16.7333C19.066 17.0667 18.866 17.4667 18.7994 17.6L18.7327 17.6667C18.3327 18.0667 17.666 18.8 16.1994 18.9333C16.1327 18.9333 16.066 18.9333 16.066 18.9333C14.466 18.9333 11.3327 17.4667 8.93271 15.0667C6.39938 12.7333 4.86605 9.46667 4.93271 7.93333C5.06605 6.46667 5.79938 5.8 6.19938 5.4L6.33271 5.33333C6.46605 5.26667 6.86605 5.06667 7.19938 5C7.26605 5 7.46605 4.93333 7.53271 4.93333Z"/>
  </svg>` })
export class IconPhoneCircleComponent { @Input() size = 24; }

/* ── Sort Arrows ─────────────────────────────────────────── */
@Component({ selector: 'app-sort-arrows', standalone: true, template: `
  <span class="sort-arrows" aria-hidden="true">
    <svg class="arrow-up"   width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path d="M4 0L8 5H0L4 0Z" fill="currentColor"/>
    </svg>
    <svg class="arrow-down" width="8" height="5" viewBox="0 0 8 5" fill="none" style="margin-top:2px">
      <path d="M4 5L0 0H8L4 5Z" fill="currentColor"/>
    </svg>
  </span>` })
export class SortArrowsComponent {}

/* ── Plan Logo ───────────────────────────────────────────── */
@Component({ selector: 'app-plan-logo', standalone: true, template: `
  <svg class="sidebar__logo-svg" width="64" height="64" viewBox="0 0 64 64"
       fill="none" aria-label="Plan Logo">
    <circle cx="32" cy="32" r="27" stroke="#1A1A1A" stroke-width="2" fill="none"/>
    <circle cx="32" cy="24" r="4.5" stroke="#2D65B4" stroke-width="2.4" fill="none"/>
    <circle cx="22" cy="28" r="4"   stroke="#2D65B4" stroke-width="2.4" fill="none"/>
    <circle cx="42" cy="28" r="4"   stroke="#2D65B4" stroke-width="2.4" fill="none"/>
    <path d="M27 36c0-2.5 2.2-4 5-4s5 1.5 5 4v3h-10v-3z"
          stroke="#2D65B4" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
    <path d="M16 40c0-2.4 2.5-3.6 6-3.6 1.5 0 2.8.2 3.8.7"
          stroke="#2D65B4" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M48 40c0-2.4-2.5-3.6-6-3.6-1.5 0-2.8.2-3.8.7"
          stroke="#2D65B4" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>` })
export class PlanLogoComponent {}

/* ── Help Filled ─────────────────────────────────────────── */
@Component({ selector: 'app-icon-help-filled', standalone: true, template: `
  <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 1.5C13.9523 1.5 15.8476 2.04533 17.4854 3.04883C17.5158 3.06596 17.5459 3.08376 17.5742 3.10547C18.2388 3.52188 18.8614 4.01179 19.4248 4.5752C19.983 5.13335 20.4689 5.7497 20.8828 6.40723C20.9108 6.44148 20.9312 6.48001 20.9521 6.51758C21.9546 8.15478 22.5 10.0487 22.5 12C22.5 13.951 21.9544 15.8444 20.9521 17.4814C20.9331 17.5157 20.9145 17.5505 20.8896 17.582C20.4743 18.2436 19.986 18.8636 19.4248 19.4248C18.8636 19.986 18.2436 20.4743 17.582 20.8896C17.5505 20.9145 17.5157 20.9331 17.4814 20.9521C15.8444 21.9544 13.951 22.5 12 22.5C10.0487 22.5 8.15478 21.9546 6.51758 20.9521C6.48022 20.9313 6.44228 20.9106 6.4082 20.8828C5.75041 20.4688 5.13354 19.9832 4.5752 19.4248C4.01419 18.8638 3.52563 18.2443 3.11035 17.583C3.08369 17.5493 3.06301 17.5124 3.04297 17.4756C2.04327 15.84 1.5 13.9484 1.5 12C1.5 10.0513 2.04299 8.15917 3.04297 6.52344C3.06476 6.4835 3.08759 6.44348 3.11719 6.40723C3.53112 5.7497 4.01704 5.13335 4.5752 4.5752C5.13704 4.01335 5.75747 3.52407 6.41992 3.1084C6.44951 3.08527 6.4817 3.06689 6.51367 3.04883C8.15163 2.04505 10.0474 1.5 12 1.5ZM12.249 16.4912C12.1663 16.4958 12.0833 16.5 12 16.5C11.9164 16.5 11.8331 16.4958 11.75 16.4912L8.12012 20.1201C9.32052 20.6935 10.6444 21 12 21C13.355 21 14.678 20.693 15.8779 20.1201L12.249 16.4912ZM4.66602 17.2119C4.95548 17.6193 5.2777 18.0062 5.63574 18.3643C5.99327 18.7218 6.3794 19.0439 6.78613 19.333L10.0605 16.0596C9.60401 15.8414 9.18301 15.5463 8.81836 15.1816C8.4534 14.8167 8.15772 14.3955 7.93945 13.9385L4.66602 17.2119ZM16.0596 13.9395C15.8414 14.396 15.5463 14.817 15.1816 15.1816C14.8168 15.5465 14.3953 15.8413 13.9385 16.0596L17.2119 19.333C17.6191 19.0436 18.0063 18.7222 18.3643 18.3643C18.722 18.0065 19.0437 17.6199 19.333 17.2129L16.0596 13.9395ZM16.4912 11.75C16.4958 11.8331 16.5 11.9164 16.5 12C16.5 12.0836 16.4958 12.1669 16.4912 12.25L20.1201 15.8789C20.6933 14.6787 21 13.3553 21 12C21 10.6444 20.6935 9.32052 20.1201 8.12012L16.4912 11.75ZM3.87891 8.12109C3.30587 9.32118 3 10.6448 3 12C3 13.3549 3.30611 14.6781 3.87891 15.8779L7.50781 12.249C7.50323 12.1663 7.5 12.0833 7.5 12C7.5 11.9164 7.50319 11.8331 7.50781 11.75L3.87891 8.12109ZM12 9C11.2044 9 10.4415 9.3163 9.87891 9.87891C9.3163 10.4415 9 11.2044 9 12C9 12.7956 9.3163 13.5585 9.87891 14.1211C10.4415 14.6837 11.2044 15 12 15C12.7956 15 13.5585 14.6837 14.1211 14.1211C14.6837 13.5585 15 12.7956 15 12C15 11.2044 14.6837 10.4415 14.1211 9.87891C13.5585 9.3163 12.7956 9 12 9ZM6.78613 4.66602C6.37923 4.95525 5.99341 5.27808 5.63574 5.63574C5.27789 5.9936 4.95537 6.37997 4.66602 6.78711L7.93945 10.0605C8.15769 9.60387 8.45361 9.18311 8.81836 8.81836C9.18311 8.45361 9.60387 8.15769 10.0605 7.93945L6.78613 4.66602ZM13.9385 7.93945C14.3955 8.15772 14.8167 8.4534 15.1816 8.81836C15.5463 9.18301 15.8414 9.60401 16.0596 10.0605L19.333 6.78613C19.0439 6.3794 18.7218 5.99327 18.3643 5.63574C18.0064 5.27789 17.62 4.95537 17.2129 4.66602L13.9385 7.93945ZM12 3C10.6445 3 9.32041 3.30562 8.12012 3.87891L11.75 7.50781C11.8331 7.50319 11.9164 7.5 12 7.5C12.0833 7.5 12.1663 7.50323 12.249 7.50781L15.8789 3.87891C14.6788 3.30587 13.3552 3 12 3Z" fill="currentColor"/>
  </svg>` })
export class IconHelpFilledComponent { @Input() size = 24; }
