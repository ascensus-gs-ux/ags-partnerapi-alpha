import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IconAlertComponent, IconCheckCircleComponent, IconEnvelopeComponent,
  IconEyeComponent, IconEyeOffComponent, IconPhoneCircleComponent
} from './icons.component';

const MOCK_EMAIL = 'dev@demo.com';
const MOCK_PASSWORD = 'password123';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, FormsModule,
    IconAlertComponent, IconCheckCircleComponent, IconEnvelopeComponent,
    IconEyeComponent, IconEyeOffComponent, IconPhoneCircleComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['../login.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginScreenComponent implements OnChanges, OnDestroy {
  @Input() notice: string | null = null;
  @Input() logoUrl: string = '';
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onForgotPassword = new EventEmitter<void>();
  @Output() onClearNotice = new EventEmitter<void>();

  LOGO: string = 'assets/partner-logo-placeholder.svg';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  error: boolean = false;
  loading: boolean = false;

  private noticeTimer: any;

  ngOnChanges() {
    this.LOGO = this.logoUrl || 'assets/partner-logo-placeholder.svg';
    if (this.notice) {
      clearTimeout(this.noticeTimer);
      this.noticeTimer = setTimeout(() => this.onClearNotice.emit(), 3600);
    }
  }

  ngOnDestroy() {
    clearTimeout(this.noticeTimer);
  }

  submit(e: Event) {
    e.preventDefault();
    if (this.loading) return;
    this.error = false;
    this.loading = true;
    setTimeout(() => {
      const ok =
        this.email.trim().toLowerCase() === MOCK_EMAIL &&
        this.password === MOCK_PASSWORD;
      if (ok) {
        this.onSuccess.emit();
      } else {
        this.loading = false;
        this.error = true;
      }
    }, 650);
  }

  onEmailChange(value: string) {
    this.email = value;
    if (this.error) this.error = false;
  }

  onPasswordChange(value: string) {
    this.password = value;
    if (this.error) this.error = false;
  }
}
