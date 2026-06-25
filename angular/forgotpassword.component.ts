import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

/* ── FpStepCheck ───────────────────────────────────────────── */
@Component({
  selector: 'app-fp-step-check',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `
})
export class FpStepCheckComponent {}

/* ── FpStepArrow ───────────────────────────────────────────── */
@Component({
  selector: 'app-fp-step-arrow',
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
export class FpStepArrowComponent {}

/* ── FpStepItem ────────────────────────────────────────────── */
@Component({
  selector: 'app-fp-step-item',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FpStepCheckComponent, FpStepArrowComponent],
  template: `
    <li [class]="'tfa-step tfa-step--' + status">
      <span class="tfa-step__circle">
        <app-fp-step-check *ngIf="status === 'complete'"></app-fp-step-check>
        <app-fp-step-arrow *ngIf="status === 'current'"></app-fp-step-arrow>
      </span>
      <span class="tfa-step__label">{{ label }}</span>
    </li>
  `
})
export class FpStepItemComponent {
  @Input() status: string = '';
  @Input() label: string = '';
}

/* ── FpStepper ─────────────────────────────────────────────── */
@Component({
  selector: 'app-fp-stepper',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FpStepItemComponent],
  template: `
    <ul class="tfa__steps">
      <app-fp-step-item [status]="statusFor(1)" label="Login Information Verification"></app-fp-step-item>
      <app-fp-step-item [status]="statusFor(2)" label="PIN Request"></app-fp-step-item>
      <app-fp-step-item [status]="statusFor(3)" label="PIN Authentication"></app-fp-step-item>
      <app-fp-step-item [status]="statusFor(4)" label="Create New Password"></app-fp-step-item>
    </ul>
  `
})
export class FpStepperComponent {
  @Input() step: number = 1;

  statusFor(n: number): string {
    return this.step > n ? 'complete' : this.step === n ? 'current' : 'future';
  }
}

/* ── FpHelpBlock ───────────────────────────────────────────── */
@Component({
  selector: 'app-fp-help-block',
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
export class FpHelpBlockComponent {
  @Input() className: string = '';
}

/* ── ForgotPasswordScreen ──────────────────────────────────── */
@Component({
  selector: 'app-forgot-password-screen',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FpStepperComponent, FpHelpBlockComponent],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['../twofactor.css', '../forgotpassword.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordScreenComponent implements OnInit {
  @Input() initialStep: number = 1;
  @Input() logoUrl: string = '';
  @Output() onComplete = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  LOGO: string = 'assets/partner-logo-placeholder.svg';
  step: number = 1;

  email: string = '';
  emailError: string = '';

  method: string | null = null;
  methodError: boolean = false;

  pin: string = '';
  pinError: string = '';

  pw: string = '';
  pwConfirm: string = '';
  pwError: string = '';

  confirmCancel: boolean = false;

  ngOnInit() {
    this.step = this.initialStep;
    this.LOGO = this.logoUrl || 'assets/partner-logo-placeholder.svg';
  }

  get title(): string {
    return this.step === 4 ? 'Choose a new password' : 'Let\'s verify your login information';
  }

  get subtitle(): string {
    if (this.step === 1) return 'Please enter your email address';
    if (this.step === 2) return 'Select a method to send a temporary PIN';
    if (this.step === 3) return 'Enter the requested PIN';
    return 'Create and confirm your new password';
  }

  get screenLabel(): string {
    if (this.step === 1) return 'Forgot Password — Verify Login';
    if (this.step === 2) return 'Forgot Password — PIN Request';
    if (this.step === 3) return 'Forgot Password — PIN Authentication';
    return 'Forgot Password — Create New Password';
  }

  handleNext() {
    if (this.step === 1) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
      if (!ok) { this.emailError = 'Please enter a valid email address.'; return; }
      this.step = 2; return;
    }
    if (this.step === 2) {
      if (!this.method) { this.methodError = true; return; }
      this.step = 3; return;
    }
    if (this.step === 3) {
      if (!/^\d{6}$/.test(this.pin)) { this.pinError = 'Please enter the 6-digit PIN.'; return; }
      this.step = 4; return;
    }
    if (this.pw.length < 8) { this.pwError = 'Password must be at least 8 characters.'; return; }
    if (this.pw !== this.pwConfirm) { this.pwError = 'Passwords don\'t match. Please re-enter.'; return; }
    this.step = 5;
  }

  handleBack() {
    if (this.step > 1) { this.step = this.step - 1; return; }
    this.onCancel.emit();
  }

  setMethod(value: string) {
    this.method = value;
    this.methodError = false;
  }

  onEmailInput(value: string) {
    this.email = value;
    if (this.emailError) this.emailError = '';
  }

  onPinInput(value: string) {
    this.pin = value.replace(/\D/g, '').slice(0, 6);
    if (this.pinError) this.pinError = '';
  }

  onPwInput(value: string) {
    this.pw = value;
    if (this.pwError) this.pwError = '';
  }

  onPwConfirmInput(value: string) {
    this.pwConfirm = value;
    if (this.pwError) this.pwError = '';
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') this.handleNext();
  }
}
