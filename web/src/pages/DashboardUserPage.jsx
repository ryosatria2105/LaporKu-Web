import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  profilService,
  authService,
  laporanService,
  notifikasiService,
  kategoriService,
} from "../services/api.service";
import LaporanFactory from "../factory/LaporanFactory";
import LaporanCard from "../components/laporan/LaporanCard";
import LaporanCardImage from "../components/laporan/LaporanCardImage";
import LaporanCardSimple from "../components/laporan/LaporanCardSimple";
import LaporanDetail from "../components/laporan/LaporanDetail";
import LaporanForm from "../components/laporan/LaporanForm";
import ConfirmDeleteModal from "../components/laporan/ConfirmDeleteModal";
import logoDark from "../assets/logo-darkmode.png";
import { uploadUrl } from "../utils/uploadUrl";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const B = "1px solid #030c1769";

const FAQ_USER_ID = [
  { q: "Bagaimana cara membuat laporan?", a: 'Klik tombol "Buat Laporan" di sidebar atau dashboard. Isi judul laporan, pilih kategori yang sesuai, tuliskan keterangan masalah secara lengkap, tentukan lokasi (gunakan fitur GPS otomatis atau isi manual), serta lampirkan foto bukti jika tersedia. Setelah semua data terisi, klik "Kirim Laporan".' },
  { q: "Berapa lama laporan saya akan diproses?", a: "Laporan akan ditinjau oleh petugas dalam 1–3 hari kerja sejak diterima. Waktu penyelesaian bergantung pada jenis dan kompleksitas permasalahan. Setiap perubahan status laporan akan dikirimkan melalui notifikasi secara real-time." },
  { q: "Apa arti dari setiap status laporan?", a: "Terdapat empat status laporan:\n\n• Menunggu — Laporan telah diterima dan sedang dalam antrean tinjauan petugas.\n• Diproses — Laporan sedang ditangani secara aktif oleh petugas.\n• Selesai — Permasalahan telah berhasil ditindaklanjuti.\n• Ditolak — Laporan tidak dapat diproses. Alasan penolakan tercantum pada halaman detail laporan." },
  { q: "Apa saja alasan laporan bisa ditolak?", a: "Laporan dapat ditolak karena:\n\n• Informasi tidak lengkap atau tidak jelas\n• Laporan merupakan duplikasi\n• Permasalahan tidak termasuk kategori yang ditangani\n• Lokasi berada di luar wilayah layanan\n• Foto bukti tidak relevan\n\nAlasan lengkap dari petugas selalu dicantumkan pada halaman detail laporan." },
  { q: "Apakah laporan yang sudah dikirim dapat dihapus?", a: 'Laporan hanya dapat dihapus selama statusnya masih "Menunggu". Setelah diproses, laporan tidak dapat dihapus untuk menjaga integritas data.' },
  { q: "Bagaimana cara memperbarui foto dan data profil?", a: "Klik menu Profil di sidebar atau melalui dropdown profil di header. Untuk memperbarui foto profil, klik tombol edit pada avatar profil dan pilih gambar baru." },
  { q: "Bagaimana cara mengubah password akun?", a: 'Buka halaman Profil, kemudian pilih tab "Keamanan". Masukkan password saat ini, lalu isi password baru beserta konfirmasinya. Password minimal 8 karakter.' },
  { q: "Apa yang harus dilakukan jika lupa password?", a: 'Pada halaman login, klik "Lupa kata sandi?". Masukkan alamat email yang terdaftar, lalu sistem akan mengirimkan kode OTP ke email tersebut. Kode OTP berlaku selama 5 menit.' },
];
const FAQ_USER_EN = [
  { q: "How do I create a report?", a: 'Click "Create Report" in the sidebar or dashboard. Fill in the title, select a category, describe the problem in detail, set the location (use auto GPS or enter manually), and attach photo evidence if available. Then click "Submit Report".' },
  { q: "How long will my report be processed?", a: "Reports will be reviewed by officers within 1–3 working days. Processing time depends on the type and complexity of the issue. You will receive a notification every time the report status changes." },
  { q: "What does each report status mean?", a: "There are four report statuses:\n\n• Pending — Report received, awaiting review.\n• In Process — Being actively handled.\n• Completed — Issue has been resolved.\n• Rejected — Report could not be processed. See the reason in the detail page." },
  { q: "Why was my report rejected?", a: "Reports may be rejected because:\n\n• Information is incomplete or unclear\n• Duplicate report already exists\n• Issue is outside the handled categories\n• Location is outside service area\n• Photo evidence is irrelevant\n\nFull reasons are always provided in the report detail page." },
  { q: "Can I delete a submitted report?", a: 'Reports can only be deleted while status is "Pending". Once processing begins, reports cannot be deleted to maintain data integrity.' },
  { q: "How do I update my profile photo and data?", a: "Click the Profile menu in the sidebar or the profile dropdown in the header. To update your profile photo, click the edit button on the avatar and select a new image." },
  { q: "How do I change my account password?", a: 'Open the Profile page, then select the "Security" tab. Enter your current password, then fill in the new password and confirmation. Minimum 8 characters.' },
  { q: "What should I do if I forgot my password?", a: 'On the login page, click "Forgot password?". Enter your registered email address, and the system will send an OTP code to that email. The code is valid for 5 minutes.' },
];
const PRIVASI_USER_ID = [
  { title: "1. Data yang Kami Kumpulkan", content: "LaporKu mengumpulkan data yang Anda berikan saat mendaftar dan menggunakan layanan:\n\n• Data identitas: nama, username, email, dan nomor telepon\n• Data akun: foto profil dan preferensi aplikasi\n• Data laporan: judul, kategori, keterangan, lokasi, dan foto bukti\n• Data teknis: informasi perangkat untuk keperluan keamanan\n\nData lokasi hanya diambil saat Anda aktif menggunakan fitur GPS." },
  { title: "2. Tujuan Penggunaan Data", content: "Data digunakan untuk:\n\n• Autentikasi dan pengelolaan akun\n• Pemrosesan laporan fasilitas\n• Pengiriman notifikasi status laporan\n• Penyampaian laporan kepada instansi berwenang\n• Peningkatan kualitas layanan\n\nKami tidak menggunakan data untuk iklan atau profiling komersial." },
  { title: "3. Keamanan Data", content: "Kami menerapkan standar keamanan industri:\n\n• Autentikasi JWT dengan masa berlaku terbatas (15 menit)\n• Password disimpan dengan hash bcrypt (salt rounds 12)\n• Transmisi data menggunakan enkripsi HTTPS\n• Mekanisme blacklist token untuk keamanan sesi\n• Rate limiting untuk mencegah brute force" },
  { title: "4. Berbagi Data", content: "LaporKu tidak menjual data pribadi Anda. Data laporan hanya dibagikan kepada instansi berwenang untuk keperluan penanganan masalah fasilitas, atau kepada pihak berwajib jika diwajibkan oleh hukum." },
  { title: "5. Retensi Data", content: "Data disimpan selama akun aktif. Jika akun dihapus, data pribadi akan dihapus dalam 30 hari kerja. Data laporan dapat dipertahankan dalam bentuk anonim untuk keperluan statistik." },
  { title: "6. Hak Pengguna", content: "Anda memiliki hak:\n\n• Akses — melihat data pribadi Anda\n• Koreksi — memperbarui data tidak akurat\n• Penghapusan — menghapus akun dan data\n• Portabilitas — meminta salinan data\n• Keberatan — mengajukan keberatan atas pemrosesan data" },
  { title: "7. Perubahan Kebijakan", content: "Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui notifikasi aplikasi minimal 7 hari sebelum berlaku." },
  { title: "8. Hubungi Kami", content: "Pertanyaan terkait privasi:\n\n• Email: laporku.app@gmail.com\n• WhatsApp: +62 878-7016-5060\n\nKami berkomitmen merespons dalam 2 hari kerja." },
];
const PRIVASI_USER_EN = [
  { title: "1. Data We Collect", content: "LaporKu collects data you provide when registering and using the service:\n\n• Identity data: name, username, email, and phone number\n• Account data: profile photo and app preferences\n• Report data: title, category, description, location, and evidence photos\n• Technical data: device info for security purposes\n\nLocation data is only collected when you actively use the GPS feature." },
  { title: "2. How We Use Data", content: "Data is used for:\n\n• Account authentication and management\n• Processing facility reports\n• Sending report status notifications\n• Forwarding reports to authorized agencies\n• Improving service quality\n\nWe do not use data for advertising or commercial profiling." },
  { title: "3. Data Security", content: "We implement industry security standards:\n\n• JWT authentication with limited validity (15 minutes)\n• Passwords stored with bcrypt hashing (12 salt rounds)\n• Data transmission using HTTPS encryption\n• Token blacklist mechanism for session security\n• Rate limiting to prevent brute force attacks" },
  { title: "4. Data Sharing", content: "LaporKu does not sell personal data. Report data is only shared with authorized agencies for facility issue handling, or with authorities when required by law." },
  { title: "5. Data Retention", content: "Data is stored while the account is active. If the account is deleted, personal data will be removed within 30 working days. Report data may be retained anonymously for statistical purposes." },
  { title: "6. User Rights", content: "You have the right to:\n\n• Access — view your personal data\n• Correction — update inaccurate data\n• Deletion — delete your account and data\n• Portability — request a copy of your data\n• Objection — raise objections to data processing" },
  { title: "7. Policy Changes", content: "We may update this policy at any time. Significant changes will be communicated via in-app notification at least 7 days before taking effect." },
  { title: "8. Contact Us", content: "Privacy questions:\n\n• Email: laporku.app@gmail.com\n• WhatsApp: +62 878-7016-5060\n\nWe commit to responding within 2 working days." },
];
const CARD = {
  background: "#fff",
  borderRadius: "12px",
  border: B,
  boxShadow: "0 1px 4px rgba(8, 18, 42, 0.44)",
};

// ─────────────────────────────────────────────────────────────
// ALERT POPUP
// ─────────────────────────────────────────────────────────────
function AlertPopup({ alert, onClose, onConfirm }) {
  const _dm = localStorage.getItem("laporku_dark") === "true";
  const _surface = _dm ? "#1E293B" : "#fff";
  const _text = _dm ? "#F1F5F9" : "#0F172A";
  const _subtext = _dm ? "#94A3B8" : "#374151";
  const _border = _dm ? "1px solid #334155" : "1px solid #030c1769";
  const _btnBg = _dm ? "#273449" : "#fff";
  const _btnText = _dm ? "#F1F5F9" : "#1E293B";
  if (!alert) return null;
  const isConfirm = alert.type === "confirm";
  const isDelete = alert.type === "delete";
  const isSuccess = alert.type === "success";
  const isError = alert.type === "error";
  const cfg = {
    success: {
      iconColor: "#15803D",
      btnBg: "#059669",
      btnHover: "#047857",
      btnBorder: "#047857",
    },
    error: {
      iconColor: "#DC2626",
      btnBg: "#EF4444",
      btnHover: "#DC2626",
      btnBorder: "#DC2626",
    },
    confirm: {
      iconColor: "#D97706",
      btnBg: "#D97706",
      btnHover: "#B45309",
      btnBorder: "#B45309",
    },
    delete: {
      iconColor: "#DC2626",
      btnBg: "#EF4444",
      btnHover: "#DC2626",
      btnBorder: "#DC2626",
    },
  };
  const c = cfg[alert.type] || cfg.success;
  return (
    <div
      onClick={!isConfirm && !isDelete ? onClose : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: _surface,
          borderRadius: "14px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: _dm?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",
          border: _border,
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            padding: "28px 24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {isSuccess && (
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke={c.iconColor}
              strokeWidth={1.8}
              style={{ marginBottom: "14px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {isError && (
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke={c.iconColor}
              strokeWidth={1.8}
              style={{ marginBottom: "14px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {isConfirm && (
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke={c.iconColor}
              strokeWidth={1.8}
              style={{ marginBottom: "14px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {isDelete && (
            <svg
              width="44"
              height="44"
              fill="none"
              viewBox="0 0 24 24"
              stroke={c.iconColor}
              strokeWidth={1.8}
              style={{ marginBottom: "14px" }}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
          <p
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 8px",
            }}
          >
            {alert.title}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "#64748B",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {alert.message}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", padding: "0 24px 24px" }}>
          {isConfirm || isDelete ? (
            <>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: B,
                  background: "#fff",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: "9px",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F8FAFC")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                {(() => {
                  try { return localStorage.getItem("laporku_lang") === "en" ? "Cancel" : "Batal"; } catch { return "Batal"; }
                })()}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: `2px solid ${c.btnBorder}`,
                  background: c.btnBg,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: "9px",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = c.btnHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = c.btnBg)
                }
              >
                {alert.confirmLabel || "Ya"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                background: c.btnBg,
                border: `2px solid ${c.btnBorder}`,
                color: "#fff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                borderRadius: "9px",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = c.btnHover)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = c.btnBg)}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONFIRM DIALOG (logout)
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ dialog, onConfirm, onCancel, T: Tp }) {
  if (!dialog) return null;
  const _dm = localStorage.getItem("laporku_dark") === "true";
  const _surface = _dm ? "#1E293B" : "#fff";
  const _text = _dm ? "#F1F5F9" : "#0F172A";
  const _border = _dm ? "1px solid #334155" : "1px solid #030c1769";
  const _btnBg = _dm ? "#273449" : "#fff";
  const _btnText = _dm ? "#F1F5F9" : "#1E293B";
  const lang = localStorage.getItem("laporku_lang") || "id";
  const cancelLabel = Tp?.batal || (lang === "en" ? "Cancel" : "Batal");
  const confirmLabel = Tp?.yesLogout || (lang === "en" ? "Yes, Sign Out" : "Ya, Logout");
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: _surface,
          borderRadius: "14px",
          width: "100%",
          maxWidth: "340px",
          boxShadow: _dm?"0 4px 16px rgba(0,0,0,0.5)":"0 4px 16px rgba(15,23,42,0.12)",
          border: _border,
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div
          style={{
            padding: "28px 24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <svg
            width="44"
            height="44"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#EF4444"
            strokeWidth={1.8}
            style={{ marginBottom: "14px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: _text,
              marginBottom: "8px",
            }}
          >
            {dialog.title}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: _dm?"#94A3B8":"#64748B",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {dialog.message}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", padding: "0 24px 24px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              border: _border,
              background: _btnBg,
              color: _btnText,
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: "9px",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = _dm?"#334155":"#F8FAFC")}
            onMouseLeave={(e) => (e.currentTarget.style.background = _btnBg)}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px",
              border: "2px solid #DC2626",
              background: "#EF4444",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: "9px",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#DC2626")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#EF4444")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  const _dm = localStorage.getItem("laporku_dark") === "true";
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9998,
        background: _dm ? "#1E293B" : "#fff",
        border: _dm ? "1px solid #334155" : B,
        borderRadius: "12px",
        boxShadow: _dm ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 8px rgba(15,23,42,0.10)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "280px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "9px",
          background: "#ECFDF5",
          border: "1.5px solid #A7F3D0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#059669"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: _dm ? "#F1F5F9" : "#0F172A",
            margin: "0 0 1px",
          }}
        >
          {toast.title}
        </p>
        <p style={{ fontSize: "12px", color: _dm ? "#94A3B8" : "#64748B", margin: 0 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#94A3B8",
          padding: "2px",
          display: "flex",
        }}
      >
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BACK BUTTON
// ─────────────────────────────────────────────────────────────
function BackBtn({ onClick, DK: dk, T: Tp }) {
  const _dm = localStorage.getItem("laporku_dark") === "true";
  const _bg = dk ? dk.surfaceHover : "#F8FAFC";
  const _bgHover = _dm ? "#334155" : "#F1F5F9";
  const _border = dk ? dk.border : B;
  const _color = dk ? dk.subtext : "#374151";
  const lang = localStorage.getItem("laporku_lang") || "id";
  const label = Tp?.kembaliDashboard || (lang === "en" ? "Back to Dashboard" : "Kembali ke Dashboard");
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        background: _bg,
        border: _border,
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 600,
        color: _color,
        fontFamily: "inherit",
        marginBottom: "18px",
        boxShadow: _dm ? "none" : "0 1px 3px rgba(15,23,42,0.08)",
        transition: "all .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = _bgHover;
        e.currentTarget.style.boxShadow = "none";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = _bg;
        e.currentTarget.style.boxShadow = _dm ? "none" : "0 1px 3px rgba(15,23,42,0.08)";
      }}
    >
      <svg
        width="14"
        height="14"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PROFILE DROPDOWN
// ─────────────────────────────────────────────────────────────
function ProfileDropdown({ user, initials, onEditProfil, onLogout, onPengaturan, darkMode, DK, T: Tp }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC", inputBg:"#fff" };
  const btnBg = dm ? (open?"#273449":"#1E293B") : (open?"#F1F5F9":"#F8FAFC");
  const btnHover = dm ? "#273449" : "#F1F5F9";
  const borderColor = dm ? "1px solid #334155" : "1px solid #030c1769";
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 10px 5px 5px",
          background: btnBg,
          border: borderColor,
          borderRadius: "50px",
          cursor: "pointer",
          transition: "all .15s",
          boxShadow: "0 1px 4px rgba(15,23,42,0.08)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = btnHover)}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = dm ? "#1E293B" : "#F8FAFC";
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563EB,#7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 800,
            color: "#fff",
            overflow: "hidden",
            flexShrink: 0,
            border: dm ? "2px solid #334155" : "2px solid #fff",
          }}
        >
          {user?.fotoProfil ? (
            <img
              src={user.fotoProfil}
              alt="profil"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: dk.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {user?.nama || (Tp?.masyarakat || "Masyarakat")}
          </p>
          <p style={{ fontSize: "10px", color: dk.dimtext, margin: 0 }}>
            {Tp?.masyarakat || "Masyarakat"}
          </p>
        </div>
        <svg
          width="11"
          height="11"
          fill="none"
          viewBox="0 0 24 24"
          stroke={dk.dimtext}
          strokeWidth={2.5}
          style={{
            marginLeft: "2px",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: dk.surface,
            border: borderColor,
            borderRadius: "14px",
            boxShadow: dm ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 16px rgba(15,23,42,0.12)",
            minWidth: "210px",
            overflow: "hidden",
            zIndex: 9999,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              background: dm ? "#273449" : "#F8FAFC",
              borderBottom: borderColor,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#fff",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: B,
                }}
              >
                {user?.fotoProfil ? (
                  <img
                    src={user.fotoProfil}
                    alt="profil"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: dk.text,
                    margin: "0 0 1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.nama}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: dk.dimtext,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          <div style={{ padding: "6px" }}>
            <button
              onClick={() => {
                setOpen(false);
                onEditProfil();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background .12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = dm ? "#273449" : "#F1F5F9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: dm ? "#1E3A5F" : "#EFF6FF",
                  border: "1.5px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2563EB"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: dk.text,
                  }}
                >
                  {Tp?.editProfil || "Edit Profil"}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: dk.dimtext }}>
                  {Tp?.ubahAkun || "Ubah data akun Anda"}
                </p>
              </div>
            </button>
            <button
              onClick={() => { setOpen(false); onPengaturan && onPengaturan(); }}
              style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"10px 12px", border:"none", background:"transparent", borderRadius:"9px", cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"background .12s" }}
              onMouseEnter={e=>(e.currentTarget.style.background=dm?"#273449":"#F5F3FF")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
            >
              <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:dm?"#2D1F4E":"#F5F3FF", border:"1.5px solid #DDD6FE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <div>
                <p style={{ margin:0, fontSize:"13px", fontWeight:600, color:dk.text }}>{Tp?.pengaturanMenu || "Pengaturan"}</p>
                <p style={{ margin:0, fontSize:"11px", color:dk.dimtext }}>{Tp?.temaKeamanan || "Tema, bahasa & keamanan"}</p>
              </div>
            </button>
            <div style={{ height:"1.5px", background:dm?"#334155":"#E2E8F0", margin:"4px 0" }}/>
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background .12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = dm ? "rgba(239,68,68,0.15)" : "#FEF2F2")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: dm ? "rgba(239,68,68,0.15)" : "#FEF2F2",
                  border: "1.5px solid #FECACA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#EF4444"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#EF4444",
                  }}
                >
                  {Tp?.logoutMenu || "Logout"}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#FCA5A5" }}>
                  {Tp?.keluarSesi || "Keluar dari sesi ini"}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProfilFInputUser & ProfilEyeUser — di luar komponen agar tidak re-mount tiap render
