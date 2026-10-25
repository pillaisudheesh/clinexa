import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const secure = this.config.get<string>('SMTP_SECURE', 'false') === 'true';
    const user = this.config.getOrThrow<string>('SMTP_USER');
    const pass = this.config.getOrThrow<string>('SMTP_PASS');

    this.from = this.config.getOrThrow<string>('SMTP_FROM');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  private getFrontendUrl(): string {
    return this.config.getOrThrow<string>('FRONTEND_URL').replace(/\/+$/, '');
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[character];
    });
  }

  private renderEmail(
    title: string,
    greeting: string,
    message: string,
    action?: { label: string; url: string },
    notice?: string,
  ): string {
    const safeTitle = this.escapeHtml(title);
    const safeGreeting = this.escapeHtml(greeting);
    const safeMessage = this.escapeHtml(message);
    const safeNotice = notice ? this.escapeHtml(notice) : '';
    const logo = this.config.getOrThrow<string>('EMAIL_LOGO_URL');

    const button = action
      ? `
        <tr>
          <td align="center" style="padding: 28px 0 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td bgcolor="#007f73" style="border-radius: 10px;">
                  <a href="${this.escapeHtml(action.url)}"
                     style="display: inline-block; padding: 15px 30px;
                            color: #ffffff; font-family: Arial, sans-serif;
                            font-size: 15px; font-weight: bold;
                            text-decoration: none; border-radius: 10px;">
                    ${this.escapeHtml(action.label)}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 24px; color: #64748b;
                     font-size: 12px; line-height: 20px;
                     overflow-wrap: anywhere;">
            If the button doesn't work, copy and paste this link into
            your browser:<br />
            <a href="${this.escapeHtml(action.url)}"
               style="color: #007f73; word-break: break-all;">
              ${this.escapeHtml(action.url)}
            </a>
          </td>
        </tr>`
      : '';

    const noticeBlock = notice
      ? `
        <tr>
          <td style="padding: 16px; background: #f0fdfa;
                     border: 1px solid #ccfbf1; border-radius: 10px;
                     color: #115e59; font-size: 13px; line-height: 21px;">
            ${safeNotice}
          </td>
        </tr>`
      : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background: #f3f8f7;
             font-family: Arial, Helvetica, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
         border="0" style="background: #f3f8f7;">
    <tr>
      <td align="center" style="padding: 36px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
               border="0"
               style="max-width: 560px; background: #ffffff;
                      border: 1px solid #e2e8f0; border-radius: 18px;
                      overflow: hidden;">
          <tr>
          <td align="center"
              style="padding: 28px 24px 22px; border-bottom: 1px solid #edf2f7;">
            <img
              src="${logo}"
              alt="SamaRoot"
              width="180"
              style="display: block; width: 180px; max-width: 100%;
                    height: auto; border: 0; outline: none;
                    text-decoration: none;"
            />
            <p style="margin: 10px 0 0; color: #64748b;
                      font-family: Arial, sans-serif; font-size: 11px;">
              Smarter Care. Better Outcomes.
            </p>
          </td>
        </tr>
          <tr>
            <td style="padding: 32px 28px 30px;">
              <h1 style="margin: 0 0 22px; color: #152238;
                         font-size: 25px; line-height: 33px;
                         letter-spacing: -0.5px;">
                ${safeTitle}
              </h1>
              <p style="margin: 0 0 14px; font-size: 15px;
                        line-height: 24px;">
                ${safeGreeting}
              </p>
              <p style="margin: 0; color: #475569; font-size: 14px;
                        line-height: 24px;">
                ${safeMessage}
              </p>
              <table role="presentation" width="100%" cellspacing="0"
                     cellpadding="0" border="0">
                ${button}
                ${noticeBlock}
              </table>
              <p style="margin: 24px 0 0; color: #64748b;
                        font-size: 12px; line-height: 20px;">
                If you didn't request this, or weren't expecting this email,
                please contact your clinic administrator if necessary.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center"
                style="padding: 20px 24px; background: #f8fafc;
                       border-top: 1px solid #edf2f7;">
              <p style="margin: 0; color: #64748b; font-size: 11px;
                        line-height: 18px;">
                Secure Healthcare Management
              </p>
              <p style="margin: 5px 0 0; color: #94a3b8;
                        font-size: 11px;">
                &copy; SamaRoot
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendTemporaryPassword(
    email: string,
    firstName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const frontendUrl = this.getFrontendUrl();
    const loginUrl = `${frontendUrl}/login`;
    const safeName = this.escapeHtml(firstName || 'there');

    const html = this.renderEmail(
      'Your SamaRoot account is ready',
      `Hello ${safeName},`,
      'Your account has been created successfully. Use the login button below and the temporary password provided here to sign in.',
      { label: 'Sign in to SamaRoot', url: loginUrl },
      'Temporary password: ' +
        temporaryPassword +
        '. For your security, sign in and change this password immediately.',
    );
    const recipient =
      process.env.NODE_ENV === 'production'
        ? email
        : 'sudheesh_pillai@hotmail.com';

    await this.transporter.sendMail({
      from: this.from,
      to: recipient,
      subject: 'Your SamaRoot account is ready',
      text: [
        `Hello ${firstName || 'there'},`,
        '',
        'Your SamaRoot account has been created.',
        `Login: ${loginUrl}`,
        `Temporary password: ${temporaryPassword}`,
        '',
        'Please sign in and change your password immediately.',
        'If you were not expecting this account, contact your administrator.',
      ].join('\n'),
      html,
    });

    this.logger.log('Temporary-password email sent.');
  }

  async sendPasswordReset(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const html = this.renderEmail(
      'Reset your password',
      `Hello ${firstName || 'there'},`,
      'We received a request to reset the password for your SamaRoot account. Use the button below to choose a new password.',
      { label: 'Reset password', url: resetUrl },
      'This link expires in 30 minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.',
    );

    const recipient =
      process.env.NODE_ENV === 'production'
        ? email
        : 'sudheesh_pillai@hotmail.com';

    await this.transporter.sendMail({
      from: this.from,
      to: recipient,
      subject: 'Reset your SamaRoot password',
      text: [
        `Hello ${firstName || 'there'},`,
        '',
        'We received a request to reset your password.',
        `Use this link to reset it: ${resetUrl}`,
        '',
        'This link expires in 30 minutes and can only be used once.',
        'If you did not request this, you can ignore this email.',
      ].join('\n'),
      html,
    });

    this.logger.log('Password-reset email sent.');
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
    this.logger.log('SMTP connection verified.');
  }
}
