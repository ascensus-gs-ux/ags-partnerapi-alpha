import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

/* ── StepCheck ─────────────────────────────────────────────── */
@Component({
  selector: 'app-step-check',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `
})
export class StepCheckComponent {}

/* ── StepArrow ─────────────────────────────────────────────── */
@Component({
  selector: 'app-step-arrow',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  `
})
export class StepArrowComponent {}

/* ── StepItem ──────────────────────────────────────────────── */
@Component({
  selector: 'app-step-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, StepCheckComponent, StepArrowComponent],
  template: `
    <li [class]="'tfa-step tfa-step--' + status">
      <span class="tfa-step__circle">
        <app-step-check *ngIf="status === 'complete'"></app-step-check>
        <app-step-arrow *ngIf="status === 'current'"></app-step-arrow>
      </span>
      <span class="tfa-step__label">{{ label }}</span>
    </li>
  `
})
export class StepItemComponent {
  @Input() status: string = '';
  @Input() label: string = '';
}

/* ── Stepper ───────────────────────────────────────────────── */
@Component({
  selector: 'app-stepper',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, StepItemComponent],
  template: `
    <ul class="tfa__steps">
      <app-step-item status="complete" label="Login Information Verification"></app-step-item>
      <app-step-item [status]="step >= 2 ? 'complete' : 'current'" label="PIN Request"></app-step-item>
      <app-step-item [status]="step >= 2 ? 'current' : 'future'" label="PIN Authentication"></app-step-item>
    </ul>
  `
})
export class StepperComponent {
  @Input() step: number = 1;
}

/* ── HelpBlock ─────────────────────────────────────────────── */
@Component({
  selector: 'app-help-block',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div [class]="className">
      <span class="tfa__help-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="currentColor"/>
        </svg>
      </span>
      <p class="tfa__help-text">
        <strong>Need help?</strong> Please call Customer Service at (123) 456-7890,
        Monday-Friday 8:00 am to 5:00 pm ET.
      </p>
    </div>
  `
})
export class HelpBlockComponent {
  @Input() className: string = '';
}

/* ── TwoFactorScreen ───────────────────────────────────────── */
@Component({
  selector: 'app-two-factor-screen',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, StepperComponent, HelpBlockComponent],
  templateUrl: './twofactor.component.html',
  styleUrls: ['../twofactor.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TwoFactorScreenComponent implements OnInit {
  @Input() initialStep: number = 1;
  @Input() logoUrl: string = '';
  @Output() onComplete = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  LOGO: string = 'assets/partner-logo-placeholder.svg';
  step: number = 1;
  method: string | null = null;
  methodError: boolean = false;
  pin: string = '';
  pinError: string = '';
  confirmCancel: boolean = false;

  ngOnInit() {
    this.step = this.initialStep;
    this.LOGO = this.logoUrl || 'assets/partner-logo-placeholder.svg';
  }

  get subtitle(): string {
    return this.step === 1
      ? 'Select a method to send a temporary PIN'
      : 'Enter the requested PIN';
  }

  handleNext() {
    if (this.step === 1) {
      if (!this.method) { this.methodError = true; return; }
      this.step = 2;
      return;
    }
    if (!/^\d{6}$/.test(this.pin)) {
      this.pinError = 'Please enter the 6-digit PIN.';
      return;
    }
    this.onComplete.emit();
  }

  handleBack() {
    if (this.step === 2) { this.step = 1; this.pinError = ''; return; }
    this.onCancel.emit();
  }

  setMethod(value: string) {
    this.method = value;
    this.methodError = false;
  }

  onPinInput(value: string) {
    this.pin = value.replace(/\D/g, '').slice(0, 6);
    if (this.pinError) this.pinError = '';
  }

  onPinKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.handleNext();
  }
}