function ProfilFInputUser({ label, value, onChange, type="text", placeholder, disabled, right, hint }) {
  return (
    <div>
      <label style={{ fontSize:"12px", fontWeight:700, display:"block", marginBottom:"6px",
        color: disabled?"#94A3B8":"#475569" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled}
          style={{
            width:"100%", padding: right?"10px 42px 10px 13px":"10px 13px",
            border:`2px solid ${disabled?"#E2E8F0":"#CBD5E1"}`,
            borderRadius:"9px", fontSize:"13px", fontFamily:"inherit",
            outline:"none", boxSizing:"border-box", transition:"border-color .15s, box-shadow .15s",
            background: disabled?"#F8FAFC":"#fff",
            color: disabled?"#94A3B8":"#0F172A",
          }}
          onFocus={e=>{ if(!disabled){ e.target.style.borderColor="#2563EB"; e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)"; }}}
          onBlur={e=>{ e.target.style.borderColor=disabled?"#E2E8F0":"#CBD5E1"; e.target.style.boxShadow="none"; }}
        />
        {right && <div style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)" }}>{right}</div>}
      </div>
      {hint && <p style={{ fontSize:"11px", margin:"5px 0 0", fontWeight:500, color:hint.startsWith("⚠")?"#EF4444":hint.startsWith("✓")?"#059669":"#94A3B8" }}>{hint}</p>}
    </div>
  );
}
function ProfilEyeUser({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ background:"none", border:"none", cursor:"pointer", color:"#94A3B8", padding:0, display:"flex", alignItems:"center" }}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={show
          ?"M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          :"M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PROFIL CONTENT — sama persis dgn admin, refreshUser agar data persist
// ─────────────────────────────────────────────────────────────
function ProfilContent({ user, setUser, refreshUser, onBack, showAlert, darkMode, DK, T: Tp }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC", inputBg:"#fff" };
  const pBorder = dm ? "1px solid #334155" : "1px solid #030c1769";
  const pHeader = dm ? "#273449" : "#F8FAFC";
  const T = Tp || {};
  const [activeTab, setActiveTab] = useState("profil");
  const [form, setForm] = useState({
    nama: user?.nama || "",
    phone: user?.phone || "",
  });
  const [passForm, setPassForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password: "",
  });
  const [showPass, setShowPass] = useState({
    lama: false,
    baru: false,
    konfirmasi: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [showConfirmProfil, setShowConfirmProfil] = useState(false);
  const [showConfirmPass,   setShowConfirmPass]   = useState(false);
  const fileRef = useRef();

  // Facade Pattern: akses API profil lewat profilService
  useEffect(() => {
    profilService.getData().then((res) => {
      const d = res.data.data;
      setForm({ nama: d.nama || "", phone: d.phone || "" });
    });
  }, []);

  // Strategy 1 (Facade + Strategy Pattern): update data teks (nama, phone)
  // Poin 8: intercept → konfirmasi dulu
  const handleUpdateProfil = (e) => {
    e.preventDefault();
    setShowConfirmProfil(true);
  };

  const doUpdateProfil = async () => {
    setShowConfirmProfil(false);
    setLoading(true);
    try {
      const res = await profilService.updateData(form);
      setUser((prev) => ({
        ...prev,
        nama: res.data.data.nama,
        phone: res.data.data.phone,
      }));
      showAlert({
        type: "success",
        title: isEn ? "Profile Updated!" : "Profil Diperbarui!",
        message: isEn ? "Your profile data has been saved." : "Data profil Anda berhasil disimpan.",
      });
    } catch (err) {
      showAlert({
        type: "error",
        title: isEn ? "Failed!" : "Gagal!",
        message: err.response?.data?.message || "Gagal memperbarui profil.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Strategy 2 (Strategy Pattern): update password — endpoint & validasi berbeda
  // Poin 8: validasi dulu, lalu konfirmasi
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (passForm.password_baru !== passForm.konfirmasi_password)
      return showAlert({
        type: "error",
        title: isEn ? "Failed!" : "Gagal!",
        message: isEn ? "New passwords do not match." : "Password baru tidak sama.",
      });
    if (passForm.password_baru.length < 8)
      return showAlert({
        type: "error",
        title: isEn ? "Failed!" : "Gagal!",
        message: isEn ? "Password must be at least 8 characters." : "Password minimal 8 karakter.",
      });
    setShowConfirmPass(true);
  };

  const doUpdatePassword = async () => {
    setShowConfirmPass(false);
    setLoading(true);
    try {
      await profilService.updatePassword(passForm);
      setPassForm({ password_lama: "", password_baru: "", konfirmasi_password: "" });
      showAlert({
        type: "success",
        title: isEn ? "Password Updated!" : "Password Diperbarui!",
        message: isEn ? "Your password has been updated." : "Password Anda berhasil diperbarui.",
      });
    } catch (err) {
      showAlert({
        type: "error",
        title: isEn ? "Failed!" : "Gagal!",
        message: err.response?.data?.message || "Gagal memperbarui password.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Strategy 3 (Strategy Pattern): upload foto — multipart/form-data, bukan JSON
  const handleHapusFoto = () => {
    if (!user?.fotoProfil) return;
    showAlert({
      type: "delete",
      title: isEn ? "Delete Profile Photo?" : "Hapus Foto Profil?",
      message: isEn ? "Your profile photo will be permanently deleted." : "Foto profil Anda akan dihapus permanen.",
      confirmLabel: isEn ? "Yes, Delete" : "Ya, Hapus",
      onConfirm: async () => {
        setLoadingFoto(true);
        try {
          await profilService.deleteFoto();
          setUser((prev) => ({ ...prev, fotoProfil: null }));
          if (refreshUser) await refreshUser();
          showAlert({
            type: "success",
            title: isEn ? "Photo Deleted!" : "Foto Dihapus!",
            message: isEn ? "Profile photo has been removed." : "Foto profil berhasil dihapus.",
          });
        } catch {
          showAlert({
            type: "error",
            title: isEn ? "Failed!" : "Gagal!",
            message: isEn ? "Failed to delete profile photo." : "Gagal menghapus foto profil.",
          });
        } finally {
          setLoadingFoto(false);
        }
      },
    });
  };

  const handleUploadFoto = (e) => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      showAlert({ type: 'info', title: isEn ? 'Feature Unavailable' : 'Fitur Tidak Tersedia', message: isEn ? 'Photo upload is disabled in demo mode. No persistent storage is available in this environment.' : 'Upload foto dinonaktifkan pada mode demo. Tidak ada persistent storage pada environment ini.', confirmLabel: 'OK' });
      if (e.target) e.target.value = '';
      return;
    }
    const file = e.target.files[0];
    if (!file) return;
    // Reset input agar onChange bisa trigger lagi setelah batal
    const resetInput = () => { if (fileRef.current) fileRef.current.value = ""; };
    showAlert({
      type: "confirm",
      title: isEn ? "Update Profile Photo?" : "Perbarui Foto Profil?",
      message: isEn ? "Your current profile photo will be replaced." : "Foto profil Anda saat ini akan diganti.",
      confirmLabel: isEn ? "Yes, Update" : "Ya, Perbarui",
      onConfirm: async () => {
        setLoadingFoto(true);
        try {
          const res = await profilService.uploadFoto(file);
          setUser((prev) => ({ ...prev, fotoProfil: res.data.data.fotoProfil }));
          showAlert({
            type: "success",
            title: isEn ? "Photo Updated!" : "Foto Diperbarui!",
            message: isEn ? "Your profile photo has been updated." : "Foto profil Anda berhasil diperbarui.",
          });
        } catch {
          showAlert({
            type: "error",
            title: isEn ? "Failed!" : "Gagal!",
            message: isEn ? "Failed to upload profile photo." : "Gagal mengupload foto profil.",
          });
        } finally {
          setLoadingFoto(false);
          resetInput();
        }
      },
      onCancel: resetInput,
    });
  };

  const initials =
    user?.nama
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const strength = !passForm.password_baru
    ? 0
    : passForm.password_baru.length < 8
      ? 1
      : passForm.password_baru.length >= 8 &&
          /[A-Z]/.test(passForm.password_baru) &&
          /[0-9]/.test(passForm.password_baru) &&
          /[^a-zA-Z0-9]/.test(passForm.password_baru)
        ? 4
        : passForm.password_baru.length >= 8 &&
            (/[A-Z]/.test(passForm.password_baru) ||
              /[0-9]/.test(passForm.password_baru))
          ? 3
          : 2;
  const isEn = !!(T?.dataProfil && T.dataProfil !== "Data Profil") || T?.laporan === "Report";
  const SC = ["#E2E8F0", "#EF4444", "#F59E0B", "#3B82F6", "#059669"];
  const SL = T.strengthLabels || (isEn
    ? ["", "Too short", "Weak", "Fair", "Strong"]
    : ["", "Terlalu pendek", "Lemah", "Cukup kuat", "Sangat kuat"]);

  const TABS = [
    {
      id: "profil",
      label: T.dataProfil || (isEn ? "Profile Data" : "Data Profil"),
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
    },
    {
      id: "password",
      label: T.keamananAkun || (isEn ? "Security" : "Keamanan"),
      icon: (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 5fr",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {/* Left panel */}
        <div
          style={{
            background: dk.surface,
            borderRadius: "12px",
            border: pBorder,
            boxShadow: dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.51)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                height: "64px",
                background:
                  "linear-gradient(135deg,#0F172A 0%,#1E3A5F 40%,#2563EB 70%,#7C3AED 100%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.15,
                  backgroundImage:
                    "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
                  backgroundSize: "8px 8px",
                }}
              />
            </div>
            <div
              style={{
                padding: "0 18px 18px",
                marginTop: "-28px",
                borderBottom: B,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#fff",
                    overflow: "hidden",
                    border: `3px solid ${dk.surface}`,
                  }}
                >
                  {user?.fotoProfil ? (
                    <img
                      src={user.fotoProfil}
                      alt="profil"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  disabled={loadingFoto}
                  title={isEn ? "Change photo" : "Ganti foto"}
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#2563EB",
                    border: `2px solid ${dk.surface}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
                {/* iOS-style: X merah hapus foto kiri bawah */}
                {user?.fotoProfil && (
                  <button
                    onClick={handleHapusFoto}
                    disabled={loadingFoto}
                    title={isEn ? "Remove photo" : "Hapus foto"}
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: "-2px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#EF4444",
                      border: `2px solid ${dk.surface}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#DC2626"}
                    onMouseLeave={e => e.currentTarget.style.background = "#EF4444"}
                  >
                    <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUploadFoto}
              />
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: "0 0 2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.nama}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: dk.dimtext,
                  margin: "0 0 10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1D4ED8",
                    background: "#DBEAFE",
                    padding: "2px 9px",
                    borderRadius: "5px",
                    border: "1.5px solid #93C5FD",
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#15803D",
                    background: "#DCFCE7",
                    padding: "2px 9px",
                    borderRadius: "5px",
                    border: "1.5px solid #86EFAC",
                  }}
                >
                  Aktif
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: "8px 8px 0" }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: dk.dimtext,
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 8px 6px",
                margin: 0,
              }}
            >
              {T.pengaturan || (isEn ? "Settings" : "Pengaturan")}
            </p>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: "2px",
                    border: active
                      ? "1px solid #BFDBFE"
                      : "1px solid transparent",
                    background: active ? (dm?"rgba(37,99,235,0.15)":"#EFF6FF") : "transparent",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#3B82F6" : dk.subtext,
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = dm?"#273449":"#F8FAFC";
                      e.currentTarget.style.border = pBorder;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }
                  }}
                >
                  <span style={{ color: active ? "#3B82F6" : dk.dimtext }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {active && (
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      style={{ marginLeft: "auto" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1 }} />
          {loadingFoto && (
            <div
              style={{
                padding: "10px 16px",
                background: "#F0FDF4",
                borderTop: B,
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#15803D",
                  fontWeight: 600,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    border: "2px solid #15803D",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Mengupload foto...
              </p>
            </div>
          )}
        </div>

        {/* Right form */}
        <div
          style={{
            background: dk.surface,
            borderRadius: "12px",
            border: pBorder,
            boxShadow: "0 1px 4px rgba(8,18,42,0.51)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: pBorder,
              background: pHeader,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: "0 0 2px",
                }}
              >
                {activeTab === "profil" ? T.dataProfil : T.keamananAkun}
              </p>
              <p style={{ fontSize: "12px", color: dk.dimtext, margin: 0 }}>
                {activeTab === "profil"
                  ? T.dataProfilSub
                  : T.keamananAkunSub}
              </p>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: B,
                background: activeTab === "profil" ? "#EFF6FF" : "#F0FDF4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeTab === "profil" ? "#2563EB" : "#059669",
              }}
            >
              {activeTab === "profil" ? (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </div>
          </div>
          <div style={{ padding: "24px", flex: 1 }}>
            {activeTab === "profil" && (
              <form onSubmit={handleUpdateProfil}>
                <div style={{ display: "grid", gap: "20px" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <ProfilFInputUser
                      label={T.namaLabel||"Nama Lengkap"}
                      value={form.nama}
                      onChange={(e) =>
                        setForm({ ...form, nama: e.target.value })
                      }
                      placeholder={T.namaPlaceholder||"Nama lengkap Anda"}
                    />
                    <ProfilFInputUser
                      label={T.nohpLabel||"No. Telepon"}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder={T.nohpPlaceholder||"08xxxxxxxxxx"}
                      hint={T.nohpHint||"Nomor yang dapat dihubungi"}
                    />
                  </div>
                  <div
                    style={{
                      height: "1px",
                      background: dm ? "#334155" : "#05172f92",
                      borderRadius: "1px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#94A3B8",
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {T.infoAkun||"Informasi Akun"}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <ProfilFInputUser
                      label={T.emailLabel||"Email"}
                      value={user?.email || ""}
                      disabled
                      hint={T.emailHint||"Tidak dapat diubah"}
                    />
                    <ProfilFInputUser
                      label={T.usernameLabel||"Username"}
                      value={user?.username || ""}
                      disabled
                      hint={T.usernameHint||"Tidak dapat diubah"}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#94A3B8",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Role
                      </label>
                      <div
                        style={{
                          padding: "10px 13px",
                          border: pBorder,
                          borderRadius: "9px",
                          background: dm ? "#1E293B" : "#F8FAFC",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#1D4ED8",
                            background: "#DBEAFE",
                            padding: "3px 10px",
                            borderRadius: "5px",
                            border: "1.5px solid #93C5FD",
                            textTransform: "capitalize",
                          }}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#94A3B8",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {T.statusAkun || (isEn ? "Account Status" : "Status Akun")}
                      </label>
                      <div
                        style={{
                          padding: "10px 13px",
                          border: pBorder,
                          borderRadius: "9px",
                          background: dm ? "#1E293B" : "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#22C55E",
                            boxShadow: "0 0 0 2px #DCFCE7",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#15803D",
                            background: "#DCFCE7",
                            padding: "3px 10px",
                            borderRadius: "5px",
                            border: "1.5px solid #86EFAC",
                          }}
                        >
                          {T.active || (isEn ? "Active" : "Aktif")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "12px",
                      borderTop: B,
                    }}
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 24px",
                        background: loading ? "#93C5FD" : "#2563EB",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading)
                          e.currentTarget.style.background = "#1D4ED8";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading)
                          e.currentTarget.style.background = "#2563EB";
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            style={{
                              display: "inline-block",
                              width: "12px",
                              height: "12px",
                              border: "2px solid rgba(255,255,255,0.4)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          {T.menyimpan || (isEn ? "Saving..." : "Menyimpan...")}
                        </>
                      ) : (
                        <>
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {T.simpanProfil || (isEn ? "Save Changes" : "Simpan Perubahan")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword}>
                <div style={{ display: "grid", gap: "18px" }}>
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#FFFBEB",
                      borderRadius: "10px",
                      border: "1px solid #FDE68A",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#FEF3C7",
                        border: "1.5px solid #D97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#D97706"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#92400E",
                          margin: "0 0 2px",
                        }}
                      >
                        {T.perhatian || (isEn ? "Warning" : "Perhatian")}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#A16207",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {T.peringatanSandi || (isEn ? "After updating your password, all active sessions will end and you will need to log in again." : "Setelah password diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang.")}
                      </p>
                    </div>
                  </div>
                  <ProfilFInputUser
                    label={T.sandiSaatIni || (isEn ? "Current Password" : "Password Saat Ini")}
                    type={showPass.lama ? "text" : "password"}
                    value={passForm.password_lama}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        password_lama: e.target.value,
                      })
                    }
                    placeholder={T.sandiSaatIni || (isEn ? "Current password" : "Password saat ini")}
                    right={
                      <ProfilEyeUser
                        show={showPass.lama}
                        onToggle={() =>
                          setShowPass((p) => ({ ...p, lama: !p.lama }))
                        }
                      />
                    }
                  />
                  <div style={{ height: "1.5px", background: "#E2E8F0" }} />
                  <ProfilFInputUser
                    label={T.sandiBaru || (isEn ? "New Password" : "Password Baru")}
                    type={showPass.baru ? "text" : "password"}
                    value={passForm.password_baru}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        password_baru: e.target.value,
                      })
                    }
                    placeholder={T.sandiBaru8 || (isEn ? "Minimum 8 characters" : "Minimal 8 karakter")}
                    right={
                      <ProfilEyeUser
                        show={showPass.baru}
                        onToggle={() =>
                          setShowPass((p) => ({ ...p, baru: !p.baru }))
                        }
                      />
                    }
                  />
                  {passForm.password_baru && (
                    <div style={{ marginTop: "-10px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "3px",
                          marginBottom: "6px",
                        }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: "4px",
                              borderRadius: "2px",
                              background:
                                i <= strength ? SC[strength] : "#E2E8F0",
                              transition: "background .25s",
                            }}
                          />
                        ))}
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: SC[strength],
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {SL[strength]}
                      </p>
                    </div>
                  )}
                  <ProfilFInputUser
                    label={T.konfirmasiSandi || (isEn ? "Confirm New Password" : "Konfirmasi Password Baru")}
                    type={showPass.konfirmasi ? "text" : "password"}
                    value={passForm.konfirmasi_password}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        konfirmasi_password: e.target.value,
                      })
                    }
                    placeholder={T.ulangiSandi || (isEn ? "Re-enter new password" : "Ulangi password baru")}
                    right={
                      <ProfilEyeUser
                        show={showPass.konfirmasi}
                        onToggle={() =>
                          setShowPass((p) => ({
                            ...p,
                            konfirmasi: !p.konfirmasi,
                          }))
                        }
                      />
                    }
                    hint={
                      passForm.konfirmasi_password &&
                      passForm.password_baru !== passForm.konfirmasi_password
                        ? (T.passNoMatch || (isEn ? "⚠ Passwords do not match" : "⚠ Password tidak sama"))
                        : passForm.konfirmasi_password &&
                            passForm.password_baru ===
                              passForm.konfirmasi_password
                          ? (T.passMatch || (isEn ? "✓ Passwords match" : "✓ Password cocok"))
                          : ""
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "12px",
                      borderTop: B,
                    }}
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 24px",
                        background: loading ? "#6EE7B7" : "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading)
                          e.currentTarget.style.background = "#047857";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading)
                          e.currentTarget.style.background = "#059669";
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            style={{
                              display: "inline-block",
                              width: "12px",
                              height: "12px",
                              border: "2px solid rgba(255,255,255,0.4)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          {T.menyimpan || (isEn ? "Updating..." : "Memperbarui...")}
                        </>
                      ) : (
                        <>
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                          {T.perbaruiSandi || (isEn ? "Update Password" : "Perbarui Password")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Poin 8: Konfirmasi Simpan Profil ── */}
      {showConfirmProfil && (
        <div onClick={() => setShowConfirmProfil(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:dk.surface,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:pBorder,overflow:"hidden",fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p style={{ fontSize:"16px",fontWeight:800,color:dk.text,margin:"0 0 8px",fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {isEn ? "Save Profile?" : "Simpan Profil?"}
              </p>
              <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {isEn ? "Are you sure you want to update your profile data?" : "Yakin ingin menyimpan perubahan data profil?"}
              </p>
            </div>
            <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
              <button onClick={() => setShowConfirmProfil(false)} style={{ flex:1,padding:"11px",border:pBorder,background:"transparent",color:dk.subtext,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",borderRadius:"9px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = dk.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button onClick={doUpdateProfil} style={{ flex:1,padding:"11px",border:"2px solid #2563EB",background:"#2563EB",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
                onMouseLeave={e => e.currentTarget.style.background = "#2563EB"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {isEn ? "Yes, Save" : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Poin 8: Konfirmasi Update Password ── */}
      {showConfirmPass && (
        <div onClick={() => setShowConfirmPass(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:dk.surface,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:pBorder,overflow:"hidden",fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p style={{ fontSize:"16px",fontWeight:800,color:dk.text,margin:"0 0 8px",fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {isEn ? "Update Password?" : "Perbarui Password?"}
              </p>
              <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {isEn ? "After updating, all active sessions will end and you need to log in again." : "Setelah diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang."}
              </p>
            </div>
            <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
              <button onClick={() => setShowConfirmPass(false)} style={{ flex:1,padding:"11px",border:pBorder,background:"transparent",color:dk.subtext,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",borderRadius:"9px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = dk.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button onClick={doUpdatePassword} style={{ flex:1,padding:"11px",border:"2px solid #D97706",background:"#D97706",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#B45309"}
                onMouseLeave={e => e.currentTarget.style.background = "#D97706"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {isEn ? "Yes, Update" : "Ya, Perbarui"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAV USER
// ─────────────────────────────────────────────────────────────
const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "buat",
    label: "Buat Laporan",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "laporan",
    label: "Laporan Saya",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
    badge: true,
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: "analitik",
    label: "Analitik",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "pengaturan",
    label: "Pengaturan",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

function EmptyState({ icon, title, desc }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: dm?"#273449":"#F8FAFC",
          border: dm?"1px solid #334155":B,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
          color: "#CBD5E1",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#475569",
          margin: "0 0 4px",
        }}
      >
        {title}
      </p>
      <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD USER
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// BUAT LAPORAN CONTENT — Inline full-page (tanpa modal/drawer)
// Style sinkron dengan KategoriContent di DashboardAdmin
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// MAP PICKER — Leaflet via CDN, klik peta → reverse geocode
// ─────────────────────────────────────────────────────────────
function MapPicker({ onSelect, darkMode: mapDm }) {
  const mapRef = React.useRef(null);
  const instanceRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const [selectedAddr, setSelectedAddr] = React.useState("");
  const [selectedCoords, setSelectedCoords] = React.useState(null);
  const [loadingAddr, setLoadingAddr] = React.useState(false);
  const dm = !!mapDm;
  const isEn = window.__laporku_lang === "en";

  React.useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () =>
      new Promise((resolve) => {
        if (window.L) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });

    loadLeaflet().then(() => {
      if (!mapRef.current || instanceRef.current) return;
      const L = window.L;

      // Default center: Surabaya
      const map = L.map(mapRef.current).setView([-7.2575, 112.7521], 13);
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const icon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#2563EB;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        setSelectedCoords({ lat, lng });
        setLoadingAddr(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`,
          );
          const data = await res.json();
          const addr =
            data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setSelectedAddr(addr);
        } catch {
          setSelectedAddr(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } finally {
          setLoadingAddr(false);
        }
      });
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div ref={mapRef} style={{ height: "380px", width: "100%" }} />
      {(selectedAddr || loadingAddr) && (
        <div
          style={{
            padding: "12px 20px",
            background: dm ? "#0F172A" : "#F8FAFC",
            borderTop: dm ? "1px solid #334155" : "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            {loadingAddr ? (
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                {isEn ? "Getting address..." : "Mengambil alamat..."}
              </p>
            ) : (
              <p style={{ fontSize: "12px", color: dm ? "#F1F5F9" : "#0F172A", margin: 0, fontWeight: 500 }}>
                {selectedAddr}
              </p>
            )}
          </div>
          {selectedCoords && !loadingAddr && (
            <button
              onClick={() => onSelect(selectedAddr, selectedCoords.lat, selectedCoords.lng)}
              style={{
                padding: "8px 18px", background: "#2563EB", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "12px",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              }}
            >
              {isEn ? "Use This Location" : "Pilih Lokasi Ini"}
            </button>
          )}
        </div>
      )}
      {!selectedAddr && !loadingAddr && (
        <div style={{ padding: "10px 20px", background: "#FFFBEB", borderTop: "1px solid #FDE68A" }}>
          <p style={{ fontSize: "12px", color: "#92400E", margin: 0 }}>
            {isEn ? "👆 Click on the map to select a location" : "👆 Klik pada peta untuk memilih titik lokasi"}
          </p>
        </div>
      )}
    </div>
  );
}

function BuatContent({ user, kategoriList, showAlert, onSaved, onBack, darkMode, DK, T: Tp }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC", inputBg:"#fff" };
  const pBorder = dm ? "1px solid #334155" : "1px solid #030c1769";
  const t = Tp || {};
  const [form, setForm] = React.useState({
    judul: "",
    kategori: "",
    nama: user?.nama || "",
    nohp: user?.phone || "",
    keterangan: "",
    lokasi: "",
  });
  const [loadingLokasi, setLoadingLokasi] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  // Multi-foto: array of { file, preview }
  const [photos, setPhotos] = React.useState([]);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [mapCoords, setMapCoords] = React.useState(null);
  const [showConfirmKirim, setShowConfirmKirim] = React.useState(false);
  const fileRef = React.useRef();

  // Sync nama/nohp kalau user baru load
  React.useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        nama: f.nama || user.nama || "",
        nohp: f.nohp || user.phone || "",
      }));
    }
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    border: dm ? "2px solid #475569" : "2px solid #CBD5E1",
    borderRadius: "9px",
    fontSize: "13px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
    background: dk.inputBg,
    color: dk.text,
  };
  const labelStyle = {
    fontSize: "12px",
    fontWeight: 700,
    color: dk.subtext,
    display: "block",
    marginBottom: "6px",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = "#2563EB";
    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = dm ? "#475569" : "#CBD5E1";
    e.target.style.boxShadow = "none";
  };

  const validate = () => {
    const e = {};
    if (!form.judul.trim()) e.judul = "Judul wajib diisi";
    if (!form.kategori) e.kategori = "Pilih kategori";
    if (!form.keterangan.trim()) e.keterangan = "Keterangan wajib diisi";
    if (!form.nama.trim()) e.nama = "Nama pelapor wajib diisi";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFileChange = (e) => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      showAlert({ type: 'info', title: isEn ? 'Feature Unavailable' : 'Fitur Tidak Tersedia', message: isEn ? 'Photo upload is disabled in demo mode. No persistent storage is available in this environment.' : 'Upload foto dinonaktifkan pada mode demo. Tidak ada persistent storage pada environment ini.', confirmLabel: 'OK' });
      if (e.target) e.target.value = '';
      return;
    }
    const files = Array.from(e.target.files);
    const remaining = 5 - photos.length;
    if (remaining <= 0) {
      showAlert({
        type: "error",
        title: "Gagal!",
        message: "Maksimal 5 foto.",
      });
      return;
    }
    const toAdd = files.slice(0, remaining);
    const oversized = toAdd.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      showAlert({
        type: "error",
        title: "Gagal!",
        message: "Setiap foto maksimal 5MB.",
      });
      return;
    }
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPhotos((prev) => [...prev, { file, preview: ev.target.result }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (idx) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const getLocation = () => {
    if (!navigator.geolocation) {
      showAlert({
        type: "error",
        title: "Tidak Didukung",
        message: "Browser tidak mendukung akses lokasi.",
      });
      return;
    }
    setLoadingLokasi(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          // Embed coords for GMaps link: "alamat::lat,lng"
          setForm((f) => ({ ...f, lokasi: `${addr}::${latitude},${longitude}` }));
          setMapCoords({ lat: latitude, lng: longitude });
        } catch {
          const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setForm((f) => ({ ...f, lokasi: `${fallback}::${latitude},${longitude}` }));
          setMapCoords({ lat: latitude, lng: longitude });
        } finally {
          setLoadingLokasi(false);
        }
      },
      () => {
        setLoadingLokasi(false);
        showAlert({
          type: "error",
          title: "Akses Ditolak",
          message: "Izinkan akses lokasi di browser.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Poin 8: intercept submit → tampilkan konfirmasi dulu
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirmKirim(true);
  };

  const doSubmit = async () => {
    setShowConfirmKirim(false);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v?.trim() || ""));
      photos.forEach((p) => fd.append("gambar", p.file));
      await laporanService.create(fd);
      showAlert({
        type: "success",
        title: "Berhasil!",
        message: "Laporan berhasil dikirim.",
      });
      onSaved();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Gagal!",
        message: err.response?.data?.message || "Gagal menyimpan laporan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {/* ── Tips (kiri) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            height: "100%",
          }}
        >
          <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", padding: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: pBorder,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#2563EB"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: 0,
                }}
              >
                Tips Laporan yang Baik
              </p>
            </div>
            {[
              [
                "01",
                "Judul jelas & spesifik",
                "Sertakan nama jalan dan jenis masalah. Contoh: Jalan Berlubang di Jl. Ahmad Yani",
              ],
              [
                "02",
                "Keterangan lengkap",
                "Jelaskan kondisi saat ini, kapan terjadi, dan dampaknya bagi warga sekitar",
              ],
              [
                "03",
                "Foto bukti nyata",
                "Ambil foto yang cukup jelas agar masalah terlihat dan tidak buram",
              ],
              [
                "04",
                "Lokasi yang akurat",
                "Isi nama jalan, kelurahan, atau patokan terdekat agar mudah ditemukan",
              ],
              [
                "05",
                "Data diri valid",
                "Nama dan nomor HP aktif membantu pihak terkait menindaklanjuti laporan",
              ],
            ].map(([num, title, desc]) => (
              <div
                key={num}
                style={{ display: "flex", gap: "12px", marginBottom: "14px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#2563EB",
                    background: "#EFF6FF",
                    border: "1.5px solid #BFDBFE",
                    borderRadius: "6px",
                    padding: "2px 7px",
                    flexShrink: 0,
                    height: "fit-content",
                    marginTop: "2px",
                  }}
                >
                  {num}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: dk.text,
                      margin: "0 0 3px",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", padding: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                paddingBottom: "12px",
                borderBottom: pBorder,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#2563EB"
                strokeWidth={2}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: 0,
                }}
              >
                Transparansi Laporan
              </p>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: dk.subtext,
                margin: "0 0 12px",
                lineHeight: 1.7,
              }}
            >
              Laporan yang kamu buat bersifat{" "}
              <strong style={{ color: dk.text }}>
                publik dan transparan
              </strong>{" "}
              — dapat dilihat oleh seluruh pengguna aplikasi LaporKu.
            </p>
            <div
              style={{
                padding: "11px 14px",
                background: dm?"rgba(37,99,235,0.12)":"#EFF6FF",
                borderRadius: "8px",
                border: dm?"1.5px solid rgba(37,99,235,0.3)":"1.5px solid #BFDBFE",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: "#1D4ED8",
                  margin: 0,
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                Hanya kamu yang bisa mengedit atau menghapus laporan milikmu
                sendiri.
              </p>
            </div>
          </div>

          <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", padding: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
                paddingBottom: "12px",
                borderBottom: pBorder,
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#2563EB"
                strokeWidth={2}
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: 0,
                }}
              >
                Status Laporan
              </p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: dm ? "#273449" : "#F8FAFC" }}>
                  <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 700, color: dk.dimtext, borderBottom: pBorder }}>Status</th>
                  <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 700, color: dk.dimtext, borderBottom: pBorder }}>{t.descriptionLabel||"Keterangan"}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["#F59E0B", "#FFFBEB", "#FDE68A", t.menunggu||"Menunggu", t.laporan==="Report"?"Report received by system":"Laporan diterima sistem"],
                  ["#2563EB", "#EFF6FF", "#BFDBFE", t.diprosesLabel||"In Process", t.beingHandled||"Sedang ditindaklanjuti"],
                  ["#059669", "#F0FDF4", "#A7F3D0", t.selesaiLabel||"Completed", t.resolved||"Masalah telah diatasi"],
                ].map(([color, bg, borderColor, status, desc], i, arr) => (
                  <tr key={status} style={{ borderBottom: i < arr.length - 1 ? pBorder : "none" }}>
                    <td style={{ padding: "10px 10px", whiteSpace: "nowrap" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "4px 12px", borderRadius: "20px",
                        background: bg, border: `1.5px solid ${borderColor}`,
                        fontSize: "11px", fontWeight: 700, color,
                        minWidth: t.laporan==="Report" ? "96px" : "88px",
                        justifyContent: "center",
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 10px", color: dk.subtext, fontSize: "12px" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Form (kanan, lebih besar) ── */}
        <div
          style={{
            background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: pBorder,
              background: dm ? "#273449" : "#F8FAFC",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: dk.text,
                margin: "0 0 2px",
              }}
            >
              {t.buatLaporanBaru || "Buat Laporan Baru"}
            </p>
            <p style={{ fontSize: "11px", color: dk.dimtext, margin: 0 }}>
              {t.buatLaporanSub || (Tp?.bahasa === "en" ? "Fill in the report details completely and clearly" : "Isi detail laporan dengan lengkap dan jelas")}
            </p>
          </div>
          <div
            style={{
              padding: "20px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <form
              onSubmit={handleSubmitRequest}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  marginBottom: "18px",
                  flex: 1,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    {t.namaLaporan || "Judul"} <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    value={form.judul}
                    onChange={set("judul")}
                    placeholder={t.namaLaporan === "Report Name" ? "Example: Damaged Road on Pemuda St." : "Contoh: Jalan Rusak di Jl. Pemuda"}
                    style={{
                      ...inputStyle,
                      borderColor: errors.judul ? "#EF4444" : "#CBD5E1",
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  {errors.judul && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#EF4444",
                        margin: "4px 0 0",
                      }}
                    >
                      {errors.judul}
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>
                    {t.kategoriLabel || "Kategori"} <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <select
                    value={form.kategori}
                    onChange={set("kategori")}
                    style={{
                      ...inputStyle,
                      borderColor: errors.kategori ? "#EF4444" : "#CBD5E1",
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  >
                    <option value="">{t.pilihKategori || "— Pilih Kategori —"}</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                  {errors.kategori && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#EF4444",
                        margin: "4px 0 0",
                      }}
                    >
                      {errors.kategori}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>
                      {t.reporter || "Nama Pelapor"} <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      value={form.nama}
                      readOnly
                      style={{
                        ...inputStyle,
                        borderColor: dm?"#334155":"#E2E8F0",
                        background: dm?dk.inputBg:"#F8FAFC",
                        color: dk.dimtext,
                        cursor: "not-allowed",
                      }}
                      style={{
                        ...inputStyle,
                        borderColor: errors.nama ? "#EF4444" : "#CBD5E1",
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {errors.nama && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#EF4444",
                          margin: "4px 0 0",
                        }}
                      >
                        {errors.nama}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>
                      {t.phone || "Nomor HP"}{" "}
                      <span style={{ fontWeight: 400, color: "#94A3B8" }}>
                        ({t.optionalLabel || "opsional"})
                      </span>
                    </label>
                    <input
                      value={form.nohp}
                      readOnly
                      type="tel"
                      style={{
                        ...inputStyle,
                        borderColor: dm?"#334155":"#E2E8F0",
                        background: dm?dk.inputBg:"#F8FAFC",
                        color: dk.dimtext,
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    {t.keterangan || "Keterangan"} <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.keterangan}
                    onChange={set("keterangan")}
                    rows={4}
                    placeholder={t.keteranganPlaceholder || "Jelaskan detail kejadian, lokasi, waktu..."}
                    style={{
                      ...inputStyle,
                      resize: "none",
                      borderColor: errors.keterangan ? "#EF4444" : "#CBD5E1",
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  {errors.keterangan && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#EF4444",
                        margin: "4px 0 0",
                      }}
                    >
                      {errors.keterangan}
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>{t.lokasiLabel || "Lokasi"}</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "stretch",
                    }}
                  >
                    <input
                      value={form.lokasi.includes("::") ? form.lokasi.split("::")[0] : form.lokasi}
                      onChange={(e) => {
                        // When user manually edits, drop any embedded coords (it's now manual)
                        setForm((f) => ({ ...f, lokasi: e.target.value }));
                        setMapCoords(null);
                      }}
                      placeholder={t.lokasiPlaceholder || "Ketik lokasi atau gunakan GPS"}
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={loadingLokasi}
                      title={t.currentLocation || "Gunakan lokasi saat ini"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 14px",
                        background: loadingLokasi ? "#EFF6FF" : "#2563EB",
                        color: loadingLokasi ? "#2563EB" : "#fff",
                        border: "2px solid #2563EB",
                        borderRadius: "9px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: loadingLokasi ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        transition: "all .15s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {loadingLokasi ? (
                        <>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid #2563EB",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          {t.locating || "Mendeteksi..."}
                        </>
                      ) : (
                        <>
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                          </svg>
                          {t.currentLocation || "Lokasi Saat Ini"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapOpen(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 14px",
                        background: "#F5F3FF",
                        color: "#7C3AED",
                        border: "2px solid #DDD6FE",
                        borderRadius: "9px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        flexShrink: 0,
                        transition: "all .15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EDE9FE";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#F5F3FF";
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Pilih di Peta
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#94A3B8",
                      margin: "5px 0 0",
                    }}
                  >
                    Gunakan lokasi saat ini atau pilih titik di peta
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>
                    {t.fotoBukti || "Foto Bukti"}{" "}
                    <span style={{ fontWeight: 400, color: "#94A3B8" }}>
                      ({t.opsional || "opsional, maks. 5 foto"})
                    </span>
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  {photos.length > 0 ? (
                    <div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(5, 1fr)",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {photos.map((p, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: "relative",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: B,
                              aspectRatio: "1",
                            }}
                          >
                            <img
                              src={p.preview}
                              alt={`foto-${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "rgba(239,68,68,0.9)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                              }}
                            >
                              <svg
                                width="10"
                                height="10"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {photos.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            style={{
                              aspectRatio: "1",
                              border: "2px dashed #CBD5E1",
                              borderRadius: "8px",
                              background: "#F8FAFC",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              color: "#94A3B8",
                              fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#2563EB";
                              e.currentTarget.style.background = "#EFF6FF";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#CBD5E1";
                              e.currentTarget.style.background = "#F8FAFC";
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span style={{ fontSize: "10px", fontWeight: 600 }}>
                              {t.tambah || "Tambah"}
                            </span>
                          </button>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#64748B",
                          margin: 0,
                        }}
                      >
                        {typeof t.hitungFoto === "function" ? t.hitungFoto(photos.length) : `${photos.length}/5 foto — klik × untuk hapus`}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: "100%",
                        border: `2px dashed ${dm?"#475569":"#CBD5E1"}`,
                        borderRadius: "9px",
                        padding: "20px",
                        background: dm?"#1E293B":"#F8FAFC",
                        cursor: "pointer",
                        textAlign: "center",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        minHeight: "120px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#2563EB";
                        e.currentTarget.style.background = dm?"rgba(37,99,235,0.12)":"#EFF6FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = dm?"#475569":"#CBD5E1";
                        e.currentTarget.style.background = dm?"#1E293B":"#F8FAFC";
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                        style={{ display: "block", margin: "0 auto 6px" }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: dk.subtext,
                          margin: "0 0 2px",
                        }}
                      >
                        {t.klikPilihFoto || "Klik untuk pilih foto (maks. 5)"}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          margin: 0,
                        }}
                      >
                        {t.formatFoto || "JPG, PNG, WEBP — maks. 5MB/foto"}
                      </p>
                    </button>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "auto",
                  paddingTop: "18px",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    padding: "10px 18px",
                    background: loading ? "#93C5FD" : "#2563EB",
                    color: "#fff",
                    border: "none",
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.background = "#1D4ED8";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.background = "#2563EB";
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid rgba(255,255,255,.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      {t.menyimpan || "Menyimpan..."}
                    </>
                  ) : (
                    <>
                      <svg
                        width="13"
                        height="13"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {t.kirimLaporan || "Kirim Laporan"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onSaved}
                  style={{
                    padding: "10px 16px",
                    background: dm ? dk.surfaceHover : "#F8FAFC",
                    color: dk.subtext,
                    border: pBorder,
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = dm ? "#334155" : "#F1F5F9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = dm ? dk.surfaceHover : "#F8FAFC")
                  }
                >
                  {t.batal || "Batal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Poin 8: Modal Konfirmasi Kirim Laporan ── */}
      {/* ── Poin 8: Modal Konfirmasi Kirim Laporan (iOS-consistent) ── */}
      {showConfirmKirim && (
        <div
          onClick={() => setShowConfirmKirim(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(6px)', animation: 'fadeIn .2s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="rounded-2xl w-full max-w-sm overflow-hidden"
            style={{
              background: dm ? '#1E293B' : '#fff',
              boxShadow: '0 24px 60px rgba(0,0,0,.35)',
              border: dm ? '1px solid #334155' : '1px solid #E2E8F0',
              animation: 'popIn .2s ease',
            }}
          >
            <div className="px-6 pt-7 pb-4 text-center"
              style={{ background: dm ? 'rgba(37,99,235,.1)' : '#EFF6FF' }}>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: dm ? 'rgba(37,99,235,.2)' : '#DBEAFE' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1"
                style={{ fontFamily: 'Instrument Sans', color: dm ? '#BFDBFE' : '#1E3A5F' }}>
                {t.laporan === "Report" ? "Submit Report?" : "Kirim Laporan?"}
              </h3>
              <p className="text-sm" style={{ color: dm ? '#93C5FD' : '#1D4ED8' }}>
                {t.laporan === "Report"
                  ? "Make sure all information is correct before submitting."
                  : "Pastikan semua informasi sudah benar sebelum dikirim."}
              </p>
            </div>
            <div className="flex gap-3 px-6 py-5">
              <button
                onClick={() => setShowConfirmKirim(false)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all active:scale-[.98]"
                style={{ border: dm ? '1.5px solid #334155' : '1.5px solid #E2E8F0', background: 'transparent', color: dm ? '#94A3B8' : '#475569' }}
              >
                {t.batal || (t.laporan === "Report" ? "Cancel" : "Batal")}
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[.97]"
                style={{ background: 'linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)', boxShadow: '0 4px 14px rgba(37,99,235,.35)', fontFamily: 'Instrument Sans' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
                {t.laporan === "Report" ? "Yes, Submit" : "Ya, Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Map Modal ── */}
      {mapOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: dm ? dk.surface : "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "680px",
              boxShadow: dm ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(15,23,42,0.2)",
              overflow: "hidden",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              border: dm ? "1px solid #334155" : "none",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                background: dm ? "#273449" : "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: dk.text,
                    margin: "0 0 2px",
                  }}
                >
                  {t.selectLocation || "Pilih Lokasi di Peta"}
                </p>
                <p style={{ fontSize: "12px", color: dk.dimtext, margin: 0 }}>
                  {t.clickMapHint || "Klik pada peta untuk menentukan titik lokasi laporan"}
                </p>
              </div>
              <button
                onClick={() => setMapOpen(false)}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748B",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <MapPicker
              darkMode={dm}
              onSelect={(addr, lat, lng) => {
                // Simpan koordinat GPS dalam lokasi dengan format: "alamat::lat,lng"
                // Ini akan di-parse di admin detail untuk membuat link Google Maps
                setForm((f) => ({ ...f, lokasi: `${addr}::${lat},${lng}` }));
                setMapCoords({ lat, lng });
                setMapOpen(false);
              }}
            />
            <div
              style={{
                padding: "12px 20px",
                borderTop: dm ? "1px solid #334155" : "1px solid #E2E8F0",
                background: dm ? "#273449" : "#F8FAFC",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setMapOpen(false)}
                style={{
                  padding: "9px 20px",
                  background: dm ? dk.surface : "#fff",
                  border: pBorder,
                  borderRadius: "9px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: dk.subtext,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.batal || "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL WITH LIGHTBOX — foto besar + thumbnails + popup viewer
// ─────────────────────────────────────────────────────────────
function DetailWithLightbox({
  r,
  b,
  sc,
  gambarList,
  isOwner,
  canEdit,
  fmtDate,
  onEdit,
  onDelete,
  onBack,
  confirmId,
  onConfirmDelete,
  onCancelDelete,
  formOpen,
  editData,
  onCloseForm,
  onSavedForm,
  onErrorForm,
  kategoriList,
  darkMode,
  DK,
  T: Tp,
  onLightboxChange,
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState(null);

  // Notify parent whenever lightbox opens/closes
  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    if (onLightboxChange) onLightboxChange(true, () => { setLightboxIdx(null); if (onLightboxChange) onLightboxChange(false, null); });
  };
  const closeLightbox = () => {
    setLightboxIdx(null);
    if (onLightboxChange) onLightboxChange(false, null);
  };
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC", inputBg:"#fff" };
  const pBorder = dm ? "1px solid #334155" : "1px solid #030c1769";
  const dkCard = { background: dk.surface, borderRadius:"12px", border: pBorder, boxShadow: dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)" };
  const infoCardBg = dm ? "rgba(255,255,255,0.04)" : "#F8FAFC";
  const t = Tp || {};

  return (
    <div>
      {/* Lightbox popup */}
      {lightboxIdx !== null && (
        <div
          onClick={() => closeLightbox()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.97)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => closeLightbox()}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {gambarList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(
                    (i) => (i - 1 + gambarList.length) % gambarList.length,
                  );
                }}
                style={{
                  position: "absolute",
                  left: "16px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) => (i + 1) % gambarList.length);
                }}
                style={{
                  position: "absolute",
                  right: "16px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
          <img
            onClick={(e) => e.stopPropagation()}
            src={uploadUrl(gambarList[lightboxIdx])}
            alt="preview"
            style={{ width: "100vw", height: "100vh", objectFit: "contain" }}
          />
          {gambarList.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                background: "rgba(0,0,0,0.5)",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              {lightboxIdx + 1} / {gambarList.length}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Foto section — di atas */}
        {gambarList.length > 0 && (
          <div style={{ ...dkCard, overflow: "hidden" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                padding: "14px 20px 12px",
                margin: 0,
                borderBottom: "1px solid #030c1769",
              }}
            >
              {t.fotoBukti || "Foto Bukti"}{" "}
              <span
                style={{
                  color: dk.dimtext,
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                {typeof t.photosLabel === "function" ? t.photosLabel(gambarList.length) : `(${gambarList.length} foto — klik untuk perbesar)`}
              </span>
            </p>
            {/* Foto utama */}
            <div
              onClick={() => openLightbox(0)}
              style={{
                cursor: "zoom-in",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <img
                src={uploadUrl(gambarList[0])}
                alt="foto utama"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "cover",
                  maxHeight: "380px",
                }}
                onError={(e) => {
                  e.target.parentElement.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M15 3h6m0 0v6m0-6L10 14M9 21H3m0 0v-6m0 6L14 10" />
                </svg>
                {t.enlargePhoto || "Perbesar"}
              </div>
            </div>
            {/* Thumbnails */}
            {gambarList.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "10px 12px",
                  overflowX: "auto",
                }}
              >
                {gambarList.map((g, i) => (
                  <div
                    key={i}
                    onClick={() => openLightbox(i)}
                    style={{
                      flexShrink: 0,
                      width: "72px",
                      height: "72px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: `2px solid ${i === 0 ? "#2563EB" : (dm ? "#475569" : "#E2E8F0")}`,
                      cursor: "pointer",
                      transition: "border-color .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (i !== 0)
                        e.currentTarget.style.borderColor = "#93C5FD";
                    }}
                    onMouseLeave={(e) => {
                      if (i !== 0)
                        e.currentTarget.style.borderColor = dm ? "#475569" : "#E2E8F0";
                    }}
                  >
                    <img
                      src={uploadUrl(g)}
                      alt={`thumb-${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info laporan */}
        <div style={{ ...dkCard, padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: `1px solid ${b.border}`,
                    background: b.bg,
                    color: b.color,
                  }}
                >
                  {r.kategori}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: `1.5px solid ${sc.border}`,
                    background: sc.bg,
                    color: sc.color,
                  }}
                >
                  {sc.label}
                </span>
              </div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: dk.text,
                  margin: "0 0 8px",
                  lineHeight: 1.3,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {r.judul}
              </h2>
              <p style={{ fontSize: "13px", color: dk.dimtext, margin: 0 }}>
                Dilaporkan oleh{" "}
                <strong style={{ color: dk.text }}>{r.nama}</strong> —{" "}
                {fmtDate(r.tanggal)}
              </p>
            </div>
            {isOwner && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                {canEdit ? (
                  <button
                    onClick={onEdit}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      width: "110px",
                      background: "#FEF3C7",
                      color: "#D97706",
                      border: "1.5px solid #FDE68A",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      color: dk.dimtext,
                      fontStyle: "italic",
                      padding: "4px 0",
                      width: "110px",
                      textAlign: "center",
                    }}
                  >
                    Tidak bisa diedit
                  </span>
                )}
                {canEdit ? (
                  <button
                    onClick={onDelete}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      width: "110px",
                      background: "#FEF2F2",
                      color: "#DC2626",
                      border: "1.5px solid #FECACA",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    {t.hapus || "Hapus"}
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: "11px",
                      color: dk.dimtext,
                      fontStyle: "italic",
                      padding: "4px 0",
                      width: "110px",
                      textAlign: "center",
                    }}
                  >
                    {t.cannotDelete || "Tidak bisa dihapus"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...dkCard, padding: "24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              margin: "0 0 10px",
            }}
          >
            {t.keterangan || "Keterangan"}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: dk.text,
              margin: 0,
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {r.keterangan}
          </p>
        </div>

        <div style={{ ...dkCard, padding: "24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              margin: "0 0 14px",
            }}
          >
            {t.reportInfo || "Informasi Laporan"}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              [t.reporter || "Pelapor", r.nama],
              [t.phone || "No. HP", r.nohp || "—"],
              [t.locationLabel || "Lokasi", r.lokasi || "—"],
              [t.reportDate || "Tanggal Laporan", fmtDate(r.tanggal)],
              ...(r.updatedAt && Math.abs(new Date(r.updatedAt) - new Date(r.tanggal)) > 5000
                ? [[t.lastUpdated || (t.laporan === "Report" ? "Last Updated" : "Terakhir Diperbarui"), fmtDate(r.updatedAt)]]
                : []),
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  padding: "12px 16px",
                  background: infoCardBg,
                  borderRadius: "8px",
                  border: pBorder,
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94A3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 4px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: dk.text,
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alasan Penolakan - tampil jika status ditolak */}
        {r.status === "ditolak" && r.catatanAdmin && (
          <div style={{
            background: Tp?.laporan === "Report" ? "#FFF5F5" : "#FFF5F5",
            border: "1.5px solid #FECACA",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "2px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p style={{ fontSize: "11px", fontWeight: 800, color: "#DC2626", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                {Tp?.laporan === "Report" ? "Rejection Reason" : "Alasan Penolakan"}
              </p>
            </div>
            <p style={{ fontSize: "13px", color: "#991B1B", margin: 0, lineHeight: 1.6 }}>
              {r.catatanAdmin}
            </p>
          </div>
        )}

        {gambarList.length === 0 && (
          <div style={{ ...dkCard, padding: "24px", textAlign: "center" }}>
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke={dm ? "#475569" : "#CBD5E1"}
              strokeWidth={1.5}
              style={{ display: "block", margin: "0 auto 8px" }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p style={{ fontSize: "12px", color: dk.dimtext, margin: 0 }}>
              {t.noPhoto || "Tidak ada foto bukti"}
            </p>
          </div>
        )}

        {!isOwner && (
          <div
            style={{
              ...dkCard,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#94A3B8"
              strokeWidth={2}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p style={{ fontSize: "12px", color: dk.dimtext, margin: 0 }}>
              {t.otherUserReport || "Laporan milik pengguna lain — hanya bisa dilihat"}
            </p>
          </div>
        )}
      </div>
      {confirmId && (
        <ConfirmDeleteModal
          judul={r.judul}
          onConfirm={onConfirmDelete}
          onCancel={onCancelDelete}
          darkMode={dm}
          DK={dk}
          lang={Tp?.laporan === "Report" ? "en" : "id"}
        />
      )}
      {formOpen && (
        <LaporanForm
          initial={editData}
          onClose={onCloseForm}
          onSaved={onSavedForm}
          onError={onErrorForm}
          kategoriList={kategoriList}
          darkMode={dm}
          DK={dk}
          lang={Tp?.laporan === "Report" ? "en" : "id"}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAPORAN CONTENT — Semua laporan, transparan, search + filter
// Factory Pattern: LaporanFactory.create(r) pilih komponen kartu
// ─────────────────────────────────────────────────────────────
const PER_PAGE = 8;

function LaporanContent({ user, kategoriList, showAlert, onBuatLaporan, darkMode, DK, T: Tp, onViewModeChange, onLightboxStateChange }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC", inputBg:"#fff" };
  const pBorder = dm ? "1px solid #334155" : "1px solid #030c1769";
  const t = Tp || {};
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState(() => Tp?.allFilter || "Semua");
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("terbaru");
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef(null);
  const [page, setPage] = React.useState(1);
  const [viewMode, setViewMode] = React.useState("list");
  const [detailData, setDetailData] = React.useState(null);
  const [editData, setEditData] = React.useState(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmId, setConfirmId] = React.useState(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const closeLightboxFn = React.useRef(null);

  const KATEGORI_FILTER = [
    t.myLaporanFilter || "Laporan Saya",
    t.allFilter || "Semua",
    ...kategoriList.map((k) => k.nama),
  ];

  const loadData = React.useCallback(async () => {
    try {
      const res = await laporanService.getAll();
      setData(res.data.data);
    } catch {
      showAlert({
        type: "error",
        title: "Gagal!",
        message: "Gagal memuat laporan.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Back button dari header → kembali ke list saat di detail
  React.useEffect(() => {
    const handler = () => {
      setViewMode("list");
      setDetailData(null);
      setLightboxOpen(false);
      if (onViewModeChange) onViewModeChange("list");
    };
    window.addEventListener('laporan:backToList', handler);
    return () => window.removeEventListener('laporan:backToList', handler);
  }, [onViewModeChange]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset to "All" filter when language changes
  React.useEffect(() => {
    setFilter(t.allFilter || "Semua");
  }, [t.allFilter]);

  const isEn = t.laporan === "Reports";
  const SORT_OPTS = [
    { val:"terbaru", label: isEn?"Latest":"Terbaru", icon:<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg> },
    { val:"terlama", label: isEn?"Oldest":"Terlama", icon:<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg> },
    { val:"az",      label:"A → Z", icon:<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg> },
    { val:"za",      label:"Z → A", icon:<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="3" y1="18" x2="21" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="6" x2="15" y2="6"/></svg> },
  ];

  // Close sort dropdown on outside click — MUST be before any early return (hooks rule)
  React.useEffect(() => {
    if (!sortOpen) return;
    const h = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  const STATUS_MAP = {
    [t.menunggu||"Menunggu"]: "menunggu",
    [t.diprosesLabel||"Diproses"]: "diproses",
    [t.selesaiLabel||"Selesai"]: "selesai",
    [t.ditolakLabel||"Ditolak"]: "ditolak",
  };
  const myFilterKey = t.myLaporanFilter || "Laporan Saya";
  const allFilterKey = t.allFilter || "Semua";
  const filtered = data.filter((r) => {
    const matchFilter =
      filter === allFilterKey ? true
      : filter === myFilterKey ? r.userId === user?.id
      : STATUS_MAP[filter] ? r.status === STATUS_MAP[filter]
      : r.kategori === filter;
    const q = search.toLowerCase();
    const matchQ = !q || [r.judul, r.keterangan, r.nama].some((v) => v?.toLowerCase().includes(q));
    return matchFilter && matchQ;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // Apply sort
  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "terbaru") arr.sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
    else if (sortBy === "terlama") arr.sort((a,b) => new Date(a.tanggal) - new Date(b.tanggal));
    else if (sortBy === "az") arr.sort((a,b) => (a.judul||"").localeCompare(b.judul||""));
    else if (sortBy === "za") arr.sort((a,b) => (b.judul||"").localeCompare(a.judul||""));
    return arr;
  }, [filtered, sortBy]);

  const sliced = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await laporanService.remove(confirmId);
      setConfirmId(null);
      showAlert({
        type: "success",
        title: "Dihapus!",
        message: "Laporan berhasil dihapus.",
      });
      loadData();
    } catch {
      setConfirmId(null);
      showAlert({
        type: "error",
        title: "Gagal!",
        message: "Gagal menghapus laporan.",
      });
    }
  };

  // Inline detail view
  if (viewMode === "detail" && detailData) {
    const r = detailData;
    const BADGE_D = {
      Kecelakaan: {
        bg: "#fef2f2",
        color: "#dc2626",
        border: "rgba(220,38,38,.2)",
      },
      Kriminal: {
        bg: "#f5f3ff",
        color: "#7c3aed",
        border: "rgba(124,58,237,.2)",
      },
      "Bencana Alam": {
        bg: "#eff6ff",
        color: "#2563eb",
        border: "rgba(37,99,235,.2)",
      },
      Pembangunan: {
        bg: "#f0fdf4",
        color: "#16a34a",
        border: "rgba(22,163,74,.2)",
      },
      Lainnya: {
        bg: "#f8fafc",
        color: "#64748b",
        border: "rgba(100,116,139,.2)",
      },
    };
    const b = BADGE_D[r.kategori] || BADGE_D.Lainnya;
    const isOwner = r.userId === user?.id;
    const canEdit = isOwner && r.status === "menunggu";

    // Parse gambar: support JSON array baru & string lama
    const gambarList = (() => {
      if (!r.gambar) return [];
      try {
        const p = JSON.parse(r.gambar);
        return Array.isArray(p) ? p : [r.gambar];
      } catch {
        return [r.gambar];
      }
    })();

    function fmtDate(ts) {
      if (!ts) return "—";
      let s = String(ts);
      if (!s.endsWith("Z") && !s.includes("+")) s += "Z";
      const d = new Date(s);
      return isNaN(d)
        ? "—"
        : d.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          }) + " WIB";
    }

    const STATUS_CFG = {
      menunggu: {
        label: t.menunggu || "Menunggu",
        color: "#B45309",
        bg: "#FFFBEB",
        border: "#FDE68A",
      },
      diproses: {
        label: t.diprosesLabel || "Diproses",
        color: "#6D28D9",
        bg: "#F5F3FF",
        border: "#DDD6FE",
      },
      selesai: {
        label: t.selesaiLabel || "Selesai",
        color: "#065F46",
        bg: "#ECFDF5",
        border: "#A7F3D0",
      },
      ditolak: {
        label: t.ditolakLabel || "Ditolak",
        color: "#991B1B",
        bg: "#FEF2F2",
        border: "#FECACA",
      },
    };
    const sc = STATUS_CFG[r.status] || STATUS_CFG.menunggu;

    return (
      <DetailWithLightbox
        r={r}
        b={b}
        sc={sc}
        gambarList={gambarList}
        isOwner={isOwner}
        canEdit={canEdit}
        fmtDate={fmtDate}
        onEdit={() => {
          setEditData(r);
          setViewMode("list");
          setFormOpen(true);
        }}
        onDelete={() => setConfirmId(r.id)}
        onBack={() => {
          setViewMode("list");
          setDetailData(null);
          setLightboxOpen(false);
          if (onViewModeChange) onViewModeChange("list");
        }}
        confirmId={confirmId}
        onConfirmDelete={() => {
          handleDelete();
          setViewMode("list");
          setDetailData(null);
        }}
        onCancelDelete={() => setConfirmId(null)}
        formOpen={formOpen}
        editData={editData}
        onCloseForm={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSavedForm={() => {
          setFormOpen(false);
          setEditData(null);
          showAlert({
            type: "success",
            title: "Berhasil!",
            message: "Laporan diperbarui.",
          });
          loadData();
        }}
        onErrorForm={(msg) =>
          showAlert({ type: "error", title: "Gagal!", message: msg })
        }
        kategoriList={kategoriList}
        darkMode={dm}
        DK={dk}
        T={t}
        onLightboxChange={(isOpen, closeFn) => {
          setLightboxOpen(isOpen);
          if (isOpen && closeFn) closeLightboxFn.current = closeFn;
          if (!isOpen) closeLightboxFn.current = null;
          if (onLightboxStateChange) onLightboxStateChange(isOpen, isOpen ? closeFn : null);
        }}
      />
    );
  }

  const STATUS_FILTERS = [
    t.allFilter || "Semua",
    t.menunggu || "Menunggu",
    t.diprosesLabel || "Diproses",
    t.selesaiLabel || "Selesai",
    t.ditolakLabel || "Ditolak",
  ];

  return (
    <>
      {/* Filter bar: judul + filter + search + buat laporan */}
      <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", padding:"14px 18px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap", marginBottom:"12px" }}>
          <div>
            <span style={{ fontSize:"14px", fontWeight:800, color:dk.text }}>{filter===(t.myLaporanFilter||"Laporan Saya")?(t.myLaporanFilter||"Laporan Saya"):(t.allLaporanTitle||(t.laporan==="Reports"?"All Reports":"Semua Laporan"))}</span>
            <span style={{ fontSize:"12px", color:dk.dimtext, marginLeft:"10px" }}>{filtered.length} {t.laporan?.toLowerCase()||"laporan"} · {filter===(t.myLaporanFilter||"Laporan Saya")?(t.myLaporanDesc||(t.laporan==="Reports"?"reports you created":"laporan yang kamu buat")):(t.allLaporanDesc||(t.laporan==="Reports"?"visible to all users":"transparan, bisa dilihat semua pengguna"))}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {/* Sort icon button — icon only, popup on click */}
            <div ref={sortRef} style={{ position:"relative" }}>
              <button
                onClick={()=>setSortOpen(o=>!o)}
                title={isEn?"Sort":"Urutkan"}
                style={{
                  width:"34px", height:"34px",
                  borderRadius:"8px",
                  border: sortOpen ? "1.5px solid #2563EB" : pBorder,
                  background: sortOpen ? "#EFF6FF" : dk.inputBg,
                  cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: sortOpen ? "#2563EB" : dk.dimtext,
                  transition:"all .15s",
                  flexShrink:0,
                }}
                onMouseEnter={e=>{ if(!sortOpen){ e.currentTarget.style.borderColor="#2563EB"; e.currentTarget.style.background="#EFF6FF"; e.currentTarget.style.color="#2563EB"; }}}
                onMouseLeave={e=>{ if(!sortOpen){ e.currentTarget.style.borderColor=dm?"#475569":"#030c1769"; e.currentTarget.style.background=dk.inputBg; e.currentTarget.style.color=dk.dimtext; }}}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="6" y1="12" x2="18" y2="12"/>
                  <line x1="9" y1="18" x2="15" y2="18"/>
                </svg>
              </button>
              {/* Popup dropdown */}
              {sortOpen && (
                <div style={{
                  position:"absolute", top:"calc(100% + 6px)", right:0,
                  background:dk.surface, border:pBorder, borderRadius:"12px",
                  boxShadow:dm?"0 8px 24px rgba(0,0,0,0.5)":"0 8px 24px rgba(15,23,42,0.12)",
                  overflow:"hidden", zIndex:9999, minWidth:"140px",
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                }}>
                  {SORT_OPTS.map((opt,idx) => {
                    const isActive = sortBy === opt.val;
                    return (
                      <button key={opt.val}
                        onClick={()=>{ setSortBy(opt.val); setPage(1); setSortOpen(false); }}
                        style={{
                          display:"flex", alignItems:"center", gap:"10px",
                          width:"100%", padding:"10px 14px",
                          border:"none", background: isActive ? (dm?"rgba(37,99,235,0.15)":"#EFF6FF") : "transparent",
                          cursor:"pointer", fontFamily:"inherit", textAlign:"left",
                          fontSize:"13px", fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#2563EB" : dk.text,
                          borderBottom: idx < SORT_OPTS.length-1 ? (dm?"1px solid #1E293B":"1px solid #F1F5F9") : "none",
                          transition:"background .12s",
                        }}
                        onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=dm?"#273449":"#F8FAFC"; }}
                        onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}
                      >
                        <span style={{ color: isActive?"#2563EB":dk.dimtext, flexShrink:0 }}>{opt.icon}</span>
                        {opt.label}
                        {isActive && (
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2.5} style={{ marginLeft:"auto" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", padding:"7px 12px", border:pBorder, borderRadius:"8px", background:dk.inputBg }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} placeholder={t.cariLaporan||(t.laporan==="Reports"?"Search reports...":"Cari laporan...")} style={{ border:"none", background:"transparent", outline:"none", fontSize:"12px", color:dk.text, fontFamily:"inherit", width:"150px" }}/>
            </div>
            <button onClick={onBuatLaporan} style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"8px 16px", background:"#1a56db", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t.buatLaporan||"Buat Laporan"}
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
          {/* Laporan Saya */}
          <button
            onClick={()=>{setFilter(myFilterKey);setPage(1);}}
            style={{
              padding:"5px 16px", borderRadius:"20px", fontSize:"12px", fontWeight:600,
              cursor:"pointer", border:"1.5px solid", fontFamily:"inherit", transition:"all .15s",
              display:"inline-flex", alignItems:"center", gap:"5px",
              background: filter===myFilterKey ? "#1a56db" : "transparent",
              borderColor: filter===myFilterKey ? "#1a56db" : (dm?"#475569":"#E2E8F0"),
              color: filter===myFilterKey ? "#fff" : dk.subtext,
            }}
          >
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {myFilterKey}
          </button>
          {STATUS_FILTERS.map(k=>(
            <button key={k} onClick={()=>{setFilter(k);setPage(1);}} style={{ padding:"5px 16px", borderRadius:"20px", fontSize:"12px", fontWeight:600, cursor:"pointer", border:"1.5px solid", background:filter===k?"#1a56db":"transparent", borderColor:filter===k?"#1a56db":(dm?"#475569":"#E2E8F0"), color:filter===k?"#fff":dk.subtext, fontFamily:"inherit", transition:"all .15s" }}>
              {k}
            </button>
          ))}
          {kategoriList.length>0&&(
            <div style={{ position:"relative" }}>
              <select
                value={STATUS_FILTERS.includes(filter)||filter===allFilterKey?"":filter}
                onChange={e=>{setFilter(e.target.value||allFilterKey);setPage(1);}}
                style={{ padding:"5px 28px 5px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:600, cursor:"pointer", border:`1.5px solid ${!STATUS_FILTERS.includes(filter)&&filter!==allFilterKey&&filter!==myFilterKey?"#1a56db":(dm?"#475569":"#E2E8F0")}`, background:!STATUS_FILTERS.includes(filter)&&filter!==allFilterKey&&filter!==myFilterKey?"#EFF6FF":"transparent", color:!STATUS_FILTERS.includes(filter)&&filter!==allFilterKey&&filter!==myFilterKey?"#1a56db":dk.subtext, fontFamily:"inherit", appearance:"none", outline:"none" }}>
                <option value="">{t.kategoriLabel||"Kategori"} ▾</option>
                {kategoriList.map(k=><option key={k.id} value={k.nama}>{k.nama}</option>)}
              </select>
              <svg style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Memuat laporan...
        </div>
      ) : sliced.length === 0 ? (
        <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📭</div>
          <p style={{ fontWeight: 700, color: dk.text, margin: "0 0 4px" }}>
            Belum ada laporan
          </p>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
            Jadilah yang pertama melapor!
          </p>
        </div>
      ) : (
        <div style={{ background:dk.surface, borderRadius:"12px", border:pBorder, boxShadow:dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)", overflow:"hidden" }}>
          {sliced.map((r, i) => {
            const SC={menunggu:{label:t.menunggu||"Menunggu",color:"#B45309",bg:"#FFFBEB",border:"#FDE68A"},diproses:{label:t.diprosesLabel||"Diproses",color:"#6D28D9",bg:"#F5F3FF",border:"#DDD6FE"},selesai:{label:t.selesaiLabel||"Selesai",color:"#065F46",bg:"#ECFDF5",border:"#A7F3D0"},ditolak:{label:t.ditolakLabel||"Ditolak",color:"#991B1B",bg:"#FEF2F2",border:"#FECACA"}};
            const cfg=SC[r.status]||SC.menunggu;
            const isOwner = !user?.id || r.userId === user?.id;
            const canDelete = isOwner && r.status === "menunggu";
            const isLast = i === sliced.length - 1;
            const fmtDate=(d)=>{if(!d)return"—";const nd=new Date(d);const MONTHS_ID=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];const MONTHS_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const mon=t.laporan==="Report"?MONTHS_EN[nd.getMonth()]:MONTHS_ID[nd.getMonth()];const hh=String(nd.getHours()).padStart(2,"0");const mn=String(nd.getMinutes()).padStart(2,"0");return`${nd.getDate()} ${mon} ${nd.getFullYear()}, ${hh}:${mn}`;};
            const relTime=(d)=>{if(!d)return"";const now=new Date();const diff=Math.floor((now-new Date(d))/1000);const isEn=t.laporan==="Report";if(diff<60)return isEn?"Just now":"Baru saja";if(diff<3600)return isEn?`${Math.floor(diff/60)}m ago`:`${Math.floor(diff/60)} mnt lalu`;if(diff<86400)return isEn?`${Math.floor(diff/3600)}h ago`:`${Math.floor(diff/3600)} jam lalu`;const days=Math.floor(diff/86400);return isEn?`${days}d ago`:`${days} hari lalu`;};
            return (
              <div key={r.id}
                onClick={()=>{ setDetailData(r); setViewMode("detail"); if (onViewModeChange) onViewModeChange("detail"); }}
                style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"14px 18px", borderBottom:isLast?"none":pBorder, transition:"background .12s", cursor:"pointer" }}
                onMouseEnter={e=>(e.currentTarget.style.background=dk.surfaceHover)}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <span style={{ fontSize:"11px", color:dk.dimtext, fontWeight:600, width:"22px", flexShrink:0, paddingTop:"2px" }}>{String(i+1+(page-1)*PER_PAGE).padStart(2,"0")}</span>
                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"13px", fontWeight:700, color:dk.text, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.judul}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={dk.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span style={{ fontSize:"11px", color:dk.subtext, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.nama}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={dk.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><path d="M4 6h16M4 10h16M4 14h8"/></svg>
                    <span style={{ fontSize:"11px", color:dk.dimtext }}>{r.kategori||"—"}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={dk.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize:"10px", color:dk.dimtext }}>
                      {r.updatedAt && Math.abs(new Date(r.updatedAt) - new Date(r.tanggal)) > 5000
                        ? <>
                            <span style={{ color: "#D97706", fontWeight: 600 }}>
                              {t.laporan === "Report" ? "edited" : "diedit"} {relTime(r.updatedAt)}
                            </span>
                            {" · "}{fmtDate(r.tanggal)}
                          </>
                        : <>{fmtDate(r.tanggal)} · {relTime(r.tanggal)}</>
                      }
                    </span>
                  </div>
                </div>
                {/* Right: status badge only - consistent width */}
                <div style={{ flexShrink:0, paddingTop:"2px" }}>
                  <span style={{ fontSize:"10px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", border:`1.5px solid ${cfg.border}`, background:cfg.bg, color:cfg.color, whiteSpace:"nowrap", display:"inline-block",
                    minWidth: t.laporan==="Report" ? "80px" : "72px", textAlign:"center",
                  }}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "16px",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: B,
              background: dk.surface,
              cursor: "pointer",
              fontSize: "14px",
              color: dk.subtext,
            }}
          >
            &#8249;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: B,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                background: n === page ? "#1a56db" : "#fff",
                color: n === page ? "#fff" : "#475569",
                borderColor: n === page ? "#1a56db" : "#030c1769",
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: B,
              background: dk.surface,
              cursor: "pointer",
              fontSize: "14px",
              color: dk.subtext,
            }}
          >
            &#8250;
          </button>
        </div>
      )}

      {formOpen && (
        <LaporanForm
          initial={editData}
          onClose={() => {
            setFormOpen(false);
            setEditData(null);
          }}
          onSaved={() => {
            setFormOpen(false);
            setEditData(null);
            showAlert({
              type: "success",
              title: "Berhasil!",
              message: editData
                ? "Laporan diperbarui."
                : "Laporan berhasil dikirim.",
            });
            loadData();
          }}
          onError={(msg) =>
            showAlert({ type: "error", title: "Gagal!", message: msg })
          }
          kategoriList={kategoriList}
          darkMode={dm}
          DK={dk}
          lang={t.laporan === "Report" ? "en" : "id"}
        />
      )}
      {/* Detail ditampilkan inline — lihat viewMode === 'detail' di atas */}
      {confirmId && (
        <ConfirmDeleteModal
          judul={data.find((x) => x.id === confirmId)?.judul || ""}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
          darkMode={dm}
          DK={dk}
          lang={t.laporan === "Report" ? "en" : "id"}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────
// DONUT CHART — Recharts + cursor-following tooltip (same as admin)
// ─────────────────────────────────────────────────────────────
function DonutChart({ stats, darkMode = false, dkText = "#0F172A", DK: dk, T: tProp }) {
  const [hover, setHover] = React.useState(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef(null);
  const dm = !!darkMode;
  const surface = dk ? dk.surface : (dm ? "#1E293B" : "#fff");
  const border = dk ? dk.border : "1px solid #030c1769";
  const dimtext = dk ? dk.dimtext : "#64748B";
  const t = tProp || {};

  const segs = [
    { key: "menunggu", label: t.menunggu || "Menunggu", color: "#F59E0B" },
    { key: "diproses", label: t.diprosesLabel || "Diproses", color: "#7C3AED" },
    { key: "selesai",  label: t.selesaiLabel || "Selesai",  color: "#10B981" },
    { key: "ditolak",  label: t.ditolakLabel || "Ditolak",  color: "#EF4444" },
  ];
  const total = segs.reduce((acc, s) => acc + (stats?.[s.key] || 0), 0);
  const pieData = segs.filter(s => (stats?.[s.key] || 0) > 0).map(s => ({ name: s.label, value: stats[s.key], color: s.color }));
  const emptyData = [{ name: "Empty", value: 1, color: dm ? "#334155" : "#E2E8F0" }];
  const data = total === 0 ? emptyData : pieData;

  return (
    <div
      ref={ref}
      style={{ position: "relative", width: 220, height: 220, flexShrink: 0 }}
      onMouseMove={e => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <ResponsiveContainer width={220} height={220}>
        <PieChart>
          <Pie
            data={data}
            cx={100}
            cy={100}
            innerRadius={62}
            outerRadius={100}
            dataKey="value"
            strokeWidth={total === 0 ? 0 : 3}
            stroke={surface}
            startAngle={90}
            endAngle={-270}
            onMouseEnter={(entry) => setHover(entry)}
            onMouseLeave={() => setHover(null)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <p style={{ fontSize: "36px", fontWeight: 800, color: dkText, margin: 0, lineHeight: 1 }}>{total}</p>
        <p style={{ fontSize: "11px", color: dimtext, margin: 0, fontWeight: 600 }}>{t.totalLabel || "Total"}</p>
      </div>
      {/* Cursor-following tooltip */}
      {hover && total > 0 && (() => {
        const val = hover.value;
        const name = hover.name;
        const color = hover.fill;
        const pct = total ? Math.round((val / total) * 100) : 0;
        const TW = 136, TH = 72;
        const left = pos.x + 14 + TW > 220 ? pos.x - TW - 10 : pos.x + 14;
        const top  = pos.y + 14 + TH > 220 ? pos.y - TH - 10 : pos.y + 14;
        return (
          <div style={{
            position: "absolute", left, top,
            background: surface, border,
            borderRadius: "10px", padding: "8px 12px",
            fontSize: "12px", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none", whiteSpace: "nowrap",
            zIndex: 100, minWidth: "120px",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"4px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:color, flexShrink:0 }}/>
              <span style={{ fontWeight:700, color:dkText }}>{name}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:dimtext }}>{t.laporan?.toLowerCase()||"laporan"}</span>
              <span style={{ fontWeight:800, color:dkText }}>{val}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:dimtext }}>%</span>
              <span style={{ fontWeight:700, color }}>{pct}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NOTIFIKASI PAGE
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// ANALITIK USER PAGE
// ─────────────────────────────────────────────────────────────
function AnalitikUserPage({ userStats, myLaporan, DK, T, darkMode }) {
  const B = DK ? DK.border : "1px solid #030c1769";
  const CARD = { background: DK ? DK.surface : "#fff", borderRadius:"12px", border:B, boxShadow: DK ? DK.cardShadow : "0 1px 4px rgba(8,18,42,0.44)" };
  const [trendPeriod, setTrendPeriod] = useState("mingguan");
  const tL = T || { distribusiStatus:"Distribusi Status", distribusiSub:"Perbandingan status laporan Anda", tren:"Tren Laporan", trenSub:"Aktivitas pelaporan dalam periode dipilih", kategoriLaporan:"Kategori Laporan", kategoriSub:"Kategori yang sering Anda laporkan", harian:"Harian", mingguan:"Mingguan", bulanan:"Bulanan", tahunan:"Tahunan", periodeLabel:"Periode" };
  const dkText = DK ? DK.text : "#0F172A";
  const dkSubtext = DK ? DK.subtext : "#374151";
  const dkDimtext = DK ? DK.dimtext : "#64748B";
  const dkSurface = DK ? DK.surface : "#fff";
  const dkSurfaceHover = DK ? DK.surfaceHover : "#F8FAFC";
  const dkBorder = DK ? DK.border : "1px solid #030c1769";
  const isEn = tL.laporan === "Report" || tL.allReports === "all reports";
  const total = userStats?.total||0;
  const segs = [
    {val:userStats?.menunggu||0,color:"#F59E0B",bg:"#FFFBEB",border:"#FDE68A",label:tL.menunggu||"Menunggu"},
    {val:userStats?.diproses||0,color:"#7C3AED",bg:"#F5F3FF",border:"#DDD6FE",label:tL.diprosesLabel||"Diproses"},
    {val:userStats?.selesai||0, color:"#10B981",bg:"#ECFDF5",border:"#A7F3D0",label:tL.selesaiLabel||"Selesai"},
    {val:userStats?.ditolak||0, color:"#EF4444",bg:"#FEF2F2",border:"#FECACA",label:tL.ditolakLabel||"Ditolak"},
  ];
  const kategoriCount={};
  (myLaporan||[]).forEach(r=>{if(r.kategori)kategoriCount[r.kategori]=(kategoriCount[r.kategori]||0)+1;});
  const topKat=Object.entries(kategoriCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([nama,jumlah])=>({nama,jumlah}));
  const maxKat=topKat[0]?.jumlah||1;
  const tingkatSelesai=total?Math.round((userStats?.selesai||0)/total*100):0;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:"18px",flex:1}}>
      <div><p style={{fontSize:"20px",fontWeight:800,color:dkText,margin:"0 0 4px"}}>{tL.analitikTitle||"Analitik Laporan"}</p><p style={{fontSize:"13px",color:dkDimtext,margin:0}}>{tL.analitikSub||"Statistik dan distribusi laporan Anda"}</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
        {[
          {label:tL.totalReports||"Total Laporan",val:total,sub:tL.allReports||"semua laporan",gradient:"linear-gradient(135deg,#1D4ED8 0%,#1E40AF 100%)",icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>},
          {label:tL.selesaiLabel||"Selesai",val:userStats?.selesai||0,sub:tL.selesaiSub||"berhasil selesai",gradient:"linear-gradient(135deg,#059669 0%,#047857 100%)",icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>},
          {label:tL.completionRate||"Tingkat Selesai",val:`${tingkatSelesai}%`,sub:tL.fromTotal||"dari total laporan",gradient:"linear-gradient(135deg,#6D28D9 0%,#5B21B6 100%)",icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>},
          {label:tL.ditolakLabel||"Ditolak",val:userStats?.ditolak||0,sub:`${total?Math.round((userStats?.ditolak||0)/total*100):0}% ${tL.fromTotal||"dari total"}`,gradient:"linear-gradient(135deg,#DC2626 0%,#B91C1C 100%)",icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>},
        ].map((s,i)=>(
          <div key={i} style={{...CARD,padding:"22px 24px",background:s.gradient,border:"2px solid rgba(0,0,0,0.2)",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"10px",background:"rgba(255,255,255,0.2)",border:"2px solid rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>{s.icon}</div>
              <span style={{fontSize:"11px",fontWeight:800,color:"#fff",letterSpacing:"0.3px",textTransform:"uppercase",textShadow:"0 1px 3px rgba(0,0,0,0.4)",WebkitTextStroke:"0.5px #0F172A"}}>{s.label}</span>
            </div>
            <p style={{fontSize:"42px",fontWeight:800,color:"#fff",margin:0,lineHeight:1,letterSpacing:"-1px",textShadow:"0 2px 4px rgba(0,0,0,0.35)",WebkitTextStroke:"0.8px #0F172A"}}>{s.val}</p>
            <p style={{fontSize:"12px",color:"#fff",margin:"8px 0 0",fontWeight:600}}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px"}}>
        {/* Distribusi Status — donut ATAS, tabel BAWAH */}
        <div style={{...CARD,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:B}}>
            <p style={{fontSize:"13px",fontWeight:800,color:dkText,margin:0}}>{tL.distribusiStatus}</p>
            <p style={{fontSize:"11px",color:dkDimtext,margin:"2px 0 0"}}>{tL.distribusiSub}</p>
          </div>
          {/* Chart donut di ATAS — cursor-following */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"28px 20px 20px"}}>
            <DonutChart
              stats={userStats}
              darkMode={darkMode}
              dkText={dkText}
              DK={DK}
              T={tL}
            />
          </div>
          {/* Tabel — style sama persis dashboard Status Laporan */}
          <div style={{width:"100%",borderTop:B}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:dkSurfaceHover}}>
                  <th style={{padding:"8px 12px",fontSize:"11px",fontWeight:700,color:dkDimtext,textAlign:"left",textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:B}}>{tL.statusLabel||"Status"}</th>
                  <th style={{padding:"8px 12px",fontSize:"11px",fontWeight:700,color:dkDimtext,textAlign:"center",borderBottom:B}}>{tL.jumlah||"Jumlah"}</th>
                  <th style={{padding:"8px 12px",fontSize:"11px",fontWeight:700,color:dkDimtext,textAlign:"right",borderBottom:B}}>%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {label:tL.menunggu||"Menunggu",key:"menunggu",color:"#F59E0B"},
                  {label:tL.diprosesLabel||"Diproses",key:"diproses",color:"#7C3AED"},
                  {label:tL.selesaiLabel||"Selesai", key:"selesai", color:"#10B981"},
                  {label:tL.ditolakLabel||"Ditolak", key:"ditolak", color:"#EF4444"},
                ].map((s,idx)=>{
                  const val=userStats?.[s.key]||0;
                  const pct=total?Math.round(val/total*100):0;
                  return(
                    <tr key={s.key} style={{borderBottom:idx<3?B:"none"}} onMouseEnter={e=>{Array.from(e.currentTarget.cells).forEach(c=>c.style.background=dkSurfaceHover)}} onMouseLeave={e=>{Array.from(e.currentTarget.cells).forEach(c=>c.style.background="transparent")}}>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <div style={{width:"10px",height:"10px",borderRadius:"3px",background:s.color,flexShrink:0}}/>
                          <span style={{fontSize:"13px",color:dkSubtext,fontWeight:500}}>{s.label}</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px",fontWeight:800,fontSize:"14px",color:dkText,textAlign:"center"}}>{val}</td>
                      <td style={{padding:"10px 12px",fontSize:"13px",color:dkDimtext,textAlign:"right"}}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{...CARD,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:B}}><p style={{fontSize:"13px",fontWeight:800,color:dkText,margin:0}}>{tL.kategoriLaporan}</p><p style={{fontSize:"11px",color:dkDimtext,margin:"2px 0 0"}}>{tL.kategoriSub}</p></div>
          <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"16px"}}>
            {topKat.length>0?topKat.map((k,i)=>{const colors=["#2563EB","#7C3AED","#059669","#D97706","#DC2626"],bgs=["#EFF6FF","#F5F3FF","#ECFDF5","#FFFBEB","#FEF2F2"],borders=["#BFDBFE","#DDD6FE","#A7F3D0","#FDE68A","#FECACA"];const pct=Math.round((k.jumlah/maxKat)*100);return(<div key={k.nama}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><div style={{width:"24px",height:"24px",borderRadius:"6px",background:bgs[i],border:`1.5px solid ${borders[i]}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:"11px",fontWeight:800,color:colors[i]}}>{i+1}</span></div><span style={{fontSize:"13px",fontWeight:700,color:dkText}}>{k.nama}</span></div><span style={{fontSize:"13px",fontWeight:800,color:colors[i],background:bgs[i],padding:"2px 10px",borderRadius:"20px",border:`1.5px solid ${borders[i]}`}}>{k.jumlah}</span></div><div style={{height:"10px",background:darkMode?"#334155":"#F1F5F9",borderRadius:"99px",overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${colors[i]},${colors[i]}bb)`,borderRadius:"99px",transition:"width .6s ease"}}/></div></div>);}):(<div style={{textAlign:"center",padding:"24px 0",color:dkDimtext,fontSize:"13px"}}>{tL.belumAda||"Belum ada laporan"}</div>)}
          </div>
        </div>
      </div>
      {(()=>{
        // Build data based on selected period
        const BULAN=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
        let data = [];
        if (trendPeriod === "bulanan") {
          const bulanMap={};
          (myLaporan||[]).forEach(r=>{const d=new Date(r.tanggal);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;bulanMap[key]={label:`${BULAN[d.getMonth()]} ${d.getFullYear()}`,count:(bulanMap[key]?.count||0)+1};});
          data=Object.keys(bulanMap).sort().slice(-6).map(k=>bulanMap[k]);
        } else if (trendPeriod === "harian") {
          const hMap={};
          (myLaporan||[]).forEach(r=>{const d=new Date(r.tanggal);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;hMap[key]={label:`${d.getDate()} ${BULAN[d.getMonth()]}`,count:(hMap[key]?.count||0)+1};});
          data=Object.keys(hMap).sort().slice(-7).map(k=>hMap[k]);
        } else if (trendPeriod === "mingguan") {
          // Show last 7 weeks
          const wMap={};
          (myLaporan||[]).forEach(r=>{
            const d=new Date(r.tanggal);
            // Get monday of the week
            const dayOfWeek = d.getDay();
            const monday = new Date(d);
            monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const key=`${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,"0")}-${String(monday.getDate()).padStart(2,"0")}`;
            const mon = isEn ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monday.getMonth()] : ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][monday.getMonth()];
            const label = `${monday.getDate()} ${mon}`;
            wMap[key]={label,count:(wMap[key]?.count||0)+1};
          });
          data=Object.keys(wMap).sort().slice(-7).map(k=>wMap[k]);
        } else if (trendPeriod === "tahunan") {
          const yMap={};
          (myLaporan||[]).forEach(r=>{const d=new Date(r.tanggal);const key=`${d.getFullYear()}`;yMap[key]={label:`${d.getFullYear()}`,count:(yMap[key]?.count||0)+1};});
          data=Object.keys(yMap).sort().map(k=>yMap[k]);
        }
        const maxVal=Math.max(...data.map(d=>d.count),1);
        const PERIODS = [{v:"harian",l:tL.harian},{v:"mingguan",l:tL.mingguan},{v:"bulanan",l:tL.bulanan},{v:"tahunan",l:tL.tahunan}];
        return (
        <div style={{background:dkSurface,borderRadius:"12px",border:dkBorder,boxShadow:darkMode?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:dkBorder,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
            <div>
              <p style={{fontSize:"13px",fontWeight:800,color:dkText,margin:0}}>{tL.tren}</p>
              <p style={{fontSize:"11px",color:dkDimtext,margin:"2px 0 0"}}>{tL.trenSub}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <span style={{fontSize:"11px",fontWeight:600,color:dkDimtext,marginRight:"4px"}}>{tL.periodeLabel}:</span>
              <div style={{position:"relative"}}>
                <select
                  value={trendPeriod}
                  onChange={e=>setTrendPeriod(e.target.value)}
                  style={{padding:"5px 28px 5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:600,cursor:"pointer",border:`1.5px solid ${darkMode?"#475569":"#CBD5E1"}`,background:darkMode?"#1E293B":"#fff",color:darkMode?"#F1F5F9":"#374151",fontFamily:"inherit",appearance:"none",outline:"none",transition:"all .15s"}}
                >
                  {[{v:"harian",l:tL.harian},{v:"mingguan",l:tL.mingguan},{v:"bulanan",l:tL.bulanan},{v:"tahunan",l:tL.tahunan}].map(p=>(
                    <option key={p.v} value={p.v}>{p.l}</option>
                  ))}
                </select>
                <svg style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={darkMode?"#94A3B8":"#64748B"} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>
          {data.length === 0 ? (
            <div style={{padding:"40px",textAlign:"center",color:dkDimtext,fontSize:"13px"}}>
              {trendPeriod === "harian" ? "Belum ada data harian" : trendPeriod === "mingguan" ? "Belum ada data mingguan" : trendPeriod === "tahunan" ? "Belum ada data tahunan" : "Belum ada data bulanan"}
            </div>
          ) : (
          <div style={{padding:"28px 32px 20px"}}>
            {(()=>{
              // ── Pixel coords only — % TIDAK bisa di SVG path d ──
              // ── Chart dimensions — padded for axis labels ──
              const VW=900, VH=300, PADL=64, PADR=20, PADT=24, PADB=56, PADY_LABEL=30;
              const CW=VW-PADL-PADR, CH=VH-PADT-PADB;
              const pts=data.map((d,i)=>({
                x: PADL+(i/(data.length-1||1))*CW,
                y: PADT+CH - Math.max((d.count/maxVal)*CH,0),
                count:d.count, label:d.label
              }));
              const linePath=pts.map((p,i)=>(i===0?"M":"L")+` ${p.x} ${p.y}`).join(" ");
              const areaPath=`${linePath} L ${pts[pts.length-1].x} ${PADT+CH} L ${pts[0].x} ${PADT+CH} Z`;
              const gridColor = darkMode ? "#334155" : "#E2E8F0";
              const axisColor = darkMode ? "#475569" : "#CBD5E1";
              const labelColor = darkMode ? "#94A3B8" : "#64748B";
              const axisTitleColor = darkMode ? "#F1F5F9" : "#0F172A";
              const totalH = VH + PADB + PADY_LABEL;
              return(
                <svg viewBox={`0 0 ${VW} ${totalH}`} width="100%" height={totalH} style={{overflow:"visible"}}>
                  <defs>
                    <linearGradient id="lgU" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={darkMode?"0.35":"0.2"}/>
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02"/>
                    </linearGradient>
                  </defs>

                  {/* ── Judul Sumbu Y (vertikal, di kiri) ── */}
                  <text
                    x={14} y={PADT+CH/2}
                    textAnchor="middle"
                    fontSize="11" fontWeight="700"
                    fill={axisTitleColor}
                    fontFamily="'Plus Jakarta Sans',sans-serif"
                    transform={`rotate(-90, 14, ${PADT+CH/2})`}
                  >{tL.jumlah||"Jumlah"} {tL.laporan||"Laporan"}</text>

                  {/* ── Horizontal grid lines + Y labels ── */}
                  {[0,25,50,75,100].map(pct=>{
                    const y=PADT+CH-(pct/100)*CH;
                    return(
                      <g key={pct}>
                        <line x1={PADL} y1={y} x2={VW-PADR} y2={y} stroke={pct===0?axisColor:gridColor} strokeWidth={pct===0?"1.5":"1"} strokeDasharray={pct===0?"none":"4 3"}/>
                        <text x={PADL-8} y={y+4} textAnchor="end" fontSize="11" fontWeight="600" fill={labelColor} fontFamily="'Plus Jakarta Sans',sans-serif">{Math.round(maxVal*pct/100)}</text>
                      </g>
                    );
                  })}

                  {/* ── Vertical grid lines at each X data point ── */}
                  {pts.map((p,i)=>(
                    <line key={`vg${i}`} x1={p.x} y1={PADT} x2={p.x} y2={PADT+CH} stroke={gridColor} strokeWidth="1" strokeDasharray="4 3"/>
                  ))}

                  {/* ── Y axis line ── */}
                  <line x1={PADL} y1={PADT} x2={PADL} y2={PADT+CH} stroke={axisColor} strokeWidth="1.5"/>

                  {/* ── X axis line ── */}
                  <line x1={PADL} y1={PADT+CH} x2={VW-PADR} y2={PADT+CH} stroke={axisColor} strokeWidth="1.5"/>

                  {/* ── Area + Line (only if ≥2 points) ── */}
                  {pts.length >= 2 && <path d={areaPath} fill="url(#lgU)"/>}
                  {pts.length >= 2 && <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>}
                  {pts.length === 1 && (
                    <line x1={PADL} y1={pts[0].y} x2={VW-PADR} y2={pts[0].y} stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4"/>
                  )}

                  {/* ── Data points + labels ── */}
                  {pts.map((p,i)=>(
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#2563EB" stroke={darkMode?"#1E293B":"#fff"} strokeWidth="2.5"/>
                      {p.count>0&&<text x={p.x} y={p.y-12} textAnchor="middle" fontSize="12" fontWeight="800" fill={dkText} fontFamily="'Plus Jakarta Sans',sans-serif">{p.count}</text>}
                      <text x={p.x} y={PADT+CH+18} textAnchor="middle" fontSize="11" fontWeight="600" fill={labelColor} fontFamily="'Plus Jakarta Sans',sans-serif">{p.label}</text>
                    </g>
                  ))}

                  {/* ── Judul Sumbu X (di bawah) ── */}
                  <text
                    x={PADL+CW/2} y={PADT+CH+PADB+8}
                    textAnchor="middle"
                    fontSize="11" fontWeight="700"
                    fill={axisTitleColor}
                    fontFamily="'Plus Jakarta Sans',sans-serif"
                  >{tL.periodeLabel||"Periode Waktu"}</text>
                </svg>
              );
            })()}
          </div>
          )}
        </div>
      );
      })()}
      <div style={{background:dkSurface,borderRadius:"12px",border:dkBorder,boxShadow:darkMode?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:dkBorder}}><p style={{fontSize:"13px",fontWeight:800,color:dkText,margin:0}}>{tL.statusHistory||"Riwayat Laporan"}</p><p style={{fontSize:"11px",color:dkDimtext,margin:"2px 0 0"}}>{tL.riwayatSub||(tL.allReports==="all reports"?"All reports you have submitted":"Semua laporan yang pernah Anda buat")}</p></div>
        {(myLaporan||[]).length===0?<div style={{padding:"32px 24px",textAlign:"center",color:dkDimtext,fontSize:"13px"}}>{tL.belumAda||"Belum ada laporan"}</div>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <thead><tr style={{background:dkSurfaceHover,borderBottom:B}}>{["No",tL.namaLaporan||"Judul",tL.kategoriLabel||"Kategori",tL.reportDate||"Tanggal","Status"].map((h,i)=><th key={i} style={{padding:"11px 16px",textAlign:i<2?"left":"center",fontSize:"12px",fontWeight:700,color:dkText}}>{h}</th>)}</tr></thead>
              <tbody>{(myLaporan||[]).map((r,i)=>{const SC={menunggu:{label:tL.menunggu||"Menunggu",color:"#B45309",bg:"#FFFBEB",border:"#FDE68A"},diproses:{label:tL.diprosesLabel||"Diproses",color:"#6D28D9",bg:"#F5F3FF",border:"#DDD6FE"},selesai:{label:tL.selesaiLabel||"Selesai",color:"#065F46",bg:"#ECFDF5",border:"#A7F3D0"},ditolak:{label:tL.ditolakLabel||"Ditolak",color:"#991B1B",bg:"#FEF2F2",border:"#FECACA"}};const cfg=SC[r.status]||SC.menunggu;const fmtDate=(d)=>new Date(d).toLocaleDateString(tL.laporan==="Report"?"en-GB":"id-ID",{day:"2-digit",month:"short",year:"numeric"});return(<tr key={r.id} style={{borderBottom:B,transition:"background .12s"}} onMouseEnter={e=>(e.currentTarget.style.background=dkSurfaceHover)} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><td style={{padding:"12px 16px",fontSize:"12px",color:dkDimtext,fontWeight:600}}>{String(i+1).padStart(2,"0")}</td><td style={{padding:"12px 16px",maxWidth:"280px"}}><p style={{fontSize:"13px",fontWeight:700,color:dkText,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.judul}</p></td><td style={{padding:"12px 16px",textAlign:"center"}}><span style={{fontSize:"11px",fontWeight:600,padding:"2px 8px",borderRadius:"6px",background:"#F5F3FF",border:"1.5px solid #DDD6FE",color:"#6D28D9"}}>{r.kategori}</span></td><td style={{padding:"12px 16px",textAlign:"center",fontSize:"12px",color:dkSubtext}}>{fmtDate(r.tanggal)}</td><td style={{padding:"12px 16px",textAlign:"center"}}><span style={{fontSize:"10px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",border:`1.5px solid ${cfg.border}`,background:cfg.bg,color:cfg.color}}>{cfg.label}</span></td></tr>);})}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PENGATURAN USER: PROFIL FORM
// ─────────────────────────────────────────────────────────────
function PengaturanProfilFormUser({ user, setUser, showAlert, IS, B, DK: DKp, T: Tp }) {
  const DKf = DKp || { text: "#0F172A", dimtext: "#64748B" };
  const dm_p = !!(DKp && DKp.surface && DKp.surface !== "#fff");
  const t = Tp || {};
  const isEn_p = t.laporan === "Report";
  const surface_p = dm_p ? "#1E293B" : "#fff";
  const border_p  = dm_p ? "1px solid #334155" : "1px solid #030c1769";
  const subtext_p = dm_p ? "#94A3B8" : "#374151";
  const surfHov_p = dm_p ? "#273449" : "#F8FAFC";
  const FF_p = "'Plus Jakarta Sans', sans-serif";
  const [form, setForm] = useState({ nama:user?.nama||"", phone:user?.phone||"" });
  const [loading, setLoading] = useState(false);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const fileRef = useRef();
  useEffect(()=>{ profilService.getData().then(res=>{ const d=res.data.data; setForm({nama:d.nama||"",phone:d.phone||""}); }).catch(()=>{}); },[]);
  const initials=user?.nama?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"U";
  const onF=e=>{e.target.style.borderColor="#2563EB";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)";};
  const onB=(d=false)=>e=>{e.target.style.borderColor=d?"#E2E8F0":"#CBD5E1";e.target.style.boxShadow="none";};
  // Poin 8: intercept dulu
  const handleSave=(e)=>{e.preventDefault();setShowConfirmSave(true);};
  const doSave=async()=>{setShowConfirmSave(false);setLoading(true);try{const res=await profilService.updateData(form);setUser(prev=>({...prev,nama:res.data.data.nama,phone:res.data.data.phone}));showAlert({type:"success",title:t.profilSaved||"Profil Tersimpan!",message:t.profilSavedMsg||"Data profil berhasil disimpan."});}catch(err){showAlert({type:"error",title:t.failedTitle||"Gagal!",message:err.response?.data?.message||"Gagal."});}finally{setLoading(false);}};
  const handleHapusFotoPg=()=>{
    if(!user?.fotoProfil)return;
    showAlert({
      type:"delete",
      title:isEn_p?"Delete Profile Photo?":"Hapus Foto Profil?",
      message:isEn_p?"Your profile photo will be permanently deleted.":"Foto profil Anda akan dihapus permanen.",
      confirmLabel:isEn_p?"Yes, Delete":"Ya, Hapus",
      onConfirm:async()=>{
        setLoadingFoto(true);
        try{await profilService.deleteFoto();setUser(prev=>({...prev,fotoProfil:null}));if(refreshUser)refreshUser();showAlert({type:"success",title:isEn_p?"Photo Deleted!":"Foto Dihapus!",message:isEn_p?"Profile photo removed.":"Foto profil berhasil dihapus."});}
        catch{showAlert({type:"error",title:isEn_p?"Failed!":"Gagal!",message:isEn_p?"Failed to delete photo.":"Gagal menghapus foto."});}
        finally{setLoadingFoto(false);}
      },
    });
  };

  const handleFoto=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const resetRef=()=>{if(fileRef.current)fileRef.current.value="";};
    showAlert({
      type:"confirm",
      title:isEn_p?"Update Profile Photo?":"Perbarui Foto Profil?",
      message:isEn_p?"Your current profile photo will be replaced.":"Foto profil Anda saat ini akan diganti.",
      confirmLabel:isEn_p?"Yes, Update":"Ya, Perbarui",
      onConfirm:async()=>{
        setLoadingFoto(true);
        try{const res=await profilService.uploadFoto(file);setUser(prev=>({...prev,fotoProfil:res.data.data.fotoProfil}));showAlert({type:"success",title:t.photoUploaded||"Foto Diperbarui!",message:t.photoUploadedMsg||"Foto profil berhasil diperbarui."});}
        catch{showAlert({type:"error",title:t.failedTitle||"Gagal!",message:isEn_p?"Failed to upload photo.":"Gagal mengupload foto."});}
        finally{setLoadingFoto(false);resetRef();}
      },
      onCancel:resetRef,
    });
  };
  return (
    <>
    <form onSubmit={handleSave}>
      <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px",paddingBottom:"20px",borderBottom:B}}>
        <div style={{position:"relative"}}><div style={{width:"60px",height:"60px",borderRadius:"50%",background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:800,color:"#fff",overflow:"hidden",border:dm_p?"3px solid #1E293B":"3px solid #fff",boxShadow:"0 0 0 2px #2563EB"}}>{user?.fotoProfil?<img src={user.fotoProfil} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials}</div><button type="button" onClick={()=>fileRef.current.click()} disabled={loadingFoto} style={{position:"absolute",bottom:"-2px",right:"-2px",width:"22px",height:"22px",borderRadius:"50%",background:"#2563EB",border:dm_p?"2px solid #1E293B":"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>{user?.fotoProfil&&(<button type="button" onClick={handleHapusFotoPg} disabled={loadingFoto} title={isEn_p?"Remove photo":"Hapus foto"} style={{position:"absolute",bottom:"-2px",left:"-2px",width:"22px",height:"22px",borderRadius:"50%",background:"#EF4444",border:dm_p?"2px solid #1E293B":"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#DC2626"} onMouseLeave={e=>e.currentTarget.style.background="#EF4444"}><svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>)}</div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFoto}/>
        <div><p style={{fontSize:"14px",fontWeight:700,color:DKf.text,margin:"0 0 2px"}}>{user?.nama}</p><p style={{fontSize:"12px",color:DKf.dimtext,margin:0}}>{user?.email}</p>{loadingFoto&&<p style={{fontSize:"11px",color:"#2563EB",margin:"4px 0 0"}}>{t.uploadingPhoto||(t.laporan==="Report"?"Uploading photo...":"Mengupload foto...")}</p>}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        <div><label style={{fontSize:"12px",fontWeight:700,color:DKf.text,display:"block",marginBottom:"6px"}}>{t.namaLabel||"Nama Lengkap"}</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder={t.namaPlaceholder||"Nama lengkap"} style={IS()} onFocus={onF} onBlur={onB()}/></div>
        <div><label style={{fontSize:"12px",fontWeight:700,color:DKf.text,display:"block",marginBottom:"6px"}}>{t.nohpLabel||"No. Telepon"}</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder={t.nohpPlaceholder||"08xxxxxxxxxx"} style={IS()} onFocus={onF} onBlur={onB()}/><p style={{fontSize:"11px",color:DKf.dimtext,margin:"4px 0 0"}}>{t.nohpHint||(t.laporan==="Report"?"Reachable phone number":"Nomor yang dapat dihubungi")}</p></div>
      </div>
      <div style={{height:"1px",background:dm_p?"#334155":"#F1F5F9",margin:"4px 0 14px"}}/>
      <p style={{fontSize:"10px",fontWeight:700,color:DKf.dimtext,letterSpacing:"1.2px",textTransform:"uppercase",margin:"0 0 12px"}}>{t.infoAkun||(t.laporan==="Report"?"Account Info":"Informasi Akun")}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        <div><label style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",display:"block",marginBottom:"6px"}}>{t.emailLabel||"Email"}</label><input value={user?.email||""} disabled style={IS(true)}/><p style={{fontSize:"11px",color:"#94A3B8",margin:"4px 0 0"}}>{t.emailHint||"Tidak dapat diubah"}</p></div>
        <div><label style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",display:"block",marginBottom:"6px"}}>{t.usernameLabel||"Username"}</label><input value={user?.username||""} disabled style={IS(true)}/><p style={{fontSize:"11px",color:"#94A3B8",margin:"4px 0 0"}}>{t.usernameHint||"Tidak dapat diubah"}</p></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"20px"}}>
        <div><label style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",display:"block",marginBottom:"6px"}}>{t.roleLabel||"Role"}</label><div style={{padding:"10px 13px",border:dm_p?"2px solid #334155":"2px solid #E2E8F0",borderRadius:"9px",background:dm_p?"#0F172A":"#F8FAFC"}}><span style={{fontSize:"12px",fontWeight:700,color:"#059669",background:"#DCFCE7",padding:"3px 10px",borderRadius:"5px",border:"1.5px solid #86EFAC",textTransform:"capitalize"}}>{user?.role}</span></div></div>
        <div><label style={{fontSize:"12px",fontWeight:700,color:"#94A3B8",display:"block",marginBottom:"6px"}}>{t.accountStatus||"Status Akun"}</label><div style={{padding:"10px 13px",border:dm_p?"2px solid #334155":"2px solid #E2E8F0",borderRadius:"9px",background:dm_p?"#0F172A":"#F8FAFC",display:"flex",alignItems:"center",gap:"8px"}}><span style={{width:"7px",height:"7px",borderRadius:"50%",background:"#22C55E",boxShadow:"0 0 0 2px #DCFCE7",flexShrink:0}}/><span style={{fontSize:"12px",fontWeight:700,color:"#15803D",background:"#DCFCE7",padding:"3px 10px",borderRadius:"5px",border:"1.5px solid #86EFAC"}}>{t.active||"Aktif"}</span></div></div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",paddingTop:"12px",borderTop:B}}>
        <button type="submit" disabled={loading} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"10px 24px",background:loading?"#93C5FD":"#2563EB",color:"#fff",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}} onMouseEnter={e=>{if(!loading)e.currentTarget.style.background="#1D4ED8";}} onMouseLeave={e=>{if(!loading)e.currentTarget.style.background="#2563EB";}}>
          {loading?<><span style={{display:"inline-block",width:"12px",height:"12px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>{t.menyimpan||"Menyimpan..."}</>:<><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>{t.simpan||"Simpan Perubahan"}</>}
        </button>
      </div>
    </form>

    {/* ── Poin 8: Konfirmasi Simpan Profil (Pengaturan) ── */}
    {showConfirmSave && (
      <div onClick={() => setShowConfirmSave(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
        <div onClick={e => e.stopPropagation()} style={{ background:surface_p,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm_p?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:border_p,overflow:"hidden",fontFamily:FF_p }}>
          <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <p style={{ fontSize:"16px",fontWeight:800,color:dm_p?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FF_p }}>
              {isEn_p ? "Save Profile?" : "Simpan Profil?"}
            </p>
            <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FF_p }}>
              {isEn_p ? "Are you sure you want to update your profile data?" : "Yakin ingin menyimpan perubahan data profil?"}
            </p>
          </div>
          <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
            <button onClick={() => setShowConfirmSave(false)} style={{ flex:1,padding:"11px",border:border_p,background:"transparent",color:subtext_p,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF_p,borderRadius:"9px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = surfHov_p}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {isEn_p ? "Cancel" : "Batal"}
            </button>
            <button onClick={doSave} style={{ flex:1,padding:"11px",border:"2px solid #2563EB",background:"#2563EB",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF_p,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
              onMouseLeave={e => e.currentTarget.style.background = "#2563EB"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {isEn_p ? "Yes, Save" : "Ya, Simpan"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PENGATURAN USER: PASSWORD FORM
// ─────────────────────────────────────────────────────────────
function PengaturanPasswordFormUser({ showAlert, IS, B, DK: DKp, T: Tp }) {
  const DKf = DKp || { text: "#0F172A", dimtext: "#64748B" };
  const dm_pass = !!(DKp && DKp.surface && DKp.surface !== "#fff");
  const t = Tp || {};
  const isEn_pw = t.laporan === "Report";
  const surface_pw = dm_pass ? "#1E293B" : "#fff";
  const border_pw  = dm_pass ? "1px solid #334155" : "1px solid #030c1769";
  const subtext_pw = dm_pass ? "#94A3B8" : "#374151";
  const surfHov_pw = dm_pass ? "#273449" : "#F8FAFC";
  const FF_pw = "'Plus Jakarta Sans', sans-serif";
  const [form, setForm] = useState({password_lama:"",password_baru:"",konfirmasi_password:""});
  const [showPass, setShowPass] = useState({lama:false,baru:false,konfirmasi:false});
  const [loading, setLoading] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const SC=["#E2E8F0","#EF4444","#F59E0B","#3B82F6","#059669"];
  const SL = t.strengthLabels || ["","Terlalu pendek","Lemah","Cukup kuat","Sangat kuat"];
  const strength=!form.password_baru?0:form.password_baru.length<8?1:form.password_baru.length>=8&&/[A-Z]/.test(form.password_baru)&&/[0-9]/.test(form.password_baru)&&/[^a-zA-Z0-9]/.test(form.password_baru)?4:form.password_baru.length>=8&&(/[A-Z]/.test(form.password_baru)||/[0-9]/.test(form.password_baru))?3:2;
  const ISP={...IS(),padding:"10px 42px 10px 13px"};
  const Eye=({show,onToggle})=>(<button type="button" onClick={onToggle} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:0,display:"flex"}}><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={show?"M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21":"M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}/></svg></button>);
  // Poin 8: validasi dulu, lalu konfirmasi
  const handleSubmit=(e)=>{e.preventDefault();if(form.password_baru!==form.konfirmasi_password)return showAlert({type:"error",title:t.failedTitle||"Gagal!",message:t.passMismatchError||"Password baru tidak sama."});if(form.password_baru.length<8)return showAlert({type:"error",title:t.failedTitle||"Gagal!",message:t.passMinError||"Password minimal 8 karakter."});setShowConfirmPw(true);};
  const doUpdatePw=async()=>{setShowConfirmPw(false);setLoading(true);try{await profilService.updatePassword(form);setForm({password_lama:"",password_baru:"",konfirmasi_password:""});showAlert({type:"success",title:t.passSuccess||"Password Diperbarui!",message:t.passSuccessMsg||"Password berhasil diperbarui."});}catch(err){showAlert({type:"error",title:t.failedTitle||"Gagal!",message:err.response?.data?.message||"Gagal."});}finally{setLoading(false);}};
  return (
    <>
    <form onSubmit={handleSubmit}>
      <div style={{padding:"12px 16px",background:"#FFFBEB",borderRadius:"10px",border:"1px solid #FDE68A",display:"flex",gap:"12px",alignItems:"flex-start",marginBottom:"18px"}}><div style={{width:"32px",height:"32px",borderRadius:"8px",background:"#FEF3C7",border:"1.5px solid #D97706",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><div><p style={{fontSize:"12px",fontWeight:700,color:"#92400E",margin:"0 0 2px"}}>{t.perhatian||"Perhatian"}</p><p style={{fontSize:"12px",color:"#A16207",margin:0,lineHeight:1.5}}>{t.passWarning||"Setelah password diperbarui, Anda perlu login ulang."}</p></div></div>
      <div style={{display:"grid",gap:"14px",marginBottom:"20px"}}>
        <div><label style={{fontSize:"12px",fontWeight:700,color:DKf.text,display:"block",marginBottom:"6px"}}>{t.passLama||"Password Saat Ini"}</label><div style={{position:"relative"}}><input type={showPass.lama?"text":"password"} value={form.password_lama} onChange={e=>setForm({...form,password_lama:e.target.value})} placeholder={t.passLamaPlaceholder||"Password saat ini"} style={ISP} onFocus={e=>{e.target.style.borderColor="#2563EB";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)";}} onBlur={e=>{e.target.style.borderColor=dm_pass?"#475569":"#CBD5E1";e.target.style.boxShadow="none";}}/><Eye show={showPass.lama} onToggle={()=>setShowPass(p=>({...p,lama:!p.lama}))}/></div></div>
        <div style={{height:"1px",background:dm_pass?"#334155":"#F1F5F9"}}/>
        <div><label style={{fontSize:"12px",fontWeight:700,color:DKf.text,display:"block",marginBottom:"6px"}}>{t.passBaru||"Password Baru"}</label><div style={{position:"relative"}}><input type={showPass.baru?"text":"password"} value={form.password_baru} onChange={e=>setForm({...form,password_baru:e.target.value})} placeholder={t.passBaruPlaceholder||"Minimal 8 karakter"} style={ISP} onFocus={e=>{e.target.style.borderColor="#2563EB";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)";}} onBlur={e=>{e.target.style.borderColor=dm_pass?"#475569":"#CBD5E1";e.target.style.boxShadow="none";}}/><Eye show={showPass.baru} onToggle={()=>setShowPass(p=>({...p,baru:!p.baru}))}/></div>{form.password_baru&&<div style={{marginTop:"8px"}}><div style={{display:"flex",gap:"3px",marginBottom:"4px"}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:"4px",borderRadius:"2px",background:i<=strength?SC[strength]:"#E2E8F0",transition:"background .25s"}}/>)}</div><p style={{fontSize:"11px",color:SC[strength],fontWeight:700,margin:0}}>{SL[strength]}</p></div>}</div>
        <div><label style={{fontSize:"12px",fontWeight:700,color:DKf.text,display:"block",marginBottom:"6px"}}>{t.passKonfirmasi||"Konfirmasi Password Baru"}</label><div style={{position:"relative"}}><input type={showPass.konfirmasi?"text":"password"} value={form.konfirmasi_password} onChange={e=>setForm({...form,konfirmasi_password:e.target.value})} placeholder={t.passKonfirmasiPlaceholder||"Ulangi password baru"} style={ISP} onFocus={e=>{e.target.style.borderColor="#2563EB";e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)";}} onBlur={e=>{e.target.style.borderColor=dm_pass?"#475569":"#CBD5E1";e.target.style.boxShadow="none";}}/><Eye show={showPass.konfirmasi} onToggle={()=>setShowPass(p=>({...p,konfirmasi:!p.konfirmasi}))}/></div>{form.konfirmasi_password&&<p style={{fontSize:"11px",margin:"5px 0 0",fontWeight:500,color:form.password_baru!==form.konfirmasi_password?"#EF4444":"#059669"}}>{form.password_baru!==form.konfirmasi_password?(t.passMismatch||"⚠ Password tidak sama"):(t.passMatch||"✓ Password cocok")}</p>}</div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",paddingTop:"12px",borderTop:B}}>
        <button type="submit" disabled={loading} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"10px 24px",background:loading?"#6EE7B7":"#059669",color:"#fff",border:"none",borderRadius:"10px",fontSize:"13px",fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit"}} onMouseEnter={e=>{if(!loading)e.currentTarget.style.background="#047857";}} onMouseLeave={e=>{if(!loading)e.currentTarget.style.background="#059669";}}>
          {loading?<><span style={{display:"inline-block",width:"12px",height:"12px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>{t.memperbarui||"Memperbarui..."}</>:<><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>{t.perbarui||"Perbarui Password"}</>}
        </button>
      </div>
    </form>

    {/* ── Poin 8: Konfirmasi Update Password (Pengaturan) ── */}
    {showConfirmPw && (
      <div onClick={() => setShowConfirmPw(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
        <div onClick={e => e.stopPropagation()} style={{ background:surface_pw,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm_pass?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:border_pw,overflow:"hidden",fontFamily:FF_pw }}>
          <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p style={{ fontSize:"16px",fontWeight:800,color:dm_pass?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FF_pw }}>
              {isEn_pw ? "Update Password?" : "Perbarui Password?"}
            </p>
            <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FF_pw }}>
              {isEn_pw ? "After updating, you will need to log in again." : "Setelah diperbarui, Anda perlu login ulang."}
            </p>
          </div>
          <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
            <button onClick={() => setShowConfirmPw(false)} style={{ flex:1,padding:"11px",border:border_pw,background:"transparent",color:subtext_pw,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF_pw,borderRadius:"9px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = surfHov_pw}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {isEn_pw ? "Cancel" : "Batal"}
            </button>
            <button onClick={doUpdatePw} style={{ flex:1,padding:"11px",border:"2px solid #D97706",background:"#D97706",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF_pw,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#B45309"}
              onMouseLeave={e => e.currentTarget.style.background = "#D97706"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {isEn_pw ? "Yes, Update" : "Ya, Perbarui"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function NotifikasiPage({ notifList, unreadCount, onBaca, onBacaSemua, darkMode, DK, T: Tp, onGoToLaporan, onDelete }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #030c1769", text:"#0F172A", subtext:"#374151", dimtext:"#64748B", surfaceHover:"#F8FAFC" };
  const pBorder = dm ? "1px solid #334155" : "1px solid #030c1769";
  const dkCard = { background: dk.surface, borderRadius:"12px", border:pBorder, boxShadow: dm?"0 1px 4px rgba(0,0,0,0.6)":"0 1px 4px rgba(8,18,42,0.44)" };
  const t = Tp || {};
  const [detailNotif, setDetailNotif] = React.useState(null);
  const isEn = t.laporan === "Report";

  const TIPE_CFG = {
    laporan_baru: { bg:"#EFF6FF", border:"#BFDBFE", color:"#2563EB", label:isEn?"New Report":"Laporan Baru", icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    status_update: { bg:"#ECFDF5", border:"#A7F3D0", color:"#059669", label:isEn?"Status Update":"Update Status", icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    laporan_ditolak: { bg:"#FEF2F2", border:"#FECACA", color:"#DC2626", label:isEn?"Rejected":"Ditolak", icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    info: { bg:"#EFF6FF", border:"#BFDBFE", color:"#2563EB", label:isEn?"Notification":"Notifikasi", icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  };

  function fmtTime(ts) {
    const d=new Date(ts),now=new Date(),diff=Math.floor((now-d)/1000);
    if(diff<60)return isEn?"Just now":"Baru saja";
    if(diff<3600)return isEn?`${Math.floor(diff/60)}m ago`:`${Math.floor(diff/60)} menit lalu`;
    if(diff<86400)return isEn?`${Math.floor(diff/3600)}h ago`:`${Math.floor(diff/3600)} jam lalu`;
    const days=Math.floor(diff/86400);
    if(days<30)return isEn?`${days}d ago`:`${days} hari lalu`;
    return d.toLocaleDateString(isEn?"en-US":"id-ID",{day:"numeric",month:"short",year:"numeric"});
  }

  function fmtFull(ts) {
    if(!ts)return"—";
    const d=new Date(ts);
    const MONTHS_ID=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const MONTHS_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const DAYS_ID=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const DAYS_EN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const day=isEn?DAYS_EN[d.getDay()]:DAYS_ID[d.getDay()];
    const mon=isEn?MONTHS_EN[d.getMonth()]:MONTHS_ID[d.getMonth()];
    const hh=String(d.getHours()).padStart(2,"0");
    const mn=String(d.getMinutes()).padStart(2,"0");
    return `${day}, ${d.getDate()} ${mon} ${d.getFullYear()} · ${hh}:${mn}`;
  }

  const handleClick=(n)=>{if(!n.dibaca)onBaca(n.id);setDetailNotif(n);};

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
      {/* Detail Modal */}
      {detailNotif&&(()=>{
        const cfg=TIPE_CFG[detailNotif.tipe]||TIPE_CFG.info;
        return (
          <div onClick={()=>setDetailNotif(null)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:dk.surface,borderRadius:"16px",width:"100%",maxWidth:"420px",border:pBorder,overflow:"hidden",fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:dm?"0 24px 48px rgba(0,0,0,0.6)":"0 24px 48px rgba(15,23,42,0.18)" }}>
              <div style={{ padding:"20px 20px 16px",display:"flex",alignItems:"flex-start",gap:"14px",borderBottom:pBorder,background:dm?"#273449":"#F8FAFC" }}>
                <div style={{ width:"44px",height:"44px",borderRadius:"12px",background:cfg.bg,border:`1.5px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.color,flexShrink:0 }}>{cfg.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px" }}>
                    <span style={{ fontSize:"10px",fontWeight:700,color:cfg.color,background:cfg.bg,border:`1.5px solid ${cfg.border}`,padding:"2px 8px",borderRadius:"20px" }}>{cfg.label}</span>
                    <span style={{ fontSize:"11px",color:dk.dimtext }}>{fmtTime(detailNotif.createdAt)}</span>
                  </div>
                  <p style={{ fontSize:"13px",fontWeight:700,color:dk.text,margin:0 }}>{isEn?"Notification Detail":"Detail Notifikasi"}</p>
                </div>
                <button onClick={()=>setDetailNotif(null)} style={{ width:"32px",height:"32px",borderRadius:"50%",background:dm?"rgba(239,68,68,0.12)":"#FFF1F2",border:"1.5px solid #FECACA",cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ padding:"20px" }}>
                <div style={{ padding:"16px",background:dm?"#1E293B":"#F8FAFC",borderRadius:"12px",border:pBorder,marginBottom:"16px" }}>
                  <p style={{ fontSize:"14px",fontWeight:600,color:dk.text,margin:0,lineHeight:1.6 }}>{detailNotif.pesan}</p>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px" }}>
                  <div style={{ padding:"12px",background:dm?"#273449":"#fff",borderRadius:"10px",border:pBorder }}>
                    <p style={{ fontSize:"10px",fontWeight:700,color:dk.dimtext,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.8px" }}>{isEn?"Time":"Waktu"}</p>
                    <p style={{ fontSize:"13px",fontWeight:700,color:dk.text,margin:"0 0 3px" }}>{fmtTime(detailNotif.createdAt)}</p>
                    <p style={{ fontSize:"11px",color:dk.dimtext,margin:0 }}>{fmtFull(detailNotif.createdAt)}</p>
                  </div>
                  <div style={{ padding:"12px",background:dm?"#273449":"#fff",borderRadius:"10px",border:pBorder }}>
                    <p style={{ fontSize:"10px",fontWeight:700,color:dk.dimtext,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.8px" }}>Status</p>
                    <p style={{ fontSize:"13px",fontWeight:700,color:detailNotif.dibaca?"#059669":"#2563EB",margin:0 }}>{detailNotif.dibaca?(isEn?"Already Read":"Sudah Dibaca"):(isEn?"Unread":"Belum Dibaca")}</p>
                  </div>
                </div>
                <div style={{ display:"flex",gap:"8px" }}>
                  {detailNotif.laporanId&&(
                    <button onClick={()=>{setDetailNotif(null);if(onGoToLaporan)onGoToLaporan(detailNotif.laporanId);}}
                      style={{ flex:1,padding:"11px",background:"#2563EB",border:"2px solid #1D4ED8",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"all .15s" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#1D4ED8")} onMouseLeave={e=>(e.currentTarget.style.background="#2563EB")}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
                      {isEn?"View Report":"Lihat Laporan"}
                    </button>
                  )}
                  <button onClick={()=>setDetailNotif(null)} style={{ padding:"11px 18px",background:"transparent",border:pBorder,color:dk.subtext,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:"11px",transition:"all .15s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background=dm?"#273449":"#F8FAFC")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    {isEn?"Close":"Tutup"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div style={{ ...dkCard,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:"15px",fontWeight:800,color:dk.text,margin:0 }}>{t.notifikasi||"Notifikasi"}</p>
          <p style={{ fontSize:"12px",color:dk.dimtext,margin:"2px 0 0" }}>{unreadCount>0?`${unreadCount} ${t.unread||"belum dibaca"}`:(t.semuaDibaca||"Semua sudah dibaca")}</p>
        </div>
        {unreadCount>0&&(
          <button onClick={onBacaSemua} style={{ padding:"7px 14px",background:"#EFF6FF",color:"#2563EB",border:"1.5px solid #BFDBFE",borderRadius:"8px",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
            {t.markRead||"Tandai Semua Dibaca"}
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ ...dkCard,overflow:"hidden" }}>
        {notifList.length===0?(
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px" }}>
            <div style={{ width:"52px",height:"52px",borderRadius:"14px",background:dm?dk.surfaceHover:"#F8FAFC",border:pBorder,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"14px",color:dk.dimtext }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p style={{ fontSize:"13px",fontWeight:700,color:dk.subtext,margin:"0 0 4px" }}>{t.noNotif||"Belum ada notifikasi"}</p>
            <p style={{ fontSize:"12px",color:dk.dimtext,margin:0 }}>{t.notifFromAdmin||"Notifikasi dari admin akan muncul di sini"}</p>
          </div>
        ):notifList.map((n,idx)=>{
          const cfg=TIPE_CFG[n.tipe]||TIPE_CFG.info;
          const isLast=idx===notifList.length-1;
          const unreadBg=dm?"#1A2744":"#FAFBFF";
          return (
            <div key={n.id} onClick={()=>handleClick(n)}
              style={{ display:"flex",alignItems:"flex-start",gap:"12px",padding:"14px 16px",borderBottom:isLast?"none":(dm?"1px solid #1E293B":"1px solid #F1F5F9"),background:n.dibaca?"transparent":unreadBg,cursor:"pointer",transition:"background .15s",position:"relative" }}
              onMouseEnter={e=>(e.currentTarget.style.background=dm?"#273449":"#F1F7FF")}
              onMouseLeave={e=>(e.currentTarget.style.background=n.dibaca?"transparent":unreadBg)}>
              {!n.dibaca&&<div style={{ position:"absolute",top:"18px",left:"5px",width:"5px",height:"5px",borderRadius:"50%",background:"#3B82F6" }}/>}
              <div style={{ width:"42px",height:"42px",borderRadius:"14px",background:dm?`${cfg.bg}30`:cfg.bg,border:`1.5px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.color,flexShrink:0 }}>{cfg.icon}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"4px" }}>
                  <p style={{ fontSize:"13px",fontWeight:n.dibaca?500:700,color:dk.text,margin:0,lineHeight:1.5,flex:1 }}>{n.pesan}</p>
                  <span style={{ fontSize:"10px",color:dk.dimtext,flexShrink:0,paddingTop:"2px",whiteSpace:"nowrap" }}>{fmtTime(n.createdAt)}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:"5px",marginBottom:n.laporanId?"8px":"0" }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={dk.dimtext} strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize:"10px",color:dk.dimtext }}>
                    {(()=>{const d=new Date(n.createdAt);const MI=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];const ME=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const mon=isEn?ME[d.getMonth()]:MI[d.getMonth()];const hh=String(d.getHours()).padStart(2,"0");const mn=String(d.getMinutes()).padStart(2,"0");return`${d.getDate()} ${mon} ${d.getFullYear()}, ${hh}:${mn}`;})()}
                  </span>
                </div>
                {n.laporanId&&(
                  <button onClick={e=>{e.stopPropagation();if(onGoToLaporan)onGoToLaporan(n.laporanId);}}
                    style={{ display:"inline-flex",alignItems:"center",gap:"4px",fontSize:"11px",fontWeight:700,color:"#fff",background:"#2563EB",border:"none",padding:"5px 12px",borderRadius:"20px",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",boxShadow:"0 2px 6px rgba(37,99,235,0.35)" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="#1D4ED8")} onMouseLeave={e=>(e.currentTarget.style.background="#2563EB")}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
                    {isEn?"View Report":"Lihat Laporan"}
                  </button>
                )}
              </div>
              {/* Right: unread badge + delete button */}
              <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px", paddingTop:"2px" }}>
                {!n.dibaca&&(
                  <span style={{ fontSize:"9px",fontWeight:800,color:"#fff",background:"#3B82F6",padding:"2px 7px",borderRadius:"20px" }}>{isEn?"New":"Baru"}</span>
                )}
                <button onClick={e=>{e.stopPropagation();if(onDelete)onDelete(n.id, n);}}
                  title={isEn?"Delete notification":"Hapus notifikasi"}
                  style={{ width:"28px",height:"28px",borderRadius:"8px",border:"1.5px solid #FECACA",background:"transparent",cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="#FEF2F2")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardUserPage() {
  const { user, setUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [navHistory, setNavHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigateTo = (id) => {
    setNavHistory(prev => [...prev, activeNav]);
    setActiveNav(id);
  };
  const navigateBack = () => {
    if (navHistory.length === 0) {
      setActiveNav("dashboard");
      return;
    }
    const copy = [...navHistory];
    const last = copy.pop();
    setNavHistory(copy);
    setActiveNav(last || "dashboard");
  };
  // Sidebar clicks: push previous page to history too so back button works
  const sidebarNav = (id) => {
    if (id !== activeNav) {
      setNavHistory(prev => [...prev, activeNav]);
    }
    setActiveNav(id);
  };
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState(null);
  const [alert, setAlert] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [myLaporan, setMyLaporan] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkModeU, setDarkModeU] = useState(() => localStorage.getItem("laporku_dark")==="true");
  const [bahasaU, setBahasaU] = useState(() => localStorage.getItem("laporku_lang")||"id");
  const [laporanLightboxOpen, setLaporanLightboxOpen] = useState(false);
  const [laporanInDetail, setLaporanInDetail]       = useState(false);
  const closeLightboxRef = React.useRef(null);
  const [notifOn, setNotifOn] = useState(() => {
    const saved = localStorage.getItem("laporku_notif_on");
    return saved === null ? true : saved === "true";
  });
  const [logoutOtomatis, setLogoutOtomatis] = useState(() => {
    const saved = localStorage.getItem("laporku_alert_ditolak");
    return saved === null ? true : saved === "true";
  });

  // Persist toggles to localStorage
  const handleNotifToggle = (val) => {
    setNotifOn(val);
    localStorage.setItem("laporku_notif_on", String(val));
  };
  const handleAlertDitolakToggle = (val) => {
    setLogoutOtomatis(val);
    localStorage.setItem("laporku_alert_ditolak", String(val));
  };
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // DK: dark mode color tokens — same pattern as admin
  const DK = darkModeU ? {
    bg: "#0F172A",
    surface: "#1E293B",
    surfaceHover: "#273449",
    border: "1px solid #334155",
    borderColor: "#334155",
    text: "#F1F5F9",
    subtext: "#94A3B8",
    dimtext: "#64748B",
    inputBg: "#1E293B",
    inputBorder: "#475569",
    cardShadow: "0 1px 4px rgba(0,0,0,0.6)",
    headerBg: "#1E293B",
    sidebarBg: "#070D1A",
    tableRow: "#1E293B",
    tableRowHover: "#273449",
  } : {
    bg: "#F1F5F9",
    surface: "#fff",
    surfaceHover: "#F8FAFC",
    border: "1px solid #030c1769",
    borderColor: "#030c1769",
    text: "#0F172A",
    subtext: "#374151",
    dimtext: "#64748B",
    inputBg: "#fff",
    inputBorder: "#CBD5E1",
    cardShadow: "0 1px 4px rgba(8, 18, 42, 0.44)",
    headerBg: "#fff",
    sidebarBg: "#0F172A",
    tableRow: "#fff",
    tableRowHover: "#F8FAFC",
  };

  // Language translations
  const T = bahasaU === "en" ? {
    dashboard: "Dashboard", laporanSaya: "My Reports", buatLaporan: "Create Report",
    laporan: "Reports", notifikasi: "Notifications", analitik: "Analytics",
    pengaturan: "Settings", profil: "Profile", logout: "Logout",
    totalLaporan: "My Reports", diproses: "In Process", selesai: "Completed", ditolak: "Rejected",
    totalSub: "total reports", diprosessub: "being handled", selesaiSub: "successfully done", ditolakSub: "not processed",
    statusLaporan: "Report Status", distribusi: "Distribution of your reports", riwayat: "My Reports",
    riwayatSub: "History of your submitted reports", lihatSemua: "View All",
    belumAda: "No reports yet", mulai: "Click 'Create Report' to start",
    masyarakat: "Community", tema: "Theme", bahasa: "Language",
    modeDarkLabel: "Dark Mode", modeLightLabel: "Light Mode",
    indonesia: "Indonesia 🇮🇩", english: "English 🇬🇧",
    notifLaporan: "Report notifications", notifLaporanSub: "Receive status update notifications",
    alertDitolak: "Rejected report alert", alertDitolakSub: "Special warning when your report is rejected",
    tentang: "About", namaApp: "App Name", versi: "Version", developer: "Developer",
    institusi: "Institution", mataKuliah: "Course",
    pengaturanTitle: "Settings", pengaturanSub: "Manage your account preferences",
    dataProfil: "Profile Data", dataProfilSub: "Update your personal information",
    keamananAkun: "Account Security", keamananAkunSub: "Manage your account password",
    temaAplikasi: "App Theme",
    tren: "Report Trend", trenSub: "Last 6 months reporting activity",
    distribusiStatus: "Status Distribution", distribusiSub: "Comparison of your report statuses",
    kategoriLaporan: "Report Categories", kategoriSub: "Categories you report most often",
    harian: "Daily", mingguan: "Weekly", bulanan: "Monthly", tahunan: "Yearly",
    periodeLabel: "Period",
    // UI labels
    batal: "Cancel", simpan: "Save Changes", perbarui: "Update Password",
    menyimpan: "Saving...", memperbarui: "Updating...",
    kirimLaporan: "Submit Report", menuUtama: "Main Menu",
    kembaliDashboard: "Back to Dashboard",
    buatLaporanBaru: "Create New Report",
    namaLaporan: "Report Name", keterangan: "Description", lokasiLabel: "Location",
    fotoBukti: "Evidence Photos", opsional: "optional, max. 5 photos",
    klikPilihFoto: "Click to select photos (max. 5)",
    formatFoto: "JPG, PNG, WEBP — max. 5MB/photo",
    tambah: "Add",
    hitungFoto: (n) => `${n}/5 photos — click × to remove`,
    statusLabel: "Status", jumlah: "Count",
    totalLabel: "Total", totalReports: "Total Reports",
    completionRate: "Completion Rate", fromTotal: "of total reports",
    allReports: "all reports",
    menunggu: "Pending", diprosesLabel: "In Process", selesaiLabel: "Completed", ditolakLabel: "Rejected",
    pending: "Pending", inProcess: "In Process",
    statusChart: "Status", descriptionLabel: "Description", reportInfo: "Report Info",
    reporter: "Reporter", phone: "Phone", locationLabel: "Location", reportDate: "Report Date",
    noPhoto: "No evidence photos",
    otherUserReport: "This report belongs to another user — view only",
    cannotDelete: "Cannot be deleted",
    hapus: "Delete",
    noNotif: "No notifications yet", notifFromAdmin: "Admin notifications will appear here",
    markRead: "Mark all as read",
    unread: "unread",
    selectLocation: "Select Location on Map",
    clickMapHint: "Click on the map to set the report location",
    close: "Close",
    useLocation: "Use This Location",
    clickMapInstruction: "👆 Click on the map to select a location",
    locating: "Locating...",
    currentLocation: "Current Location",
    enlargePhoto: "Enlarge",
    photosLabel: (n) => `(${n} photo${n>1?'s':''} — click to enlarge)`,
    myLaporanFilter: "My Reports", allFilter: "All",
    analitikTitle: "Report Analytics", analitikSub: "Statistics and distribution of your reports",
    logoutConfirmTitle: "Sign out?", logoutConfirmMsg: "Your session will end and you will be redirected to the login page.",
    yesLogout: "Yes, Sign Out",
    loginSuccess: "Login Successful!",
    loginWelcome: (nama) => `Welcome, ${nama}! You are logged in as Community.`,
    roleLabel: "Role", accountStatus: "Account Status", active: "Active",
    editProfil: "Edit Profile", ubahAkun: "Update account info",
    pengaturanMenu: "Settings", temaKeamanan: "Theme, language & security",
    logoutMenu: "Sign Out", keluarSesi: "Exit this session",
    perhatian: "Warning",
    passWarning: "After updating your password, you will need to log in again.",
    passLama: "Current Password", passBaru: "New Password", passKonfirmasi: "Confirm New Password",
    passLamaPlaceholder: "Current password", passBaruPlaceholder: "Minimum 8 characters",
    passKonfirmasiPlaceholder: "Repeat new password",
    strengthLabels: ["", "Too short", "Weak", "Fairly strong", "Very strong"],
    passMatch: "✓ Passwords match", passMismatch: "⚠ Passwords do not match",
    failedTitle: "Failed!", passMinError: "Password must be at least 8 characters.",
    passMismatchError: "New passwords do not match.",
    passSuccess: "Password Updated!", passSuccessMsg: "Password updated successfully.",
    profilSaved: "Profile Saved!", profilSavedMsg: "Profile data updated successfully.",
    photoUploaded: "Photo Updated!", photoUploadedMsg: "Profile photo updated successfully.",
    fotoProfilLabel: "Profile Photo", ubahFoto: "Change Photo",
    tabProfil: "Profile", tabPassword: "Password",
    namaLabel: "Full Name", nohpLabel: "Phone Number",
    emailLabel: "Email", usernameLabel: "Username",
    namaPlaceholder: "Your full name", nohpPlaceholder: "Your phone number",
    emailHint: "Email cannot be changed",
    usernameHint: "Username cannot be changed",
    namaHint: (v) => v.length < 3 ? "⚠ Minimum 3 characters" : v.length > 50 ? "⚠ Maximum 50 characters" : "✓ Valid name",
    kategoriLabel: "Category", pilihKategori: "— Select Category —",
    optionalLabel: "optional",
    keteranganPlaceholder: "Describe the incident in detail, location, time...",
    lokasiPlaceholder: "Type location or use GPS",
    buatLaporanSub: "Fill in the report details completely and clearly",
    statusHistory: "Status History", beingHandled: "Being handled", resolved: "Issue resolved",
    laporan: "Report",
    lastUpdated: "Last Updated",
    allLaporanTitle: "All Reports", myLaporanDesc: "reports you created",
    allLaporanDesc: "visible to all users", cariLaporan: "Search reports...",
    semuaDibaca: "All read",
    belumAda: "No reports yet",
    selesaiSub: "successfully resolved",
    riwayatSub: "All reports you have submitted",
    infoAkun: "Account Info",
    uploadingPhoto: "Uploading photo...",
    nohpHint: "Reachable phone number",
  } : {
    dashboard: "Dashboard", laporanSaya: "Laporan Saya", buatLaporan: "Buat Laporan",
    laporan: "Laporan", notifikasi: "Notifikasi", analitik: "Analitik",
    pengaturan: "Pengaturan", profil: "Profil", logout: "Logout",
    totalLaporan: "Laporan Saya", diproses: "Diproses", selesai: "Selesai", ditolak: "Ditolak",
    totalSub: "total laporan", diprosessub: "sedang ditangani", selesaiSub: "berhasil selesai", ditolakSub: "tidak diproses",
    statusLaporan: "Status Laporan", distribusi: "Distribusi laporan Anda", riwayat: "Laporan Saya",
    riwayatSub: "Riwayat laporan yang pernah dibuat", lihatSemua: "Lihat Semua",
    belumAda: "Belum ada laporan", mulai: "Klik 'Buat Laporan' untuk mulai",
    masyarakat: "Masyarakat", tema: "Tema", bahasa: "Bahasa",
    modeDarkLabel: "Mode Gelap", modeLightLabel: "Mode Terang",
    indonesia: "Indonesia 🇮🇩", english: "English 🇬🇧",
    notifLaporan: "Notifikasi laporan", notifLaporanSub: "Terima notifikasi update status laporan Anda",
    alertDitolak: "Alert laporan ditolak", alertDitolakSub: "Peringatan khusus saat laporan Anda ditolak",
    tentang: "Tentang Aplikasi", namaApp: "Nama Aplikasi", versi: "Versi", developer: "Developer",
    institusi: "Institusi", mataKuliah: "Mata Kuliah",
    pengaturanTitle: "Pengaturan", pengaturanSub: "Kelola preferensi akun Anda",
    dataProfil: "Data Profil", dataProfilSub: "Perbarui informasi pribadi Anda",
    keamananAkun: "Keamanan Akun", keamananAkunSub: "Kelola password akun Anda",
    temaAplikasi: "Tema Aplikasi",
    tren: "Tren Laporan", trenSub: "Aktivitas pelaporan dalam periode dipilih",
    distribusiStatus: "Distribusi Status", distribusiSub: "Perbandingan status laporan Anda",
    kategoriLaporan: "Kategori Laporan", kategoriSub: "Kategori yang sering Anda laporkan",
    harian: "Harian", mingguan: "Mingguan", bulanan: "Bulanan", tahunan: "Tahunan",
    periodeLabel: "Periode",
    // UI labels
    batal: "Batal", simpan: "Simpan Perubahan", perbarui: "Perbarui Password",
    menyimpan: "Menyimpan...", memperbarui: "Memperbarui...",
    kirimLaporan: "Kirim Laporan", menuUtama: "Menu Utama",
    kembaliDashboard: "Kembali ke Dashboard",
    buatLaporanBaru: "Buat Laporan Baru",
    namaLaporan: "Nama Laporan", keterangan: "Keterangan", lokasiLabel: "Lokasi",
    fotoBukti: "Foto Bukti", opsional: "opsional, maks. 5 foto",
    klikPilihFoto: "Klik untuk pilih foto (maks. 5)",
    formatFoto: "JPG, PNG, WEBP — maks. 5MB/foto",
    tambah: "Tambah",
    hitungFoto: (n) => `${n}/5 foto — klik × untuk hapus`,
    statusLabel: "Status", jumlah: "Jumlah",
    totalLabel: "Total", totalReports: "Total Laporan",
    completionRate: "Tingkat Selesai", fromTotal: "dari total laporan",
    allReports: "semua laporan",
    menunggu: "Menunggu", diprosesLabel: "Diproses", selesaiLabel: "Selesai", ditolakLabel: "Ditolak",
    pending: "Menunggu", inProcess: "Diproses",
    statusChart: "Status", descriptionLabel: "Keterangan", reportInfo: "Informasi Laporan",
    reporter: "Pelapor", phone: "No. HP", locationLabel: "Lokasi", reportDate: "Tanggal Laporan",
    noPhoto: "Tidak ada foto bukti",
    otherUserReport: "Laporan milik pengguna lain — hanya bisa dilihat",
    cannotDelete: "Tidak bisa dihapus",
    hapus: "Hapus",
    noNotif: "Belum ada notifikasi", notifFromAdmin: "Notifikasi dari admin akan muncul di sini",
    markRead: "Tandai semua dibaca",
    unread: "belum dibaca",
    selectLocation: "Pilih Lokasi di Peta",
    clickMapHint: "Klik pada peta untuk menentukan titik lokasi laporan",
    close: "Tutup",
    useLocation: "Pilih Lokasi Ini",
    clickMapInstruction: "👆 Klik pada peta untuk memilih titik lokasi",
    locating: "Mendeteksi...",
    currentLocation: "Lokasi Saat Ini",
    enlargePhoto: "Perbesar",
    photosLabel: (n) => `(${n} foto — klik untuk perbesar)`,
    myLaporanFilter: "Laporan Saya", allFilter: "Semua",
    analitikTitle: "Analitik Laporan", analitikSub: "Statistik dan distribusi laporan Anda",
    logoutConfirmTitle: "Keluar dari akun?", logoutConfirmMsg: "Sesi Anda akan diakhiri dan diarahkan ke halaman login.",
    yesLogout: "Ya, Logout",
    loginSuccess: "Login Berhasil!",
    loginWelcome: (nama) => `Selamat datang, ${nama}! Anda berhasil masuk sebagai Masyarakat.`,
    roleLabel: "Role", accountStatus: "Status Akun", active: "Aktif",
    editProfil: "Edit Profil", ubahAkun: "Ubah data akun Anda",
    pengaturanMenu: "Pengaturan", temaKeamanan: "Tema, bahasa & keamanan",
    logoutMenu: "Logout", keluarSesi: "Keluar dari sesi ini",
    perhatian: "Perhatian",
    passWarning: "Setelah password diperbarui, Anda perlu login ulang.",
    passLama: "Password Saat Ini", passBaru: "Password Baru", passKonfirmasi: "Konfirmasi Password Baru",
    passLamaPlaceholder: "Password saat ini", passBaruPlaceholder: "Minimal 8 karakter",
    passKonfirmasiPlaceholder: "Ulangi password baru",
    strengthLabels: ["", "Terlalu pendek", "Lemah", "Cukup kuat", "Sangat kuat"],
    passMatch: "✓ Password cocok", passMismatch: "⚠ Password tidak sama",
    failedTitle: "Gagal!", passMinError: "Password minimal 8 karakter.",
    passMismatchError: "Password baru tidak sama.",
    passSuccess: "Password Diperbarui!", passSuccessMsg: "Password berhasil diperbarui.",
    profilSaved: "Profil Tersimpan!", profilSavedMsg: "Data profil berhasil diperbarui.",
    photoUploaded: "Foto Diperbarui!", photoUploadedMsg: "Foto profil berhasil diperbarui.",
    fotoProfilLabel: "Foto Profil", ubahFoto: "Ubah Foto",
    tabProfil: "Profil", tabPassword: "Password",
    namaLabel: "Nama Lengkap", nohpLabel: "Nomor HP",
    emailLabel: "Email", usernameLabel: "Username",
    namaPlaceholder: "Nama lengkap Anda", nohpPlaceholder: "Nomor HP Anda",
    emailHint: "Email tidak dapat diubah",
    usernameHint: "Username tidak dapat diubah",
    namaHint: (v) => v.length < 3 ? "⚠ Minimal 3 karakter" : v.length > 50 ? "⚠ Maksimal 50 karakter" : "✓ Nama valid",
    kategoriLabel: "Kategori", pilihKategori: "— Pilih Kategori —",
    optionalLabel: "opsional",
    keteranganPlaceholder: "Jelaskan detail kejadian, lokasi, waktu...",
    lokasiPlaceholder: "Ketik lokasi atau gunakan GPS",
    buatLaporanSub: "Isi detail laporan dengan lengkap dan jelas",
    statusHistory: "Riwayat Status", beingHandled: "Sedang ditindaklanjuti", resolved: "Masalah telah diatasi",
    laporan: "Laporan",
    lastUpdated: "Terakhir Diperbarui",
    allLaporanTitle: "Semua Laporan", myLaporanDesc: "laporan yang kamu buat",
    allLaporanDesc: "transparan, bisa dilihat semua pengguna", cariLaporan: "Cari laporan...",
    semuaDibaca: "Semua sudah dibaca",
    belumAda: "Belum ada laporan",
    selesaiSub: "berhasil selesai",
    riwayatSub: "Semua laporan yang pernah Anda buat",
    infoAkun: "Informasi Akun",
    uploadingPhoto: "Mengupload foto...",
    nohpHint: "Nomor yang dapat dihubungi",
  };

  const handleToggleDarkU = (val) => {
    setDarkModeU(val);
    localStorage.setItem("laporku_dark", val ? "true" : "false");
  };
  const handleBahasaU = (val) => { setBahasaU(val); localStorage.setItem("laporku_lang", val); window.__laporku_lang = val; };

  const loadUserData = React.useCallback(async () => {
    try {
      const [statsRes, myRes] = await Promise.all([
        laporanService.getStats(),
        laporanService.getMy(),
      ]);
      setUserStats(statsRes.data.data);
      setMyLaporan(myRes.data.data.slice(0, 5));
    } catch {}
  }, []);

  const notifOnRef = React.useRef(notifOn);
  const alertDitolakRef = React.useRef(logoutOtomatis);
  React.useEffect(() => { notifOnRef.current = notifOn; }, [notifOn]);
  React.useEffect(() => { alertDitolakRef.current = logoutOtomatis; }, [logoutOtomatis]);

  const loadNotif = React.useCallback(async () => {
    try {
      const res = await notifikasiService.getAll();
      const newData = res.data.data || [];
      const newUnread = res.data.unread || 0;

      // Show browser notifications for NEW unread items (if enabled)
      setNotifList(prev => {
        const prevIds = new Set(prev.map(n => n.id));
        const freshNotifs = newData.filter(n => !prevIds.has(n.id) && !n.dibaca);

        if (freshNotifs.length > 0 && notifOnRef.current) {
          freshNotifs.forEach(n => {
            // Filter: if it's a rejection, only notify if alertDitolak is ON
            const isRejection = n.tipe === "laporan_ditolak";
            if (isRejection && !alertDitolakRef.current) return;

            // Browser push notification
            if (typeof Notification !== "undefined") {
              if (Notification.permission === "granted") {
                new Notification("LaporKu", {
                  body: n.pesan,
                  icon: "/favicon.ico",
                  tag: n.id,
                });
              } else if (Notification.permission === "default") {
                Notification.requestPermission();
              }
            }
          });
        }
        return newData;
      });

      // Filter unread count: if notifOn is OFF, show 0 badge
      setUnreadCount(notifOnRef.current ? newUnread : 0);
    } catch {}
  }, []);

  useEffect(() => {
    loadUserData();
    const t = setInterval(loadUserData, 30000);
    return () => clearInterval(t);
  }, [loadUserData]);

  useEffect(() => {
    loadNotif();
    const t = setInterval(loadNotif, 30000);
    return () => clearInterval(t);
  }, [loadNotif]);

  // Re-sync badge when notif toggle changes
  useEffect(() => { loadNotif(); }, [notifOn]);

  useEffect(() => {
    const shown = sessionStorage.getItem("userLoginToastShown");
    if (!shown) {
      setAlert({
        type: "success",
        title: T.loginSuccess,
        message: T.loginWelcome(user?.nama || (bahasaU === "en" ? "User" : "Pengguna")),
      });
      sessionStorage.setItem("userLoginToastShown", "1");
    }
  }, []);

  useEffect(() => {
    kategoriService.getAll()
      .then((res) => setKategoriList(res.data.data))
      .catch(() => {});
  }, []);

  const showAlert = (alertData) => setAlert(alertData);

  const initials = user?.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    setUser(null);
    sessionStorage.removeItem("userLoginToastShown");
    navigate("/login");
  };

  // Translated nav labels — override static NAV with current language
  const NAV_T = NAV.map(n => ({
    ...n,
    label: {
      dashboard: T.dashboard || "Dashboard",
      buat: T.buatLaporan || "Buat Laporan",
      laporan: T.laporanSaya || "Laporan Saya",
      notifikasi: T.notifikasi || "Notifikasi",
      analitik: T.analitik || "Analitik",
      pengaturan: T.pengaturan || "Pengaturan",
    }[n.id] || n.label,
  }));

  const pageTitle = NAV_T.find((n) => n.id === activeNav)?.label || "Dashboard";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: DK.bg,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "background 0.3s",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {alert && (
        <AlertPopup
          alert={alert}
          onClose={() => {
            if (alert?.onCancel) alert.onCancel();
            setAlert(null);
          }}
          onConfirm={() => {
            if (alert?.onConfirm) alert.onConfirm();
            setAlert(null);
          }}
        />
      )}
      <ConfirmDialog
        dialog={
          confirmLogout
            ? {
                title: T.logoutConfirmTitle,
                message: T.logoutConfirmMsg,
              }
            : null
        }
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        T={T}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── SIDEBAR — sama persis dgn admin ── */}
      <aside
        style={{
          width: sidebarOpen ? "280px" : "60px",
          minHeight: "100vh",
          background: DK.sidebarBg,
          display: "flex",
          flexDirection: "column",
          transition: "width .22s cubic-bezier(.4,0,.2,1)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          borderRight: B,
        }}
      >
        <div
          style={{
            padding: sidebarOpen ? "0 18px" : "18px 10px",
            borderBottom: B,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            minHeight: "100px",
            flexShrink: 0,
          }}
        >
          {sidebarOpen ? (
            <img
              src={logoDark}
              alt="LaporKu"
              style={{ height: "110px", width: "auto", display: "block" }}
            />
          ) : (
<div style={{ width:"36px", height:"36px" }}/>
          )}
        </div>

        {/* Sidebar toggle — arrow only, no box */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          style={{
            position: "absolute",
            top: "14px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            transition: "color .15s",
            zIndex: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}/>
          </svg>
        </button>

        {sidebarOpen && (
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              padding: "16px 16px 6px",
              margin: 0,
              flexShrink: 0,
            }}
          >
            {T.menuUtama}
          </p>
        )}

        <nav
          style={{
            flex: 1,
            padding: "4px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            overflowY: "auto",
          }}
        >
          {NAV_T.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => sidebarNav(item.id)}
                title={!sidebarOpen ? item.label : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: sidebarOpen ? "9px 10px" : "10px",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: "8px",
                  border: isActive
                    ? "1.5px solid #3B82F6"
                    : "1.5px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive ? "rgba(37,99,235,0.9)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all .14s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(37,99,235,0.4)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    e.currentTarget.style.border =
                      "1.5px solid rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    e.currentTarget.style.border = "1.5px solid transparent";
                  }
                }}
              >
                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", flex:1 }}>
                    {item.label}
                  </span>
                )}
                {sidebarOpen && item.badge && unreadCount > 0 && (
                  <span style={{ fontSize:"9px", fontWeight:800, color:"#fff", background:"#EF4444", borderRadius:"99px", padding:"1px 6px", flexShrink:0, lineHeight:"16px", minWidth:"16px", textAlign:"center" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: B, padding: "10px 8px", flexShrink: 0 }}>
          {sidebarOpen && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "8px 10px",
                marginBottom: "2px",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                  overflow: "hidden",
                  border: "2px solid #334155",
                }}
              >
                {user?.fotoProfil ? (
                  <img
                    src={user.fotoProfil}
                    alt="profil"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#F1F5F9",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.nama || "Pengguna"}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.3)",
                    margin: 0,
                  }}
                >
                  {T.masyarakat}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setConfirmLogout(true)}
            title={!sidebarOpen ? "Logout" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: sidebarOpen ? "9px 10px" : "10px",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              width: "100%",
              borderRadius: "8px",
              border: "1.5px solid transparent",
              cursor: "pointer",
              background: "transparent",
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              fontWeight: 400,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: "all .14s",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.12)";
              e.currentTarget.style.color = "#FCA5A5";
              e.currentTarget.style.border = "1.5px solid rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              e.currentTarget.style.border = "1.5px solid transparent";
            }}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ flexShrink: 0 }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Header — sama persis dgn admin */}
        <header
          style={{
            background: DK.headerBg,
            borderBottom: darkModeU ? "2px solid #334155" : "2px solid #030c1740",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: darkModeU ? "0 4px 6px -2px rgba(0,0,0,0.4)" : "0 4px 6px -2px rgba(3,12,23,0.08)",
            transition: "background 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {activeNav !== "dashboard" && (
              <button
                onClick={() => {
                  // Priority 1: lightbox terbuka → tutup lightbox dulu
                  if (laporanLightboxOpen && closeLightboxRef.current) {
                    closeLightboxRef.current();
                  }
                  // Priority 2: sedang di detail laporan → kembali ke list laporan
                  else if (laporanInDetail) {
                    // trigger reset viewMode di LaporanContent via callback
                    setLaporanInDetail(false);
                    // dispatch custom event ke LaporanContent untuk reset ke list
                    window.dispatchEvent(new CustomEvent('laporan:backToList'));
                  }
                  // Priority 3: navigasi biasa
                  else {
                    navigateBack();
                  }
                }}
                title="Kembali"
                style={{
                  background: darkModeU ? "#1E293B" : "#F8FAFC",
                  border: DK.border,
                  borderRadius: "10px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  color: darkModeU ? "#94A3B8" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = darkModeU ? "#334155" : "#E2E8F0";
                  e.currentTarget.style.color = darkModeU ? "#F1F5F9" : "#0F172A";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = darkModeU ? "#1E293B" : "#F8FAFC";
                  e.currentTarget.style.color = darkModeU ? "#94A3B8" : "#475569";
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{ fontSize: "12px", color: DK.dimtext, fontWeight: 500 }}
              >
                LaporKu
              </span>
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke={darkModeU ? "#475569" : "#CBD5E1"}
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span
                style={{ fontSize: "13px", fontWeight: 800, color: DK.text }}
              >
                {pageTitle}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => sidebarNav("notifikasi")}
              style={{
                position: "relative",
                background: darkModeU ? "#1E293B" : "#F8FAFC",
                border: darkModeU ? "1px solid #334155" : B,
                borderRadius: "8px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FBBF24",
                boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkModeU ? "#273449" : "#FEF3C7";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkModeU ? "#1E293B" : "#F8FAFC";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(15,23,42,0.08)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1"/>
              </svg>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    minWidth: "16px",
                    height: "16px",
                    background: "#EF4444",
                    borderRadius: "20px",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#fff",
                    padding: "0 3px",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <ProfileDropdown
              user={user}
              initials={initials}
              onEditProfil={() => setActiveNav("profil")}
              onLogout={() => setConfirmLogout(true)}
              onPengaturan={() => setActiveNav("pengaturan")}
              darkMode={darkModeU}
              DK={DK}
              T={T}
            />
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "22px 24px", overflowY: "auto", background: DK.bg, transition: "background 0.3s" }}>
          {activeNav === "profil" && (
            <ProfilContent
              user={user}
              setUser={setUser}
              refreshUser={refreshUser}
              onBack={navigateBack}
              showAlert={showAlert}
              darkMode={darkModeU}
              DK={DK}
              T={T}
            />
          )}

          {activeNav === "dashboard" && (
            <>
              {/* 4 stat cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"18px" }}>
                {[
                  { label:T.totalLaporan, key:"total",    gradient:"linear-gradient(135deg,#1D4ED8 0%,#1E40AF 100%)", sub:T.totalSub,    icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
                  { label:T.diproses,     key:"diproses", gradient:"linear-gradient(135deg,#D97706 0%,#B45309 100%)", sub:T.diprosessub, icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> },
                  { label:T.selesai,      key:"selesai",  gradient:"linear-gradient(135deg,#059669 0%,#047857 100%)", sub:T.selesaiSub, icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                  { label:T.ditolak,      key:"ditolak",  gradient:"linear-gradient(135deg,#DC2626 0%,#B91C1C 100%)", sub:T.ditolakSub,   icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
                ].map((s,i)=>(
                  <div key={i} style={{ ...CARD, padding:"22px 24px", background:s.gradient, border:"2px solid rgba(0,0,0,0.2)", boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
                      <span style={{ fontSize:"12px", fontWeight:700, color:"#fff", letterSpacing:"0.3px", textTransform:"uppercase", textShadow:"0 1px 3px rgba(0,0,0,0.4)", WebkitTextStroke:"0.5px #0F172A" }}>{s.label}</span>
                      <div style={{ width:"44px", height:"44px", borderRadius:"10px", background:"rgba(255,255,255,0.2)", border:"2px solid rgba(0,0,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>{s.icon}</div>
                    </div>
                    <p style={{ fontSize:"42px", fontWeight:800, color:"#fff", margin:0, lineHeight:1, letterSpacing:"-1px", textShadow:"0 2px 4px rgba(0,0,0,0.35)", WebkitTextStroke:"0.8px #0F172A" }}>{userStats?(userStats[s.key]??0):"—"}</p>
                    <p style={{ fontSize:"12px", color:"#fff", margin:"8px 0 0", fontWeight:600 }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* 1 card: Status (kiri) | Laporan Saya (kanan) */}
              <div style={{ background:DK.surface, borderRadius:"12px", border:DK.border, boxShadow:DK.cardShadow, display:"grid", gridTemplateColumns:"1fr 1fr" }}>

                {/* KIRI: Status Laporan */}
                <div style={{ borderRight:DK.border, overflow:"hidden" }}>
                  <div style={{ padding:"14px 18px", borderBottom:DK.border }}>
                    <p style={{ fontSize:"13px", fontWeight:800, color:DK.text, margin:0 }}>{T.statusLaporan}</p>
                    <p style={{ fontSize:"11px", color:DK.dimtext, margin:"2px 0 0" }}>{T.distribusi}</p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 20px 20px" }}>
                    <DonutChart
                      stats={userStats}
                      darkMode={darkModeU}
                      dkText={DK.text}
                      DK={DK}
                      T={T}
                    />
                    <div style={{ width:"100%", borderTop:DK.border }}>
                      <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:DK.surfaceHover }}>
                            <th style={{ padding:"8px 12px", fontSize:"11px", fontWeight:700, color:DK.dimtext, textAlign:"left", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:DK.border }}>{T.statusLabel}</th>
                            <th style={{ padding:"8px 12px", fontSize:"11px", fontWeight:700, color:DK.dimtext, textAlign:"center", borderBottom:DK.border }}>{T.jumlah}</th>
                            <th style={{ padding:"8px 12px", fontSize:"11px", fontWeight:700, color:DK.dimtext, textAlign:"right", borderBottom:DK.border }}>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {label:T.menunggu,key:"menunggu",color:"#F59E0B"},
                            {label:T.diprosesLabel,key:"diproses",color:"#7C3AED"},
                            {label:T.selesaiLabel, key:"selesai", color:"#10B981"},
                            {label:T.ditolakLabel, key:"ditolak", color:"#EF4444"},
                          ].map((s,idx)=>{
                            const t=userStats?.total||0, val=userStats?.[s.key]||0;
                            const pct=t?Math.round(val/t*100):0;
                            return (
                              <tr key={s.key} style={{borderBottom:idx<3?DK.border:"none"}} onMouseEnter={e=>{Array.from(e.currentTarget.cells).forEach(c=>c.style.background=DK.surfaceHover)}} onMouseLeave={e=>{Array.from(e.currentTarget.cells).forEach(c=>c.style.background="transparent")}}>
                                <td style={{ padding:"10px 12px" }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                    <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:s.color, flexShrink:0 }}/>
                                    <span style={{ fontSize:"13px", color:DK.subtext, fontWeight:500 }}>{s.label}</span>
                                  </div>
                                </td>
                                <td style={{ padding:"10px 12px", fontWeight:800, fontSize:"14px", color:DK.text, textAlign:"center" }}>{val}</td>
                                <td style={{ padding:"10px 12px", fontSize:"13px", color:DK.dimtext, textAlign:"right" }}>{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* KANAN: Laporan Saya */}
                <div style={{ minWidth:0 }}>
                  <div style={{ padding:"14px 18px", borderBottom:DK.border, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <p style={{ fontSize:"13px", fontWeight:800, color:DK.text, margin:0 }}>{T.riwayat}</p>
                      <p style={{ fontSize:"11px", color:DK.dimtext, margin:"2px 0 0" }}>{T.riwayatSub}</p>
                    </div>
                    <div style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>navigateTo("buat")} style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"5px 12px", background:"#059669", color:"#fff", border:"none", borderRadius:"7px", fontSize:"11px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }} onMouseEnter={e=>(e.currentTarget.style.background="#047857")} onMouseLeave={e=>(e.currentTarget.style.background="#059669")}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        {T.buatLaporan}
                      </button>
                      <button onClick={()=>navigateTo("laporan")} style={{ fontSize:"11px", fontWeight:700, color:"#2563EB", background:"#EFF6FF", border:"2px solid #BFDBFE", borderRadius:"7px", padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", boxShadow:"2px 2px 0 #BFDBFE" }}>{T.lihatSemua}</button>
                    </div>
                  </div>
                  {myLaporan.length===0 ? (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", textAlign:"center" }}>
                      <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:DK.surfaceHover, border:DK.border, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"12px", color:DK.dimtext }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                      </div>
                      <p style={{ fontSize:"13px", fontWeight:700, color:DK.text, margin:"0 0 4px" }}>{T.belumAda}</p>
                      <p style={{ fontSize:"12px", color:DK.dimtext, margin:0 }}>{T.mulai}</p>
                    </div>
                  ) : (
                    <div style={{ overflowY:"auto", maxHeight:"320px" }}>
                      {myLaporan.slice(0,8).map((r,i)=>{
                        const SC={menunggu:{label:T.menunggu,color:"#B45309",bg:"#FFFBEB",border:"#FDE68A"},diproses:{label:T.diprosesLabel,color:"#6D28D9",bg:"#F5F3FF",border:"#DDD6FE"},selesai:{label:T.selesaiLabel,color:"#065F46",bg:"#ECFDF5",border:"#A7F3D0"},ditolak:{label:T.ditolakLabel,color:"#991B1B",bg:"#FEF2F2",border:"#FECACA"}};
                        const cfg=SC[r.status]||SC.menunggu;
                        const fmtDate=(d)=>{const nd=new Date(d);const MONTHS_ID=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];const MONTHS_EN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const mon=T.laporan==="Report"?MONTHS_EN[nd.getMonth()]:MONTHS_ID[nd.getMonth()];return`${nd.getDate()} ${mon}`;};
                        const relTime=(d)=>{const now=new Date();const diff=Math.floor((now-new Date(d))/1000);if(diff<60)return T.laporan==="Report"?"Just now":"Baru saja";if(diff<3600)return T.laporan==="Report"?`${Math.floor(diff/60)}m ago`:`${Math.floor(diff/60)} mnt lalu`;if(diff<86400)return T.laporan==="Report"?`${Math.floor(diff/3600)}h ago`:`${Math.floor(diff/3600)} jam lalu`;const days=Math.floor(diff/86400);return T.laporan==="Report"?`${days}d ago`:`${days} hari lalu`;};
                        return (
                          <div key={r.id} style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"12px 18px", borderBottom:DK.border, transition:"background .12s" }}
                            onMouseEnter={e=>(e.currentTarget.style.background=DK.surfaceHover)}
                            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                            <span style={{ fontSize:"11px", color:DK.dimtext, fontWeight:600, width:"20px", flexShrink:0, paddingTop:"2px" }}>{String(i+1).padStart(2,"0")}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:"12px", fontWeight:700, color:DK.text, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.judul}</p>
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", marginBottom:"3px" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:"5px", minWidth:0 }}>
                                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                  <span style={{ fontSize:"11px", color:DK.subtext, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.nama}</span>
                                </div>
                                <span onClick={()=>navigateTo("laporan")} style={{ fontSize:"10px", fontWeight:700, padding:"2px 0", borderRadius:"20px", border:`1.5px solid ${cfg.border}`, background:cfg.bg, color:cfg.color, cursor:"pointer", flexShrink:0, transition:"opacity .15s", minWidth:"72px", textAlign:"center", display:"inline-block" }}
                                  onMouseEnter={e=>(e.currentTarget.style.opacity="0.7")} onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>{cfg.label}</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><path d="M4 6h16M4 10h16M4 14h8"/></svg>
                                <span style={{ fontSize:"11px", color:DK.dimtext }}>{r.kategori||"—"}</span>
                              </div>
                              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2} style={{ flexShrink:0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <span style={{ fontSize:"10px", color:DK.dimtext }}>{fmtDate(r.tanggal)} · {relTime(r.tanggal)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}


          {activeNav === "laporan" && (
            <LaporanContent
              user={user}
              kategoriList={kategoriList}
              showAlert={showAlert}
              onBuatLaporan={() => navigateTo("buat")}
              darkMode={darkModeU}
              DK={DK}
              T={T}
              onViewModeChange={(mode) => setLaporanInDetail(mode === "detail")}
              onLightboxStateChange={(open, closeFn) => {
                setLaporanLightboxOpen(open);
                if (open && closeFn) closeLightboxRef.current = closeFn;
                if (!open) closeLightboxRef.current = null;
              }}
            />
          )}

          {activeNav === "buat" && (
            <BuatContent
              user={user}
              kategoriList={kategoriList}
              showAlert={showAlert}
              onSaved={() => {
                loadUserData();
                setActiveNav("laporan");
              }}
              onBack={() => navigateTo("dashboard")}
              darkMode={darkModeU}
              DK={DK}
              T={T}
            />
          )}

          {activeNav === "notifikasi" && (
            <NotifikasiPage
              notifList={notifList}
              unreadCount={unreadCount}
              onBaca={async (id) => {
                await notifikasiService.baca(id);
                loadNotif();
              }}
              onBacaSemua={async () => {
                await notifikasiService.bacaSemua();
                loadNotif();
              }}
              darkMode={darkModeU}
              DK={DK}
              T={T}
              onGoToLaporan={(laporanId) => {
                navigateTo("laporan");
              }}
              onDelete={(id, notif) => {
                const isEn = bahasaU === "en";
                setAlert({
                  type: "delete",
                  title: isEn ? "Delete Notification?" : "Hapus Notifikasi?",
                  message: isEn
                    ? "This notification will be permanently deleted."
                    : "Notifikasi ini akan dihapus permanen.",
                  confirmLabel: isEn ? "Yes, Delete" : "Ya, Hapus",
                  onConfirm: async () => {
                    try { await notifikasiService.hapus(id); loadNotif(); } catch {}
                  },
                });
              }}
            />
          )}

          {activeNav === "analitik" && (
            <AnalitikUserPage
              userStats={userStats}
              myLaporan={myLaporan}
              DK={DK}
              T={T}
              darkMode={darkModeU}
            />
          )}

          {activeNav === "pengaturan" && (() => {
            const SLabel = ({ children }) => (
              <p style={{ fontSize:"11px", fontWeight:700, color:DK.dimtext, letterSpacing:"1.2px", textTransform:"uppercase", margin:"0 0 6px 4px" }}>{children}</p>
            );
            const SCard = ({ children }) => (
              <div style={{ background:DK.surface, borderRadius:"16px", border:DK.border, overflow:"hidden", boxShadow:darkModeU?"0 1px 4px rgba(0,0,0,0.4)":"0 1px 4px rgba(8,18,42,0.08)", marginBottom:"20px" }}>
                {children}
              </div>
            );
            const SRow = ({ icon, iconBg, title, sub, right, onPress, last }) => (
              <div onClick={onPress} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", borderBottom:last?"none":DK.border, cursor:onPress?"pointer":"default", transition:"background .12s" }}
                onMouseEnter={e=>{ if(onPress) e.currentTarget.style.background=darkModeU?"#273449":"#F8FAFC"; }}
                onMouseLeave={e=>{ if(onPress) e.currentTarget.style.background="transparent"; }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"9px", background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"14px", fontWeight:500, color:DK.text, margin:0 }}>{title}</p>
                  {sub && <p style={{ fontSize:"12px", color:DK.dimtext, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</p>}
                </div>
                {right && <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:"6px" }}>{right}</div>}
                {onPress && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2.5} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
            );
            const Toggle = ({ on, onToggle }) => (
              <div onClick={onToggle} style={{ width:"44px", height:"26px", borderRadius:"13px", background:on?"#22C55E":"#CBD5E1", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:"3px", left:on?"21px":"3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.3)", transition:"left .2s" }}/>
              </div>
            );
            const aboutItems = [
              [T.namaApp||"Nama Aplikasi","LaporKu"],
              [T.versi||"Versi","1.0.0"],
              [T.developer||"Developer","Ryo Satriagung Hidayat"],
              [T.institusi||"Institusi","Webora Dev"]
            ];
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:"0", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                {/* Profile card */}
                <div onClick={()=>navigateTo("profil")} style={{ background:DK.surface, borderRadius:"16px", border:DK.border, padding:"16px", display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px", cursor:"pointer", boxShadow:darkModeU?"0 1px 4px rgba(0,0,0,0.4)":"0 1px 4px rgba(8,18,42,0.08)", transition:"background .12s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=darkModeU?"#273449":"#F8FAFC")}
                  onMouseLeave={e=>(e.currentTarget.style.background=DK.surface)}>
                  <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", fontWeight:800, color:"#fff", overflow:"hidden", flexShrink:0, border:`2px solid ${DK.border}` }}>
                    {user?.fotoProfil
                      ? <img src={user.fotoProfil} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : (user?.nama?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"U")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"16px", fontWeight:700, color:DK.text, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.nama||"Pengguna"}</p>
                    <p style={{ fontSize:"12px", color:DK.dimtext, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                    <div style={{ display:"flex", gap:"5px" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", background:darkModeU?"#1E3A5F":"#DBEAFE", color:"#1D4ED8", border:"1.5px solid #BFDBFE", textTransform:"capitalize" }}>{user?.role}</span>
                      <span style={{ fontSize:"11px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", background:darkModeU?"#064E3B":"#DCFCE7", color:"#15803D", border:"1.5px solid #86EFAC" }}>{T.active||"Aktif"}</span>
                    </div>
                  </div>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2.5} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>

                {/* Biodata */}
                <SLabel>{T.infoAkun||"Informasi Akun"}</SLabel>
                <SCard>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} iconBg={darkModeU?"#1E3A5F":"#EFF6FF"} title={T.namaLabel||"Nama Lengkap"} sub={user?.nama||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} iconBg={darkModeU?"#1E3A5F":"#EFF6FF"} title="Username" sub={`@${user?.username||"-"}`}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} iconBg={darkModeU?"#064E3B":"#ECFDF5"} title={T.emailLabel||"Email"} sub={user?.email||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a2 2 0 0 1 2-2.18h3"/></svg>} iconBg={darkModeU?"#451A03":"#FFFBEB"} title={T.nohpLabel||"No. HP"} sub={user?.phone||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>} iconBg={darkModeU?"#450A0A":"#FEF2F2"} title={T.passLama||"Ubah Password"} sub={T.keamananAkunSub||"Perbarui keamanan akun"} onPress={()=>navigateTo("profil")} last/>
                </SCard>

                {/* Tampilan & Bahasa */}
                <SLabel>{T.temaAplikasi||"Tampilan & Bahasa"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={darkModeU?"#FBBF24":"#475569"} strokeWidth={2}>{darkModeU?<path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>:<circle cx="12" cy="12" r="5"/>}</svg>}
                    iconBg={darkModeU?"#1C2A3A":"#F1F5F9"}
                    title={darkModeU?(T.modeDarkLabel||"Mode Gelap"):(T.modeLightLabel||"Mode Terang")}
                    sub={darkModeU?"Tampilan gelap aktif":"Tampilan terang aktif"}
                    right={<Toggle on={darkModeU} onToggle={()=>handleToggleDarkU(!darkModeU)}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>}
                    iconBg={darkModeU?"#064E3B":"#ECFDF5"}
                    title={T.bahasa||"Bahasa"}
                    sub={bahasaU==="id"?"Indonesia 🇮🇩":"English 🇬🇧"}
                    right={
                      <div style={{ display:"flex", gap:"4px" }}>
                        {["id","en"].map(lang=>(
                          <button key={lang} onClick={()=>handleBahasaU(lang)} style={{ minWidth:"40px", height:"28px", padding:"0 10px", borderRadius:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:`1.5px solid ${bahasaU===lang?"#22C55E":DK.border}`, background:bahasaU===lang?"#22C55E":"transparent", color:bahasaU===lang?"#fff":DK.subtext, transition:"all .15s" }}>
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    }
                    last
                  />
                </SCard>

                {/* Notifikasi */}
                <SLabel>{T.notifikasi||"Notifikasi"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                    iconBg={darkModeU?"#1E3A5F":"#EFF6FF"}
                    title={T.notifLaporan||"Notifikasi laporan"}
                    sub={T.notifLaporanSub||"Terima notifikasi update status laporan Anda"}
                    right={<Toggle on={notifOn} onToggle={()=>handleNotifToggle(!notifOn)}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
                    iconBg={darkModeU?"#450A0A":"#FEF2F2"}
                    title={T.alertDitolak||"Alert laporan ditolak"}
                    sub={T.alertDitolakSub||"Peringatan khusus saat laporan Anda ditolak"}
                    right={<Toggle on={logoutOtomatis} onToggle={()=>handleAlertDitolakToggle(!logoutOtomatis)}/>}
                    last
                  />
                </SCard>

                {/* Bantuan */}
                <SLabel>{bahasaU==="en"?"Help":"Bantuan"}</SLabel>
                <SCard>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} iconBg={darkModeU?"#1E3A5F":"#EFF6FF"} title="FAQ" sub={bahasaU==="en"?"Frequently asked questions":"Pertanyaan yang sering ditanyakan"} onPress={()=>setShowFaqModal(true)} theme={DK}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} iconBg={darkModeU?"#064E3B":"#ECFDF5"} title={bahasaU==="en"?"Privacy Policy":"Kebijakan Privasi"} sub={bahasaU==="en"?"How we handle your data":"Cara kami mengelola data Anda"} onPress={()=>setShowPrivasiModal(true)} theme={DK}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#25D366" strokeWidth={2}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>} iconBg={darkModeU?"#14532D":"#F0FDF4"} title="WhatsApp" sub="+62 878-7016-5060" onPress={()=>window.open("https://wa.me/6287870165060","_blank")} theme={DK}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} iconBg={darkModeU?"#1E3A5F":"#EFF6FF"} title="Email" sub="laporku.app@gmail.com" onPress={()=>window.open("mailto:laporku.app@gmail.com","_blank")} theme={DK}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} iconBg={darkModeU?"#2D1B69":"#F5F3FF"} title={bahasaU==="en"?"Official Website":"Situs Resmi"} sub={bahasaU==="en"?"Visit LaporKu landing page":"Kunjungi halaman landing LaporKu"} onPress={()=>window.open(window.location.origin.replace(":5174","").replace(":3001","") + "", "_blank")} last theme={DK}/>
                </SCard>

                {/* Tentang */}
                <SLabel>{T.tentang||(bahasaU==="en"?"About":"Tentang Aplikasi")}</SLabel>
                <SCard>
                  {aboutItems.map(([lbl,val],idx)=>(
                    <SRow key={lbl} icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} iconBg={darkModeU?"#1E293B":"#F8FAFC"} title={lbl} right={<span style={{ fontSize:"12px", fontWeight:500, color:DK.dimtext, maxWidth:"180px", textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{val}</span>} last={idx===aboutItems.length-1}/>
                  ))}
                </SCard>

                {/* Manajemen Akun */}
                <SLabel>{bahasaU==="en"?"Account Management":"Manajemen Akun"}</SLabel>
                <SCard>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>} iconBg={darkModeU?"#450A0A":"#FEF2F2"} title={bahasaU==="en"?"Delete Account":"Hapus Akun"} sub={bahasaU==="en"?"Permanently delete account and data":"Hapus akun dan semua data permanen"} onPress={()=>{
                    showAlert({type:"info",title:bahasaU==="en"?"Action Unavailable":"Fitur Tidak Tersedia",message:bahasaU==="en"?"Account deletion is disabled in demo mode. This is a shared demo account.":"Penghapusan akun dinonaktifkan pada mode demo. Ini adalah akun demo bersama yang tidak dapat dihapus.",confirmLabel:"OK"});
                  }} last theme={DK}/>
                </SCard>

                {/* FAQ Modal */}
                {showFaqModal && (
                  <div onClick={()=>{setShowFaqModal(false);setOpenFaqIdx(null);}} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
                    <div onClick={e=>e.stopPropagation()} style={{ background:DK.surface,borderRadius:"20px",width:"100%",maxWidth:"600px",border:DK.border,overflow:"hidden",boxShadow:darkModeU?"0 24px 48px rgba(0,0,0,0.6)":"0 24px 48px rgba(15,23,42,0.18)",maxHeight:"85vh",display:"flex",flexDirection:"column",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      <div style={{ padding:"18px 20px",borderBottom:DK.border,background:darkModeU?"#273449":"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
                        <div><p style={{ fontSize:"16px",fontWeight:800,color:DK.text,margin:0 }}>FAQ</p><p style={{ fontSize:"12px",color:DK.dimtext,margin:"2px 0 0" }}>{bahasaU==="en"?"Frequently asked questions":"Pertanyaan yang sering ditanyakan"}</p></div>
                        <button onClick={()=>{setShowFaqModal(false);setOpenFaqIdx(null);}} style={{ width:"32px",height:"32px",borderRadius:"50%",background:darkModeU?"rgba(239,68,68,0.12)":"#FFF1F2",border:"1.5px solid #FECACA",cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div style={{ overflowY:"auto",flex:1,padding:"8px 20px" }}>
                        {(bahasaU==="en"?FAQ_USER_EN:FAQ_USER_ID).map((item,idx)=>(
                          <div key={idx} onClick={()=>setOpenFaqIdx(openFaqIdx===idx?null:idx)} style={{ borderBottom:idx<(bahasaU==="en"?FAQ_USER_EN:FAQ_USER_ID).length-1?DK.border:"none",padding:"14px 0",cursor:"pointer" }}>
                            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"12px" }}>
                              <p style={{ fontSize:"14px",fontWeight:600,color:DK.text,margin:0,flex:1,lineHeight:1.5 }}>{item.q}</p>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2.5} style={{ flexShrink:0,marginTop:"3px",transform:openFaqIdx===idx?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s" }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                            {openFaqIdx===idx&&<p style={{ fontSize:"13px",color:DK.subtext,margin:"10px 0 0",lineHeight:1.7,whiteSpace:"pre-line" }}>{item.a}</p>}
                          </div>
                        ))}
                        <div style={{ height:"16px" }}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privasi Modal */}
                {showPrivasiModal && (
                  <div onClick={()=>setShowPrivasiModal(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
                    <div onClick={e=>e.stopPropagation()} style={{ background:DK.surface,borderRadius:"20px",width:"100%",maxWidth:"600px",border:DK.border,overflow:"hidden",boxShadow:darkModeU?"0 24px 48px rgba(0,0,0,0.6)":"0 24px 48px rgba(15,23,42,0.18)",maxHeight:"85vh",display:"flex",flexDirection:"column",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      <div style={{ padding:"18px 20px",borderBottom:DK.border,background:darkModeU?"#273449":"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
                        <div><p style={{ fontSize:"16px",fontWeight:800,color:DK.text,margin:0 }}>{bahasaU==="en"?"Privacy Policy":"Kebijakan Privasi"}</p><p style={{ fontSize:"12px",color:DK.dimtext,margin:"2px 0 0" }}>{bahasaU==="en"?"Last updated: May 2026":"Terakhir diperbarui: Mei 2026"}</p></div>
                        <button onClick={()=>setShowPrivasiModal(false)} style={{ width:"32px",height:"32px",borderRadius:"50%",background:darkModeU?"rgba(239,68,68,0.12)":"#FFF1F2",border:"1.5px solid #FECACA",cursor:"pointer",color:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div style={{ overflowY:"auto",flex:1,padding:"8px 20px" }}>
                        {(bahasaU==="en"?PRIVASI_USER_EN:PRIVASI_USER_ID).map((item,idx)=>(
                          <div key={idx} style={{ marginTop:"16px" }}>
                            <p style={{ fontSize:"14px",fontWeight:700,color:DK.text,margin:"0 0 6px" }}>{item.title}</p>
                            <p style={{ fontSize:"13px",color:DK.subtext,margin:0,lineHeight:1.7,whiteSpace:"pre-line" }}>{item.content}</p>
                          </div>
                        ))}
                        <div style={{ height:"24px" }}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logout */}
                <button onClick={()=>setConfirmLogout(true)} style={{ width:"100%", padding:"14px", background:"#EF4444", border:"1.5px solid #DC2626", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#DC2626"; e.currentTarget.style.borderColor="#B91C1C"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#EF4444"; e.currentTarget.style.borderColor="#DC2626"; }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span style={{ fontSize:"15px", fontWeight:600, color:"#fff" }}>{bahasaU==="en"?"Log Out":"Keluar"}</span>
                </button>

                <p style={{ textAlign:"center", fontSize:"12px", color:DK.dimtext, margin:"16px 0 0" }}>LaporKu · v1.0.0 · © 2026</p>
              </div>
            );
          })()}

          {!["dashboard", "profil", "laporan", "buat", "notifikasi", "analitik", "pengaturan"].includes(
            activeNav,
          ) && (
            <div style={{ ...CARD, overflow: "hidden", flex: 1 }}>
              <EmptyState
                icon={
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                }
                title={`Halaman ${pageTitle}`}
                desc="Fitur ini sedang dalam pengembangan"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}