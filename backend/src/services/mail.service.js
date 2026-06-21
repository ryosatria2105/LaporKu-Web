import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.MAIL.HOST,
  port: env.MAIL.PORT,
  secure: false,
  auth: {
    user: env.MAIL.USER,
    pass: env.MAIL.PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

export async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: `"${env.MAIL.FROM_NAME}" <${env.MAIL.USER}>`,
    to,
    subject,
    html,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'LaporKu Mailer 1.0',
      'Message-ID': `<${Date.now()}@laporku.app>`,
    }
  });
  console.log(`[MAIL] Email terkirim ke ${to} — MessageID: ${info.messageId}`);
  return info;
}

export async function sendResetPasswordOtpMail(email, nama, code) {
  return sendMail({
    to: email,
    subject: 'Kode OTP Reset Password LaporKu',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f4f8ff;border-radius:12px;">
        <h2 style="color:#1a2a4a;">🔑 Reset Password LaporKu</h2>
        <p>Halo, <strong>${nama}</strong>!</p>
        <p>Kode OTP untuk reset password kamu:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1aaa5a;padding:16px;background:#fff;border-radius:8px;text-align:center;">
          ${code}
        </div>
        <p style="color:#6d84a8;font-size:13px;margin-top:16px;">
          ⏱️ Berlaku <strong>5 menit</strong><br>
          🔒 Jangan bagikan kode ini ke siapapun.<br>
          ⚠️ Abaikan email ini jika bukan kamu yang meminta.
        </p>
      </div>
    `,
  });
}