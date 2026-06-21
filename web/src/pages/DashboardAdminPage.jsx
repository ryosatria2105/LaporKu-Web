import React, { useState, useEffect, useRef } from "react";
import { PeriodeStrategyFactory } from "../patterns/PeriodeStrategy";
import LaporanAdminPage from "./LaporanAdminPage";
import {
  laporanService,
  kategoriService,
  penggunaService,
  notifikasiService,
  profilService,
  analyticsService,
  authService,
} from "../services/api.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoDark from "../assets/logo-darkmode.png";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// CONSTANTS - tidak diubah
// ─────────────────────────────────────────────────────────────
const B = "1px solid #030c1769";

// ─────────────────────────────────────────────────────────────
// FAQ & PRIVASI DATA
// ─────────────────────────────────────────────────────────────
const FAQ_ADMIN_ID = [
  { q: "Bagaimana alur kerja pemrosesan laporan dari masuk hingga selesai?", a: "Laporan yang dikirim pengguna masuk dengan status Menunggu. Admin meninjau kelengkapan dan relevansi laporan, lalu mengubah status menjadi Diproses saat penanganan dimulai. Setelah tindak lanjut selesai, status diubah menjadi Selesai. Jika laporan tidak memenuhi syarat, admin menolak dengan menyertakan alasan yang akan dikirim sebagai notifikasi ke pelapor. Setiap perubahan status tercatat otomatis beserta timestamp." },
  { q: "Apa kriteria laporan yang dapat ditolak?", a: "Admin berwenang menolak laporan yang tidak memenuhi standar kelayakan. Kondisi yang menjadi dasar penolakan antara lain: informasi tidak lengkap atau tidak dapat diverifikasi, laporan merupakan duplikasi, permasalahan di luar kategori layanan, lokasi di luar wilayah cakupan, foto bukti tidak relevan, atau konten bersifat tidak pantas. Alasan penolakan wajib diisi dengan jelas dan spesifik." },
  { q: "Bagaimana cara mengelola kategori laporan?", a: "Kategori dikelola melalui menu Kelola Kategori di sidebar. Admin dapat menambah kategori baru, memperbarui kategori yang ada, serta menghapus kategori yang tidak lagi digunakan. Kategori yang masih memiliki laporan aktif tidak dapat dihapus." },
  { q: "Bagaimana cara menonaktifkan atau mengaktifkan kembali akun pengguna?", a: "Buka halaman Pengguna melalui sidebar. Temukan pengguna yang dituju menggunakan fitur pencarian atau filter. Klik tombol Nonaktifkan — pengguna tidak dapat login, namun seluruh data tetap tersimpan. Admin tidak dapat menonaktifkan sesama akun admin." },
  { q: "Apa fungsi halaman Analitik dan bagaimana membacanya?", a: "Analitik menyajikan statistik laporan secara menyeluruh. Distribusi status ditampilkan dalam donut chart. Top Kategori menampilkan 5 kategori dengan laporan terbanyak beserta persentasenya. Semua data diambil secara real-time dari server." },
  { q: "Bagaimana sistem notifikasi admin bekerja?", a: "Sistem melakukan polling ke server setiap 30 detik (jika Refresh Otomatis aktif) untuk memeriksa notifikasi baru. Jika izin notifikasi browser diberikan, push notification juga muncul meski tab tidak aktif. Alert otomatis dikirim jika laporan menunggu melebihi 10." },
  { q: "Apa yang terjadi jika fitur Auto Logout diaktifkan?", a: "Sistem memantau aktivitas pengguna secara pasif. Jika tidak ada aktivitas selama 30 menit berturut-turut, sesi otomatis diakhiri dan admin diarahkan ke halaman login. Fitur ini mencegah akses tidak sah pada perangkat yang ditinggalkan." },
];
const FAQ_ADMIN_EN = [
  { q: "How does the report processing workflow work from submission to completion?", a: "Reports submitted by users enter with a Waiting status. The admin reviews the completeness and relevance of the report, then changes the status to In Progress when handling begins. Once follow-up is complete, the status changes to Resolved. If the report doesn't meet requirements, the admin rejects it with a reason sent as a notification to the reporter. Every status change is automatically recorded with a timestamp." },
  { q: "What are the criteria for rejecting a report?", a: "Admins may reject reports that don't meet eligibility standards. Grounds for rejection include: incomplete or unverifiable information, duplicate report, issue outside the service category, location outside coverage area, irrelevant evidence photo, or inappropriate content. The rejection reason must be filled in clearly and specifically." },
  { q: "How do I manage report categories?", a: "Categories are managed through the Manage Categories menu in the sidebar. Admins can add new categories, update existing ones, and delete unused ones. Categories that still have active reports cannot be deleted to maintain data integrity." },
  { q: "How do I deactivate or reactivate a user account?", a: "Open the Users page via the sidebar. Find the target user using the search or filter feature. Click Deactivate — the user cannot log in, but all data remains stored. Admins cannot deactivate fellow admin accounts." },
  { q: "What does the Analytics page do and how do I read it?", a: "Analytics presents comprehensive report statistics. Status distribution is shown in a donut chart for visual comparison. Top Categories shows the 5 categories with the most reports and their percentages. All data is fetched in real-time from the server." },
  { q: "How does the admin notification system work?", a: "The system polls the server every 30 seconds (if Auto Refresh is active) to check for new notifications. If browser notification permission is granted, push notifications also appear even when the tab is not active. An alert is automatically sent if waiting reports exceed 10." },
  { q: "What happens when the Auto Logout feature is enabled?", a: "The system passively monitors user activity. If there is no activity for 30 consecutive minutes, the session is automatically ended and the admin is redirected to the login page. This feature prevents unauthorized access on abandoned devices." },
];
const getFAQ = (lang) => lang === "en" ? FAQ_ADMIN_EN : FAQ_ADMIN_ID;

const PRIVASI_ADMIN_EN = [
  { title: "1. Scope of This Policy", content: "This privacy policy governs data management in the context of using the LaporKu administrator dashboard. Admins are granted access to user and report data solely for operational purposes of the public facility reporting service. This access is limited, documented, and auditable." },
  { title: "2. Data Accessible to Admins", content: "Admins have access to: user identity data (full name, username, email, phone number), report data (title, category, description, location, evidence photos, status history), aggregate statistics (reports per category, status, and period), account data (active/inactive status and registration date). Admins do not have access to user passwords, authentication tokens, or data outside the platform." },
  { title: "3. Admin Authority Limitations", content: "To maintain integrity and user trust, admins are prohibited from: changing or resetting user account passwords, deleting reports that have been processed or completed, accessing, duplicating, or distributing user data outside operational needs, modifying report content submitted by users, granting admin access to unauthorized parties." },
  { title: "4. System Security Infrastructure", content: "LaporKu implements layered security standards: JWT authentication with 15-minute validity, refresh tokens with rotation and blacklist mechanisms, passwords encrypted using bcrypt with 12 salt rounds, all data transmission uses HTTPS protocol, rate limiting to prevent brute force attacks, admin sessions can be configured to automatically expire when idle." },
  { title: "5. Purpose and Basis for Data Processing", content: "Data is processed based on legitimate public interest, namely the management of facility reports for community benefit. Data is used to: verify and process incoming reports, send status update notifications to reporters, generate service performance statistics and reports, improve service quality and efficiency." },
  { title: "6. Data Sharing with Third Parties", content: "LaporKu does not sell, rent, or trade user data to any commercial parties. Report data may only be shared with: relevant government agencies or departments as mandated recipients for report handling, law enforcement authorities when required by applicable legal provisions, system auditors for agreed security reviews." },
  { title: "7. Data Retention and Deletion", content: "Data is stored while the user account is active. If an account is deleted at the user's request, personal identity data is permanently deleted within 30 business days. Report data may be retained in anonymized form for statistical and service evaluation purposes. System activity logs are stored for a maximum of 90 days." },
  { title: "8. User Rights Over Their Data", content: "Every registered user has protected rights: Access — view all stored personal data, Correction — update inaccurate data via the profile page, Deletion — submit an account and data deletion request, Portability — request a data copy in machine-readable format, Objection — raise objections to certain data processing. User rights requests can be submitted via email laporku.app@gmail.com." },
  { title: "9. Contact and Incident Reporting", content: "If you discover or suspect a privacy violation, unauthorized access, or data breach, report immediately: Email: laporku.app@gmail.com · WhatsApp: +62 878-7016-5060. We are committed to responding to security incident reports within 24 hours and resolving them within 7 business days." },
];
const PRIVASI_ADMIN_ID = [
  { title: "1. Ruang Lingkup Kebijakan Ini",
    content: "Kebijakan privasi ini mengatur pengelolaan data dalam konteks penggunaan dashboard administrator LaporKu. Admin diberikan akses ke data pengguna dan laporan semata-mata untuk keperluan operasional layanan pelaporan fasilitas publik. Akses ini bersifat terbatas, terdokumentasi, dan dapat diaudit.",
  },
  {
    title: "2. Data yang Dapat Diakses Admin",
    content: "Admin memiliki akses ke:\n\n• Data identitas pengguna: nama lengkap, username, alamat email, dan nomor telepon\n• Data laporan: judul, kategori, deskripsi masalah, lokasi, foto bukti, dan riwayat status\n• Data statistik agregat: jumlah laporan per kategori, status, dan periode\n• Data akun: status aktif/nonaktif dan tanggal pendaftaran\n\nAdmin tidak memiliki akses ke password pengguna, token autentikasi, atau data di luar platform.",
  },
  {
    title: "3. Batasan Kewenangan Admin",
    content: "Untuk menjaga integritas dan kepercayaan pengguna, admin dilarang:\n\n• Mengubah atau mereset password akun pengguna\n• Menghapus laporan yang sudah diproses atau diselesaikan\n• Mengakses, menduplikasi, atau mendistribusikan data pengguna di luar keperluan operasional\n• Memodifikasi konten laporan yang sudah dikirim pengguna\n• Memberikan akses admin kepada pihak yang tidak berwenang",
  },
  {
    title: "4. Infrastruktur Keamanan Sistem",
    content: "LaporKu menerapkan standar keamanan berlapis:\n\n• Autentikasi JSON Web Token (JWT) dengan masa berlaku 15 menit\n• Refresh token dengan mekanisme rotasi dan blacklist\n• Password dienkripsi menggunakan bcrypt dengan salt rounds 12\n• Seluruh transmisi data menggunakan protokol HTTPS\n• Rate limiting untuk mencegah serangan brute force\n• Sesi admin dapat dikonfigurasi untuk berakhir otomatis saat idle",
  },
  {
    title: "5. Tujuan dan Dasar Pemrosesan Data",
    content: "Data diproses berdasarkan kepentingan publik yang sah, yaitu pengelolaan laporan fasilitas untuk kepentingan masyarakat. Data digunakan untuk:\n\n• Memverifikasi dan memproses laporan yang masuk\n• Mengirimkan notifikasi pembaruan status kepada pelapor\n• Menghasilkan statistik dan laporan kinerja layanan\n• Meneruskan laporan ke instansi berwenang yang relevan\n• Meningkatkan kualitas dan efisiensi layanan secara berkelanjutan",
  },
  {
    title: "6. Berbagi Data dengan Pihak Ketiga",
    content: "LaporKu tidak menjual, menyewakan, atau memperdagangkan data pengguna kepada pihak komersial manapun. Data laporan hanya dapat dibagikan kepada:\n\n• Instansi pemerintah atau dinas terkait sebagai penerima mandat penanganan laporan\n• Aparat penegak hukum apabila diwajibkan berdasarkan ketentuan hukum yang berlaku\n• Auditor sistem dalam rangka pemeriksaan keamanan yang telah disepakati\n\nSetiap pembagian data didokumentasikan dan dapat dipertanggungjawabkan.",
  },
  {
    title: "7. Retensi dan Penghapusan Data",
    content: "Data disimpan selama akun pengguna berstatus aktif. Apabila akun dihapus atas permintaan pengguna, data identitas pribadi dihapus permanen dalam 30 hari kerja. Data laporan dapat dipertahankan dalam bentuk anonim untuk keperluan statistik dan evaluasi layanan. Log aktivitas sistem disimpan maksimal 90 hari.",
  },
  {
    title: "8. Hak Pengguna atas Datanya",
    content: "Setiap pengguna terdaftar memiliki hak yang dilindungi:\n\n• Akses — melihat seluruh data pribadi yang tersimpan\n• Koreksi — memperbarui data yang tidak akurat melalui halaman profil\n• Penghapusan — mengajukan permintaan penghapusan akun dan data\n• Portabilitas — meminta salinan data dalam format yang dapat dibaca mesin\n• Keberatan — mengajukan keberatan atas pemrosesan data tertentu\n\nPermintaan hak pengguna dapat diajukan melalui email laporku.app@gmail.com.",
  },
  {
    title: "9. Kontak dan Pelaporan Insiden",
    content: "Jika mengetahui atau mencurigai adanya pelanggaran privasi, akses tidak sah, atau kebocoran data, segera laporkan:\n\n• Email: laporku.app@gmail.com\n• WhatsApp: +62 878-7016-5060\n\nKami berkomitmen merespons laporan insiden keamanan dalam 24 jam dan menyelesaikannya dalam 7 hari kerja. Kebijakan ini ditinjau secara berkala dan pembaruan diinformasikan melalui notifikasi sistem.",
  },
];
const getPrivasi = (lang) => lang === "en" ? PRIVASI_ADMIN_EN : PRIVASI_ADMIN_ID;
const BL = "1px solid #E8EAED";
const BMID = B;
const CARD = {
  background: "#fff",
  borderRadius: "16px",
  border: B,
  boxShadow: "0 1px 4px rgba(8, 18, 42, 0.44)",
};

// ─────────────────────────────────────────────────────────────
// ALERT POPUP
// ─────────────────────────────────────────────────────────────
function AlertPopup({ alert, onClose, onConfirm, darkMode, cancelLabel }) {
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
          background: darkMode ? "#1E293B" : "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 4px 24px rgba(15,23,42,0.18)",
          border: B,
          overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
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
              color: darkMode ? "#F1F5F9" : "#0F172A",
              margin: "0 0 8px",
            }}
          >
            {alert.title}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: darkMode ? "#94A3B8" : "#64748B",
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
                  border: "2px solid #94A3B8",
                  background: darkMode ? "#1E293B" : "#F1F5F9",
                  color: darkMode ? "#CBD5E1" : "#374151",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderRadius: "11px",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? "#334155" : "#E2E8F0";
                  e.currentTarget.style.borderColor = "#64748B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? "#1E293B" : "#F1F5F9";
                  e.currentTarget.style.borderColor = "#94A3B8";
                }}
              >
                {cancelLabel || "Batal"}
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
                  borderRadius: "11px",
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
                borderRadius: "11px",
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
// CONFIRM DIALOG — untuk logout
// ─────────────────────────────────────────────────────────────
function ConfirmDialog({ dialog, onConfirm, onCancel, bahasa: cdBahasa, darkMode }) {
  if (!dialog) return null;
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
          background: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "340px",
          boxShadow: "0 4px 16px rgba(15,23,42,0.12)",
          border: B,
          overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
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
              color: "#0F172A",
              marginBottom: "8px",
            }}
          >
            {dialog.title}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: darkMode ? "#94A3B8" : "#64748B",
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
              border: "2px solid #94A3B8",
              background: "#F1F5F9",
              color: "#374151",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              borderRadius: "11px",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E2E8F0";
              e.currentTarget.style.borderColor = "#64748B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.borderColor = "#94A3B8";
            }}
          >
            {cdBahasa === "en" ? "Cancel" : "Batal"}
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
              borderRadius: "11px",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#DC2626")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#EF4444")}
          >
            {cdBahasa === "en" ? "Yes, Logout" : "Ya, Logout"}
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
        background: "#fff",
        border: B,
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(15,23,42,0.10)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "280px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "11px",
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
            color: "#0F172A",
            margin: "0 0 1px",
          }}
        >
          {toast.title}
        </p>
        <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#EF4444",
          padding: "2px",
          display: "flex",
          borderRadius: "5px",
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

// ─────────────────────────────────────────────────────────────
// PROFILE DROPDOWN
// ─────────────────────────────────────────────────────────────
function ProfileDropdown({
  user,
  initials,
  onEditProfil,
  onLogout,
  onPengaturan,
  darkMode,
  DK,
  bahasa: pdBahasa,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // fallback kalau DK tidak dikirim (backward compat)
  const dk = DK || {
    surface: "#fff",
    border: "1px solid #030c1769",
    text: "#0F172A",
    subtext: "#374151",
    dimtext: "#64748B",
    surfaceHover: "#F8FAFC",
  };
  const isPdEn = pdBahasa === "en";
  const pdtxt = {
    administrator: "Administrator",
    editProfil: isPdEn ? "Edit Profile" : "Edit Profil",
    editProfilSub: isPdEn ? "Change your account data" : "Ubah data akun Anda",
    pengaturan: isPdEn ? "Settings" : "Pengaturan",
    pengaturanSub: isPdEn ? "Manage account & appearance" : "Kelola akun & tampilan",
    logout: "Logout",
    logoutSub: isPdEn ? "Sign out from this session" : "Keluar dari sesi ini",
  };
  const dm = !!darkMode;
  const borderColor = dm ? "1px solid #334155" : B;

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const btnBg = dm
    ? open
      ? "#273449"
      : "#1E293B"
    : open
      ? "#F1F5F9"
      : "#F8FAFC";
  const btnHover = dm ? "#273449" : "#F1F5F9";

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
          boxShadow: open
            ? "0 1px 3px rgba(15,23,42,0.08)"
            : "0 1px 4px rgba(15,23,42,0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = btnHover;
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.08)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = dm ? "#1E293B" : "#F8FAFC";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.08)";
          }
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
            outline: "none",
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
            {user?.nama || "Admin"}
          </p>
          <p style={{ fontSize: "10px", color: dk.dimtext, margin: 0 }}>
            {pdtxt.administrator}
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
            borderRadius: "16px",
            boxShadow: dm
              ? "0 4px 20px rgba(0,0,0,0.5)"
              : "0 4px 16px rgba(15,23,42,0.12)",
            minWidth: "210px",
            overflow: "hidden",
            zIndex: 9999,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
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
                  border: borderColor,
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
                borderRadius: "11px",
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
                  borderRadius: "10px",
                  background: dm ? "#1E3A5F" : "#EFF6FF",
                  border: "1.5px solid " + (dm ? "#2563EB" : "#BFDBFE"),
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
                  {pdtxt.editProfil}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: dk.dimtext }}>
                  {pdtxt.editProfilSub}
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setOpen(false);
                if (onPengaturan) onPengaturan();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: "transparent",
                borderRadius: "11px",
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
                  borderRadius: "10px",
                  background: dm ? "#1C3644" : "#F0FDF4",
                  border: "1.5px solid " + (dm ? "#059669" : "#A7F3D0"),
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
                  stroke="#059669"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
                  {pdtxt.pengaturan}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: dk.dimtext }}>
                  {pdtxt.pengaturanSub}
                </p>
              </div>
            </button>
            <div
              style={{
                height: "1.5px",
                background: dm ? "#334155" : "#E2E8F0",
                margin: "4px 0",
              }}
            />
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
                border: "1.5px solid #DC2626",
                background: "#EF4444",
                borderRadius: "11px",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "all .12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#DC2626";
                e.currentTarget.style.borderColor = "#B91C1C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#EF4444";
                e.currentTarget.style.borderColor = "#DC2626";
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
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
                  stroke="#fff"
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
                    color: "#fff",
                  }}
                >
                  {pdtxt.logout}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
                  {pdtxt.logoutSub}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProfilFInput & ProfilEye — di luar komponen agar tidak re-mount tiap render
function ProfilFInput({ label, value, onChange, type="text", placeholder, disabled, right, hint, darkMode, DK }) {
  return (
    <div>
      <label style={{ fontSize:"12px", fontWeight:700, display:"block", marginBottom:"6px",
        color: disabled ? (darkMode?"#94A3B8":"#9CA3AF") : (darkMode?"#F1F5F9":(DK?DK.text:"#111827")) }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled}
          style={{
            width:"100%", padding: right?"10px 42px 10px 13px":"10px 13px",
            border:`2px solid ${disabled?(darkMode?"#334155":"#E2E8F0"):darkMode?"#475569":"#CBD5E1"}`,
            borderRadius:"11px", fontSize:"13px", fontFamily:"inherit",
            outline:"none", boxSizing:"border-box", transition:"border-color .15s, box-shadow .15s",
            background: disabled?(darkMode?"#1E293B":"#F8FAFC"):(DK?DK.inputBg:"#fff"),
            color: disabled?(DK?DK.dimtext:"#94A3B8"):(DK?DK.text:"#0F172A"),
          }}
          onFocus={e=>{ if(!disabled){ e.target.style.borderColor="#2563EB"; e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)"; }}}
          onBlur={e=>{ e.target.style.borderColor=disabled?(darkMode?"#334155":"#E2E8F0"):darkMode?"#475569":"#CBD5E1"; e.target.style.boxShadow="none"; }}
        />
        {right && <div style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)" }}>{right}</div>}
      </div>
      {hint && <p style={{ fontSize:"11px", margin:"5px 0 0", fontWeight:500, color:hint.startsWith("⚠")?"#EF4444":hint.startsWith("✓")?"#059669":(DK?DK.dimtext:"#374151") }}>{hint}</p>}
    </div>
  );
}
function ProfilEye({ show, onToggle }) {
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
// PROFIL CONTENT — refreshUser setelah update agar data tidak hilang
// ─────────────────────────────────────────────────────────────
function ProfilContent({
  user,
  setUser,
  refreshUser,
  onBack,
  showAlert,
  darkMode,
  DK,
  bahasa,
  t,
}) {
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
  const isEn = bahasa === "en";
  const dm = !!darkMode;
  const pBorderC = dm ? "1px solid #334155" : "1px solid #030c1769";
  const surfaceC = dm ? "#1E293B" : "#fff";
  const subtextC = dm ? "#94A3B8" : "#374151";
  const surfHovC = dm ? "#273449" : "#F8FAFC";
  const FF = "'Plus Jakarta Sans', sans-serif";

  useEffect(() => {
    profilService.getData().then((res) => {
      const d = res.data.data;
      setForm({ nama: d.nama || "", phone: d.phone || "" });
    });
  }, []);

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
    const file = e.target.files[0];
    if (!file) return;
    const resetRef = () => { if (fileRef.current) fileRef.current.value = ""; };
    showAlert({
      type: "confirm",
      title: isEn ? "Update Profile Photo?" : "Perbarui Foto Profil?",
      message: isEn ? "Your current profile photo will be replaced." : "Foto profil Anda saat ini akan diganti.",
      confirmLabel: isEn ? "Yes, Update" : "Ya, Perbarui",
      onConfirm: async () => {
        const fd = new FormData();
        fd.append("foto", file);
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
          resetRef();
        }
      },
      onCancel: resetRef,
    });
  };

  const initials =
    user?.nama
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

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
  const SC = ["#E2E8F0", "#EF4444", "#F59E0B", "#3B82F6", "#059669"];
  const SL = bahasa === "en"
    ? ["", "Too short", "Weak", "Fairly strong", "Very strong"]
    : ["", "Terlalu pendek", "Lemah", "Cukup kuat", "Sangat kuat"];

  const TABS = [
    {
      id: "profil",
      label: t.dataProfil,
      icon: (
        <svg
          width="14"
          height="14"
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
      ),
    },
    {
      id: "password",
      label: bahasa === "en" ? "Security" : "Keamanan",
      icon: (
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
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
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <div
            style={{
              background: DK ? DK.surface : "#fff",
              borderRadius: "16px",
              border: DK ? DK.border : B,
              boxShadow: darkMode
                ? "0 1px 4px rgba(0,0,0,0.6)"
                : "0 1px 4px rgba(8, 18, 42, 0.51)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  height: "64px",
                  background:
                    "linear-gradient(135deg, #070D1A 0%, #0F172A 50%, #1E293B 100%)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.15,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
                    backgroundSize: "8px 8px",
                  }}
                />
              </div>
              <div
                style={{
                  padding: "0 18px 18px",
                  marginTop: "-28px",
                  borderBottom: DK ? DK.border : B,
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
                      border: "3px solid #fff",
                      outline: B,
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
                    title="Ganti foto"
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "#2563EB",
                      border: "2px solid #fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  {/* iOS-style: X merah hapus foto di kiri bawah avatar */}
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
                        border: "2px solid #fff",
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
                    color: DK ? DK.text : "#0F172A",
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
                    color: DK ? DK.subtext : "#374151",
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
                  color: DK ? DK.subtext : "#374151",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "8px 8px 6px",
                  margin: 0,
                }}
              >
                {bahasa === "en" ? "Settings" : "Pengaturan"}
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
                        ? "1.5px solid #3B82F6"
                        : "1.5px solid transparent",
                      background: active ? "#2563EB" : "transparent",
                      borderRadius: "11px",
                      boxShadow: active
                        ? "0 2px 8px rgba(37,99,235,0.4)"
                        : "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : DK ? DK.subtext : "#475569",
                      fontFamily: "inherit",
                      textAlign: "left",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = darkMode
                          ? "#273449"
                          : "#F8FAFC";
                        e.currentTarget.style.border =
                          "1.5px solid " + (darkMode ? "#334155" : "#E2E8F0");
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.border = "1px solid transparent";
                      }
                    }}
                  >
                    <span style={{ color: active ? "#fff" : "#94A3B8" }}>
                      {tab.icon}
                    </span>
                    {tab.label}
                    {active && (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#fff"
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
        </div>

        <div
          style={{
            background: DK ? DK.surface : "#fff",
            borderRadius: "16px",
            border: DK ? DK.border : B,
            boxShadow: darkMode
              ? "0 1px 4px rgba(0,0,0,0.6)"
              : "0 1px 4px rgba(8, 18, 42, 0.51)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: DK ? DK.border : B,
              background: darkMode ? "#273449" : "#F8FAFC",
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
                  color: DK ? DK.text : "#0F172A",
                  margin: "0 0 2px",
                }}
              >
                {activeTab === "profil" ? t.dataProfil : t.keamananAkun}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: DK ? DK.subtext : "#374151",
                  margin: 0,
                }}
              >
                {activeTab === "profil"
                  ? t.perbarui
                  : t.kelolaSandi}
              </p>
            </div>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                border: DK ? DK.border : B,
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
                    <ProfilFInput
                      label={t.nama}
                      value={form.nama}
                      onChange={(e) =>
                        setForm({ ...form, nama: e.target.value })
                      }
                      placeholder="Nama lengkap Anda"
                      darkMode={darkMode}
                      DK={DK}
                    />
                    <ProfilFInput
                      label={t.telepon}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="08xxxxxxxxxx"
                      hint={t.nomorHint}
                      darkMode={darkMode}
                      DK={DK}
                    />
                  </div>
                  <div
                    style={{
                      height: "1px",
                      background: darkMode ? "#334155" : "#05172f92",
                      borderRadius: "1px",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: DK ? DK.dimtext : "#374151",
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {t.infoAkun}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <ProfilFInput
                      label="Email"
                      value={user?.email || ""}
                      disabled
                      hint={t.tidakUbah}
                      darkMode={darkMode}
                      DK={DK}
                    />
                    <ProfilFInput
                      label="Username"
                      value={user?.username || ""}
                      disabled
                      hint={t.tidakUbah}
                      darkMode={darkMode}
                      DK={DK}
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
                          color: DK ? DK.dimtext : "#6B7280",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        Role
                      </label>
                      <div
                        style={{
                          padding: "10px 13px",
                          border: DK ? DK.border : B,
                          borderRadius: "11px",
                          background: darkMode ? "#1E293B" : "#F8FAFC",
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
                          color: DK ? DK.dimtext : "#6B7280",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {t.statusAkun}
                      </label>
                      <div
                        style={{
                          padding: "10px 13px",
                          border: DK ? DK.border : B,
                          borderRadius: "11px",
                          background: darkMode ? "#1E293B" : "#F8FAFC",
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
                          Aktif
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
                        padding: "12px 24px",
                        background: loading ? "#93C5FD" : "#2563EB",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
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
                          Menyimpan...
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
                          {t.simpanProfil}
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
                  {/* iOS-style inline warning banner */}
                  <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #FDE68A" }}>
                    <div style={{ background: "linear-gradient(135deg, #D97706, #B45309)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>{t.perhatian}</p>
                    </div>
                    <div style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", padding: "12px 16px" }}>
                      <p style={{ fontSize: "13px", color: "#78350F", margin: 0, lineHeight: 1.6 }}>
                        {t.peringatanSandi}
                      </p>
                    </div>
                  </div>
                  <ProfilFInput
                    label={t.sandiSaatIni}
                    type={showPass.lama ? "text" : "password"}
                    value={passForm.password_lama}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        password_lama: e.target.value,
                      })
                    }
                    placeholder={t.sandiSaatIni}
                    darkMode={darkMode}
                    DK={DK}
                    right={
                      <ProfilEye
                        show={showPass.lama}
                        onToggle={() =>
                          setShowPass((p) => ({ ...p, lama: !p.lama }))
                        }
                      darkMode={darkMode}
                      DK={DK}
                    />
                    }
                  />
                  <div style={{ height: "1.5px", background: darkMode ? "#334155" : "#E2E8F0" }} />
                  <ProfilFInput
                    label={t.sandiBaru}
                    type={showPass.baru ? "text" : "password"}
                    value={passForm.password_baru}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        password_baru: e.target.value,
                      })
                    }
                    placeholder={t.sandiBaru8}
                    darkMode={darkMode}
                    DK={DK}
                    right={
                      <ProfilEye
                        show={showPass.baru}
                        onToggle={() =>
                          setShowPass((p) => ({ ...p, baru: !p.baru }))
                        }
                      darkMode={darkMode}
                      DK={DK}
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
                  <ProfilFInput
                    label={t.konfirmasiSandi}
                    type={showPass.konfirmasi ? "text" : "password"}
                    value={passForm.konfirmasi_password}
                    onChange={(e) =>
                      setPassForm({
                        ...passForm,
                        konfirmasi_password: e.target.value,
                      })
                    }
                    placeholder={t.ulangiSandi}
                    darkMode={darkMode}
                    DK={DK}
                    right={
                      <ProfilEye
                        show={showPass.konfirmasi}
                        onToggle={() =>
                          setShowPass((p) => ({
                            ...p,
                            konfirmasi: !p.konfirmasi,
                          }))
                        }
                      darkMode={darkMode}
                      DK={DK}
                    />
                    }
                    hint={
                      passForm.konfirmasi_password &&
                      passForm.password_baru !== passForm.konfirmasi_password
                        ? (bahasa === "en" ? "⚠ Passwords do not match" : "⚠ Password tidak sama")
                        : passForm.konfirmasi_password &&
                            passForm.password_baru ===
                              passForm.konfirmasi_password
                          ? (bahasa === "en" ? "✓ Passwords match" : "✓ Password cocok")
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
                        padding: "12px 24px",
                        background: loading ? "#6EE7B7" : "#059669",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
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
                          Memperbarui...
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
                          {t.perbaruiSandi}
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

      {/* ── Poin 8: Konfirmasi Simpan Profil (Admin) ── */}
      {showConfirmProfil && (
        <div onClick={() => setShowConfirmProfil(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:surfaceC,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:pBorderC,overflow:"hidden",fontFamily:FF }}>
            <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p style={{ fontSize:"16px",fontWeight:800,color:dm?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FF }}>
                {isEn ? "Save Profile?" : "Simpan Profil?"}
              </p>
              <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FF }}>
                {isEn ? "Are you sure you want to update your profile data?" : "Yakin ingin menyimpan perubahan data profil?"}
              </p>
            </div>
            <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
              <button onClick={() => setShowConfirmProfil(false)} style={{ flex:1,padding:"11px",border:pBorderC,background:"transparent",color:subtextC,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF,borderRadius:"9px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = surfHovC}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button onClick={doUpdateProfil} style={{ flex:1,padding:"11px",border:"2px solid #2563EB",background:"#2563EB",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
                onMouseLeave={e => e.currentTarget.style.background = "#2563EB"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {isEn ? "Yes, Save" : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Poin 8: Konfirmasi Update Password (Admin) ── */}
      {showConfirmPass && (
        <div onClick={() => setShowConfirmPass(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:surfaceC,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:pBorderC,overflow:"hidden",fontFamily:FF }}>
            <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p style={{ fontSize:"16px",fontWeight:800,color:dm?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FF }}>
                {isEn ? "Update Password?" : "Perbarui Password?"}
              </p>
              <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FF }}>
                {isEn ? "After updating, all active sessions will end and you need to log in again." : "Setelah diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang."}
              </p>
            </div>
            <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
              <button onClick={() => setShowConfirmPass(false)} style={{ flex:1,padding:"11px",border:pBorderC,background:"transparent",color:subtextC,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF,borderRadius:"9px",transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = surfHovC}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button onClick={doUpdatePassword} style={{ flex:1,padding:"11px",border:"2px solid #D97706",background:"#D97706",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FF,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
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
// KATEGORI CONTENT — tabel rapi + form fix (input pakai state terkontrol)
// ─────────────────────────────────────────────────────────────
function KategoriContent({ onBack, showAlert, darkMode, DK, bahasa: katBahasa }) {
  const isEn = katBahasa === "en";
  const ktxt = {
    tambahJudul: isEn ? "Add New Category" : "Tambah Kategori Baru",
    tambahSub: isEn ? "Create category for reports" : "Buat kategori untuk laporan",
    editJudul: isEn ? "Edit Category" : "Edit Kategori",
    editSub: isEn ? "Update category information" : "Perbarui informasi kategori",
    namaLabel: isEn ? "Category Name" : "Nama Kategori",
    namaPlaceholder: isEn ? "E.g.: Road Damage, Waste..." : "Contoh: Jalan Rusak, Sampah...",
    deskLabel: isEn ? "Description" : "Deskripsi",
    deskOpsional: isEn ? "(optional)" : "(opsional)",
    deskPlaceholder: isEn ? "Brief category description" : "Deskripsi singkat kategori",
    deskHint: isEn ? "Help users understand this category" : "Bantu pengguna memahami kategori ini",
    simpan: isEn ? "Save" : "Simpan",
    tambah: isEn ? "Add" : "Tambah",
    batal: isEn ? "Cancel" : "Batal",
    daftarJudul: isEn ? "Category List" : "Daftar Kategori",
    daftarSub: (n) => isEn ? `${n} categories available` : `${n} kategori tersedia`,
    total: isEn ? "total" : "total",
    noData: isEn ? "No categories yet" : "Belum ada kategori",
    noDataSub: isEn ? "Add the first category for reports" : "Tambahkan kategori pertama untuk laporan",
    noDesc: isEn ? "No description" : "Tidak ada deskripsi",
    edit: isEn ? "Edit" : "Edit",
    hapus: isEn ? "Delete" : "Hapus",
    colNo: "No",
    colNama: isEn ? "Category Name" : "Nama Kategori",
    colDesc: isEn ? "Description" : "Deskripsi",
    colAksi: isEn ? "Action" : "Aksi",
    menyimpan: isEn ? "Saving..." : "Menyimpan...",
    hapusJudul: isEn ? "Delete Category?" : "Hapus Kategori?",
  };
  const [list, setList] = useState([]);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Facade Pattern: sembunyikan detail endpoint di balik service
  const fetchKategori = async () => {
    try {
      const res = await kategoriService.getAll();
      setList(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // Strategy Pattern: pilih strategy simpan (tambah/edit) secara dinamis
  const strategi = {
    tambah: (payload) => kategoriService.create(payload),
    edit: (payload) => kategoriService.update(editId, payload),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim())
      return showAlert({
        type: "error",
        title: "Gagal!",
        message: "Nama kategori wajib diisi.",
      });
    setLoading(true);
    try {
      const payload = { nama: nama.trim(), deskripsi: deskripsi.trim() };
      if (editId) {
        await strategi.edit(payload);
        showAlert({
          type: "success",
          title: "Berhasil!",
          message: `Kategori "${nama}" berhasil diperbarui.`,
        });
      } else {
        await strategi.tambah(payload);
        showAlert({
          type: "success",
          title: "Berhasil!",
          message: `Kategori "${nama}" berhasil ditambahkan.`,
        });
      }
      setNama("");
      setDeskripsi("");
      setEditId(null);
      fetchKategori();
    } catch (err) {
      showAlert({
        type: "error",
        title: "Gagal!",
        message: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNama(item.nama);
    setDeskripsi(item.deskripsi || "");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await kategoriService.remove(deleteConfirm.id); // Facade Pattern
      setDeleteConfirm(null);
      showAlert({
        type: "success",
        title: "Dihapus!",
        message: `Kategori "${deleteConfirm.nama}" berhasil dihapus.`,
      });
      fetchKategori();
    } catch {
      setDeleteConfirm(null);
      showAlert({
        type: "error",
        title: "Gagal!",
        message: "Gagal menghapus kategori.",
      });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setNama("");
    setDeskripsi("");
  };

  const kDK = DK || {
    surface: "#fff",
    border: "1px solid #030c1769",
    text: "#0F172A",
    subtext: "#374151",
    dimtext: "#64748B",
    inputBg: "#fff",
  };
  const kBorder = darkMode ? "1px solid #334155" : "1px solid #030c1769";
  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    border: darkMode ? "2px solid #475569" : "2px solid #CBD5E1",
    borderRadius: "11px",
    fontSize: "13px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s",
    background: kDK.inputBg,
    color: kDK.text,
  };

  return (
    <div>
      {deleteConfirm && (
        <AlertPopup
          alert={{
            type: "delete",
            title: ktxt.hapusJudul,
            message: `${ktxt.hapusPesan} "${deleteConfirm.nama}"?`,
            confirmLabel: ktxt.hapusYa,
          }}
          cancelLabel={ktxt.hapusBatal}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          darkMode={darkMode}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          alignItems: "stretch",
        }}
      >
        {/* ── Form panel ── */}
        <div
          style={{
            background: kDK.surface,
            borderRadius: "16px",
            border: kBorder,
            boxShadow: darkMode
              ? "0 1px 4px rgba(0,0,0,0.6)"
              : "0 1px 4px rgba(8, 18, 42, 0.44)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: kBorder,
              background: darkMode ? "#273449" : "#F8FAFC",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: kDK.text,
                margin: "0 0 2px",
              }}
            >
              {editId ? ktxt.editJudul : ktxt.tambahJudul}
            </p>
            <p style={{ fontSize: "11px", color: kDK.dimtext, margin: 0 }}>
              {editId ? ktxt.editSub : ktxt.tambahSub}
            </p>
          </div>

          <div style={{ padding: "20px" }}>
            <form onSubmit={handleSubmit}>
              <div
                style={{ display: "grid", gap: "14px", marginBottom: "18px" }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: kDK.text,
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {ktxt.namaLabel} <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder={ktxt.namaPlaceholder}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#2563EB";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(37,99,235,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkMode
                        ? "#475569"
                        : "#CBD5E1";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: kDK.text,
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {ktxt.deskLabel}{" "}
                    <span style={{ fontWeight: 400, color: "#94A3B8" }}>
                      {ktxt.deskOpsional}
                    </span>
                  </label>
                  <input
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder={ktxt.deskPlaceholder}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#2563EB";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(37,99,235,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkMode
                        ? "#475569"
                        : "#CBD5E1";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: kDK.dimtext,
                      margin: "5px 0 0",
                    }}
                  >
                    {ktxt.deskHint}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
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
                    background: loading
                      ? "#93C5FD"
                      : editId
                        ? "#D97706"
                        : "#2563EB",
                    color: "#fff",
                    border: "none",
                    borderRadius: "11px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      e.currentTarget.style.background = editId
                        ? "#B45309"
                        : "#1D4ED8";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading)
                      e.currentTarget.style.background = editId
                        ? "#D97706"
                        : "#2563EB";
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
                      {ktxt.menyimpan}
                    </>
                  ) : editId ? (
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
                      {ktxt.simpan}
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
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      {ktxt.tambah}
                    </>
                  )}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: "10px 16px",
                      background: "#F8FAFC",
                      color: "#475569",
                      border: B,
                      borderRadius: "11px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F1F5F9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#F8FAFC")
                    }
                  >
                    {ktxt.batal}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── List panel — TABEL RAPI ── */}
        <div
          style={{
            background: kDK.surface,
            borderRadius: "16px",
            border: kBorder,
            boxShadow: darkMode
              ? "0 1px 4px rgba(0,0,0,0.6)"
              : "0 1px 4px rgba(8, 18, 42, 0.44)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: kBorder,
              background: darkMode ? "#273449" : "#F8FAFC",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: kDK.text,
                  margin: 0,
                }}
              >
                {ktxt.daftarJudul}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: kDK.dimtext,
                  margin: "2px 0 0",
                }}
              >
                {ktxt.daftarSub(list.length)}
              </p>
            </div>
            <span
              style={{
                position: "absolute",
                right: "20px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#7C3AED",
                background: "#F5F3FF",
                padding: "3px 10px",
                borderRadius: "20px",
                border: "1.5px solid #DDD6FE",
              }}
            >
              {list.length} {ktxt.total}
            </span>
          </div>

          {list.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#F8FAFC",
                  border: B,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                  color: "#CBD5E1",
                }}
              >
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#475569",
                  margin: "0 0 4px",
                }}
              >
                {ktxt.noData}
              </p>
              <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>
                {ktxt.noDataSub}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: darkMode ? "#273449" : "#F8FAFC",
                      borderBottom: kBorder,
                    }}
                  >
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: kDK.text,
                        width: "44px",
                      }}
                    >
                      {ktxt.colNo}
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: kDK.text,
                      }}
                    >
                      {ktxt.colNama}
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: kDK.text,
                      }}
                    >
                      {ktxt.colDesc}
                    </th>
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: kDK.text,
                        width: "130px",
                      }}
                    >
                      {ktxt.colAksi}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, i) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: kBorder,
                        transition: "background .12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = darkMode
                          ? "#273449"
                          : "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          color: kDK.subtext,
                          fontWeight: 400,
                          fontSize: "12px",
                          borderRight: kBorder,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td
                        style={{ padding: "13px 16px", borderRight: kBorder }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "10px",
                              background: "#F5F3FF",
                              border: "1.5px solid #DDD6FE",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="#7C3AED"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              color: kDK.text,
                              fontSize: "13px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          color: item.deskripsi ? kDK.subtext : kDK.dimtext,
                          fontStyle: item.deskripsi ? "normal" : "italic",
                          fontSize: "12px",
                          borderRight: kBorder,
                        }}
                      >
                        {item.deskripsi || ktxt.noDesc}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => handleEdit(item)}
                            style={{
                              padding: "5px 12px",
                              minWidth: "64px",
                              textAlign: "center",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              border: "1.5px solid #BFDBFE",
                              borderRadius: "9px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all .12s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#DBEAFE";
                              e.currentTarget.style.boxShadow =
                                "2px 2px 0 #BFDBFE";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#EFF6FF";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            {ktxt.edit}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            style={{
                              padding: "5px 12px",
                              minWidth: "64px",
                              textAlign: "center",
                              background: "#FEF2F2",
                              color: "#EF4444",
                              border: "1.5px solid #FECACA",
                              borderRadius: "9px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all .12s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#FEE2E2";
                              e.currentTarget.style.boxShadow =
                                "2px 2px 0 #FECACA";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#FEF2F2";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            {ktxt.hapus}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PENGGUNA CONTENT
// ─────────────────────────────────────────────────────────────

function PenggunaContent({ onBack, showAlert, darkMode, DK, bahasa: pgBahasa }) {
  const isPgEn = pgBahasa === "en";
  const pgtxt = {
    daftarJudul: isPgEn ? "User List" : "Daftar Pengguna",
    daftarSub: (f, t) => isPgEn ? `${f} of ${t} users` : `${f} dari ${t} pengguna`,
    semuaPengguna: isPgEn ? "All Users" : "Semua Pengguna",
    admin: "Admin",
    masyarakat: isPgEn ? "Public" : "Masyarakat",
    cariPlaceholder: isPgEn ? "Search name / email..." : "Cari nama / email...",
    thNo: "No",
    thPengguna: isPgEn ? "User" : "Pengguna",
    thUsername: "Username",
    thRole: "Role",
    thLaporan: isPgEn ? "Reports" : "Laporan",
    thStatus: "Status",
    thAksi: isPgEn ? "Action" : "Aksi",
    aktif: isPgEn ? "Active" : "Aktif",
    nonaktif: isPgEn ? "Inactive" : "Nonaktif",
    nonaktifkan: isPgEn ? "Deactivate" : "Nonaktifkan",
    aktifkan: isPgEn ? "Activate" : "Aktifkan",
    tidakAda: isPgEn ? "No users found" : "Tidak ada pengguna",
    tidakAdaSub: isPgEn ? "Try changing search keyword" : "Coba ubah kata kunci pencarian",
    memuatData: isPgEn ? "Loading data..." : "Memuat data...",
    masyarakatRole: isPgEn ? "Public" : "Masyarakat",
  };
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchPengguna = async () => {
    setLoading(true);
    try {
      const res = await penggunaService.getAll();
      setList(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengguna();
  }, []);

  const handleToggle = (item) => {
    // Poin 8: konfirmasi sebelum mengubah status pengguna
    const isPgEn = pgtxt?.aktifkan === "Activate";
    const action = item.isActive
      ? (isPgEn ? "deactivate" : "nonaktifkan")
      : (isPgEn ? "activate" : "aktifkan");
    const actionLabel = item.isActive
      ? (isPgEn ? "Deactivate" : "Nonaktifkan")
      : (isPgEn ? "Activate" : "Aktifkan");

    showAlert({
      type: "confirm",
      title: isPgEn ? `${actionLabel} User?` : `${actionLabel} Pengguna?`,
      message: isPgEn
        ? `Are you sure you want to ${action} "${item.nama}"?`
        : `Yakin ingin ${action} pengguna "${item.nama}"?`,
      confirmLabel: actionLabel,
      onConfirm: async () => {
        try {
          await penggunaService.toggleActive(item.id);
          showAlert({
            type: "success",
            title: isPgEn ? "Status Updated!" : "Status Diperbarui!",
            message: isPgEn
              ? `User "${item.nama}" has been ${item.isActive ? "deactivated" : "activated"}.`
              : `Pengguna "${item.nama}" berhasil ${item.isActive ? "dinonaktifkan" : "diaktifkan"}.`,
          });
          fetchPengguna();
        } catch {
          showAlert({
            type: "error",
            title: isPgEn ? "Failed!" : "Gagal!",
            message: isPgEn ? "Failed to update user status." : "Gagal mengubah status pengguna.",
          });
        }
      },
    });
  };

  const filtered = list.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      roleFilter === "semua" ||
      u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {(() => {
        const pDK = DK || {
          surface: "#fff",
          border: "1px solid #030c1769",
          text: "#0F172A",
          subtext: "#374151",
          dimtext: "#64748B",
          inputBg: "#fff",
        };
        const pBorder = darkMode ? "1px solid #334155" : "1px solid #030c1769";
        const pRowHover = darkMode ? "#273449" : "#F8FAFC";
        return (
          <>
            {/* Biodata Modal */}
            {selectedUser && (
              <div
                onClick={() => setSelectedUser(null)}
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
                    background: pDK.surface,
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "400px",
                    border: pBorder,
                    overflow: "hidden",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                    boxShadow: "0 8px 32px rgba(15,23,42,0.25)",
                  }}
                >
                  {/* Cover */}
                  <div
                    style={{
                      height: "72px",
                      background: "linear-gradient(135deg,#2563EB,#059669)",
                      position: "relative",
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
                  {/* Avatar + close */}
                  <div style={{ padding: "0 20px 20px", position: "relative" }}>
                    <button
                      onClick={() => setSelectedUser(null)}
                      style={{
                        position: "absolute",
                        top: "-56px",
                        right: "16px",
                        background: "rgba(255,255,255,0.2)",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        cursor: "pointer",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                    <div
                      style={{
                        marginTop: "-36px",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#2563EB,#059669)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          fontWeight: 800,
                          color: "#fff",
                          overflow: "hidden",
                          border: "4px solid " + pDK.surface,
                          flexShrink: 0,
                        }}
                      >
                        {selectedUser.fotoProfil ? (
                          <img
                            src={selectedUser.fotoProfil}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          selectedUser.nama
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <div style={{ paddingBottom: "6px" }}>
                        <p
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: pDK.text,
                            margin: "0 0 2px",
                          }}
                        >
                          {selectedUser.nama}
                        </p>
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
                          Masyarakat
                        </span>
                      </div>
                    </div>
                    {/* Info rows */}
                    <div style={{ display: "grid", gap: "10px" }}>
                      {[
                        {
                          icon: (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          ),
                          label: "Username",
                          val: `@${selectedUser.username}`,
                        },
                        {
                          icon: (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          ),
                          label: "Email",
                          val: selectedUser.email,
                        },
                        {
                          icon: (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.58 5.08 2 2 0 0 1 3.56 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.18v-1.26z" />
                            </svg>
                          ),
                          label: "No. HP",
                          val: selectedUser.phone || "-",
                        },
                        {
                          icon: (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                            </svg>
                          ),
                          label: "Laporan",
                          val: `${selectedUser._count?.laporan ?? 0} laporan`,
                        },
                        {
                          icon: (
                            <svg
                              width="14"
                              height="14"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9 12l2 2 4-4" />
                            </svg>
                          ),
                          label: "Status",
                          val: selectedUser.isActive ? "Aktif" : "Nonaktif",
                          valColor: selectedUser.isActive
                            ? "#059669"
                            : "#DC2626",
                        },
                      ].map((row, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 14px",
                            background: darkMode ? "#273449" : "#F8FAFC",
                            borderRadius: "12px",
                            border: pBorder,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "10px",
                              background: darkMode ? "#1E293B" : "#fff",
                              border: pBorder,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2563EB",
                              flexShrink: 0,
                            }}
                          >
                            {row.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: pDK.dimtext,
                                margin: "0 0 1px",
                              }}
                            >
                              {row.label}
                            </p>
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: row.valColor || pDK.text,
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.val}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              style={{
                background: pDK.surface,
                borderRadius: "16px",
                border: pBorder,
                boxShadow: darkMode
                  ? "0 1px 4px rgba(0,0,0,0.6)"
                  : "0 1px 4px rgba(8,18,42,0.44)",
                overflow: "hidden",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: pBorder,
                  background: darkMode ? "#273449" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: pDK.text,
                      margin: 0,
                    }}
                  >
                    {pgtxt.daftarJudul}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: pDK.dimtext,
                      margin: "2px 0 0",
                    }}
                  >
                    {pgtxt.daftarSub(filtered.length, list.length)}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Filter Role */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[
                      { val: "semua", label: pgtxt.semuaPengguna },
                      { val: "admin", label: pgtxt.admin },
                      { val: "masyarakat", label: pgtxt.masyarakat },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setRoleFilter(opt.val)}
                        style={{
                          minWidth: "120px",
                          padding: "5px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "1.5px solid",
                          borderColor:
                            roleFilter === opt.val
                              ? "#2563EB"
                              : darkMode
                                ? "#475569"
                                : "#E2E8F0",
                          background:
                            roleFilter === opt.val ? "#2563EB" : "transparent",
                          color: roleFilter === opt.val ? "#fff" : pDK.subtext,
                          fontFamily: "inherit",
                          transition: "all .15s",
                          textAlign: "center",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Search */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      border: pBorder,
                      borderRadius: "11px",
                      background: pDK.inputBg,
                      width: "220px",
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={pgtxt.cariPlaceholder}
                      style={{
                        border: "none",
                        outline: "none",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        flex: 1,
                        color: pDK.text,
                        background: "transparent",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tabel */}
              {loading ? (
                <div
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: pDK.dimtext,
                    fontSize: "13px",
                  }}
                >
                  Memuat data...
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "48px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: pDK.text,
                      margin: "0 0 4px",
                    }}
                  >
                    {pgtxt.tidakAda}
                  </p>
                  <p
                    style={{ fontSize: "12px", color: pDK.dimtext, margin: 0 }}
                  >
                    {pgtxt.tidakAdaSub}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: darkMode ? "#273449" : "#F8FAFC",
                          borderBottom: pBorder,
                        }}
                      >
                        {[
                          { label: pgtxt.thNo, align: "center", w: "44px" },
                          { label: pgtxt.thPengguna, align: "left" },
                          { label: pgtxt.thUsername, align: "left" },
                          { label: pgtxt.thRole, align: "center" },
                          { label: pgtxt.thLaporan, align: "center" },
                          { label: pgtxt.thStatus, align: "center" },
                          { label: pgtxt.thAksi, align: "center", w: "100px" },
                        ].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "11px 14px",
                              textAlign: h.align,
                              fontSize: "13px",
                              fontWeight: 700,
                              color: pDK.text,
                              width: h.w,
                            }}
                          >
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, i) => {
                        const initials =
                          item.nama
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "??";
                        const isAdmin = item.role === "admin";
                        return (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: pBorder,
                              transition: "background .12s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = pRowHover)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <td
                              style={{
                                padding: "12px 14px",
                                textAlign: "center",
                                fontSize: "12px",
                                color: pDK.subtext,
                                borderRight: pBorder,
                              }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                borderRight: pBorder,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <div
                                  onClick={() =>
                                    !isAdmin && setSelectedUser(item)
                                  }
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    background: isAdmin
                                      ? "linear-gradient(135deg,#7C3AED,#2563EB)"
                                      : "linear-gradient(135deg,#2563EB,#059669)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "#fff",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    border: B,
                                    cursor: isAdmin ? "default" : "pointer",
                                    transition: "opacity .15s",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isAdmin)
                                      e.currentTarget.style.opacity = "0.75";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                  }}
                                >
                                  {item.fotoProfil ? (
                                    <img
                                      src={item.fotoProfil}
                                      alt=""
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
                                      color: pDK.text,
                                      margin: "0 0 1px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.nama}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "11px",
                                      color: pDK.dimtext,
                                      margin: 0,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                borderRight: pBorder,
                                fontSize: "12px",
                                color: pDK.subtext,
                              }}
                            >
                              @{item.username}
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                borderRight: pBorder,
                                textAlign: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  textTransform: "capitalize",
                                  background: isAdmin ? "#F5F3FF" : "#EFF6FF",
                                  border: `1.5px solid ${isAdmin ? "#DDD6FE" : "#BFDBFE"}`,
                                  color: isAdmin ? "#6D28D9" : "#1D4ED8",
                                }}
                              >
                                {item.role}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                borderRight: pBorder,
                                textAlign: "center",
                                fontSize: "13px",
                                fontWeight: 700,
                                color: pDK.text,
                              }}
                            >
                              {item._count?.laporan ?? 0}
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                borderRight: pBorder,
                                textAlign: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 9px",
                                  borderRadius: "20px",
                                  background: item.isActive
                                    ? "#ECFDF5"
                                    : "#FEF2F2",
                                  border: `1.5px solid ${item.isActive ? "#A7F3D0" : "#FECACA"}`,
                                  color: item.isActive ? "#065F46" : "#991B1B",
                                }}
                              >
                                {item.isActive ? pgtxt.aktif : pgtxt.nonaktif}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                textAlign: "center",
                              }}
                            >
                              {isAdmin ? (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#94A3B8",
                                    fontStyle: "italic",
                                  }}
                                >
                                  —
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleToggle(item)}
                                  style={{
                                    padding: "5px 12px",
                                    background: item.isActive
                                      ? "#FEF2F2"
                                      : "#ECFDF5",
                                    color: item.isActive
                                      ? "#EF4444"
                                      : "#059669",
                                    border: `1.5px solid ${item.isActive ? "#FECACA" : "#A7F3D0"}`,
                                    borderRadius: "9px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all .12s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.75")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  {item.isActive ? pgtxt.nonaktifkan : pgtxt.aktifkan}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RECENT LAPORAN — mini tabel 5 laporan terbaru di dashboard
// ─────────────────────────────────────────────────────────────
const STATUS_BADGE_BASE = {
  menunggu: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  diproses: { color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
  selesai:  { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  ditolak:  { color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
};
const getStatusBadge = (status, t) => {
  const labels = t ? {
    menunggu: t.menungguLabel || "Menunggu",
    diproses: t.diprosesLabel || "Diproses",
    selesai:  t.selesaiLabel  || "Selesai",
    ditolak:  t.ditolakLabel  || "Ditolak",
  } : { menunggu:"Menunggu", diproses:"Diproses", selesai:"Selesai", ditolak:"Ditolak" };
  const base = STATUS_BADGE_BASE[status] || STATUS_BADGE_BASE.menunggu;
  return { ...base, label: labels[status] || labels.menunggu };
};
// backward compat
const STATUS_BADGE = {
  menunggu: { ...STATUS_BADGE_BASE.menunggu, label: "Menunggu" },
  diproses: { ...STATUS_BADGE_BASE.diproses, label: "Diproses" },
  selesai:  { ...STATUS_BADGE_BASE.selesai,  label: "Selesai"  },
  ditolak:  { ...STATUS_BADGE_BASE.ditolak,  label: "Ditolak"  },
};

function RecentLaporan({ onNavigate, darkMode, DK, fmtDateExternal, t: tProp }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const surfaceBg = darkMode ? "#1E293B" : "#fff";
  const border = darkMode ? "1px solid #334155" : B;
  const textMain = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub = darkMode ? "#94A3B8" : "#64748B";
  const textDim = darkMode ? "#64748B" : "#94A3B8";
  const rowHover = darkMode ? "#273449" : "#F8FAFC";

  useEffect(() => {
    laporanService
      .getAdmin({})
      .then((r) => setData(r.data.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = fmtDateExternal
    ? (d) => fmtDateExternal(d, null)
    : (d) =>
        new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });

  if (loading)
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: textDim,
        }}
      >
        Memuat...
      </div>
    );

  if (!data.length)
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: textMain,
            margin: "0 0 4px",
          }}
        >
          Belum ada laporan
        </p>
        <p style={{ fontSize: "12px", color: textDim, margin: 0 }}>
          Laporan yang masuk akan tampil di sini
        </p>
      </div>
    );

  return (
    <div style={{ overflowY: "auto", maxHeight: "320px" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "max-content" }}>
          {data.map((item, i) => {
            const cfg = getStatusBadge(item.status, tProp);
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 18px",
                  borderBottom: border,
                  transition: "background .12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = rowHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Nomor */}
                <span style={{ fontSize:"11px", color:textDim, fontWeight:600, width:"20px", flexShrink:0, paddingTop:"2px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Konten vertical */}
                <div style={{ flex:1, minWidth:0 }}>
                  {/* Judul */}
                  <p style={{ fontSize:"12px", fontWeight:700, color:textMain, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.judul}
                  </p>
                  {/* Nama + status sejajar kanan */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", marginBottom:"3px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"5px", minWidth:0 }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span style={{ fontSize:"11px", color:textSub, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.nama}
                      </span>
                    </div>
                    <span
                      onClick={() => onNavigate("laporan")}
                      style={{
                        fontSize:"10px", fontWeight:700, padding:"2px 0",
                        borderRadius:"20px", border:`1.5px solid ${cfg.border}`,
                        background:cfg.bg, color:cfg.color, cursor:"pointer",
                        flexShrink:0, transition:"opacity .15s", whiteSpace:"nowrap",
                        minWidth: tProp?.bahasa === "en" ? "82px" : "72px",
                        textAlign:"center", display:"inline-block",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {/* Kategori */}
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                      <path d="M4 6h16M4 10h16M4 14h8"/>
                    </svg>
                    <span style={{ fontSize:"11px", color:textDim }}>{item.kategori || "—"}</span>
                  </div>
                  {/* Tanggal */}
                  <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span style={{ fontSize:"10px", color:textDim }}>
                      {fmtDate(item.tanggal)} · {(() => {
                        const now = new Date();
                        const d = new Date(item.tanggal);
                        const diff = Math.floor((now - d) / 1000);
                        const isEn = tProp?.bahasa === "en";
                        if (diff < 60) return isEn ? "Just now" : "Baru saja";
                        if (diff < 3600) return isEn ? `${Math.floor(diff/60)}m ago` : `${Math.floor(diff/60)} menit lalu`;
                        if (diff < 86400) return isEn ? `${Math.floor(diff/3600)}h ago` : `${Math.floor(diff/3600)} jam lalu`;
                        const days = Math.floor(diff / 86400);
                        if (days < 30) return isEn ? `${days} days ago` : `${days} hari lalu`;
                        return fmtDate(item.tanggal);
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NAV
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
    id: "kategori",
    label: "Manage Categories",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    id: "laporan",
    label: "Laporan",
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
    id: "pengguna",
    label: "Pengguna",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "analitik",
    label: "Analitik",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
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
    badge: true,
  },
  {
    id: "pengunjung",
    label: "Log Pengunjung",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 11l-4 4-2-2" />
      </svg>
    ),
  },
  {
    id: "pengaturan",
    label: "Pengaturan",
    icon: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────
// LAPORAN MENUNGGU TERLAMA
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// PENGATURAN: PROFIL FORM
// ─────────────────────────────────────────────────────────────
function PengaturanProfilForm({ user, setUser, showAlert, darkMode, DK }) {
  const [form, setForm] = useState({
    nama: user?.nama || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmPg, setShowConfirmPg] = useState(false);
  const isEn_pg = !!(typeof window !== "undefined" && localStorage.getItem("laporku_lang") === "en");
  const dm_pg = !!darkMode;
  const surfPg = dm_pg ? "#1E293B" : "#fff";
  const bdrPg  = dm_pg ? "1px solid #334155" : "1px solid #030c1769";
  const subtPg = dm_pg ? "#94A3B8" : "#374151";
  const hovPg  = dm_pg ? "#273449" : "#F8FAFC";
  const FPg    = "'Plus Jakarta Sans', sans-serif";
  const fileRef = useRef();
  const [loadingFoto, setLoadingFoto] = useState(false);

  useEffect(() => {
    api
      .get("/profil")
      .then((res) => {
        const d = res.data.data;
        setForm({ nama: d.nama || "", phone: d.phone || "" });
      })
      .catch(() => {});
  }, []);

  const handleSave = (e) => { e.preventDefault(); setShowConfirmPg(true); };

  const doSavePg = async () => {
    setShowConfirmPg(false);
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
        title: isEn_pg ? "Profile Updated!" : "Profil Diperbarui!",
        message: isEn_pg ? "Profile data has been saved." : "Data profil berhasil disimpan.",
      });
    } catch (err) {
      showAlert({
        type: "error",
        title: isEn_pg ? "Failed!" : "Gagal!",
        message: err.response?.data?.message || "Gagal memperbarui profil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHapusFotoPg = () => {
    if (!user?.fotoProfil) return;
    showAlert({
      type: "delete",
      title: isEn_pg ? "Delete Profile Photo?" : "Hapus Foto Profil?",
      message: isEn_pg ? "Your profile photo will be permanently deleted." : "Foto profil Anda akan dihapus permanen.",
      confirmLabel: isEn_pg ? "Yes, Delete" : "Ya, Hapus",
      onConfirm: async () => {
        setLoadingFoto(true);
        try {
          await profilService.deleteFoto();
          setUser((prev) => ({ ...prev, fotoProfil: null }));
          if (typeof refreshUser === 'function') await refreshUser();
          showAlert({
            type: "success",
            title: isEn_pg ? "Photo Deleted!" : "Foto Dihapus!",
            message: isEn_pg ? "Profile photo has been removed." : "Foto profil berhasil dihapus.",
          });
        } catch {
          showAlert({
            type: "error",
            title: isEn_pg ? "Failed!" : "Gagal!",
            message: isEn_pg ? "Failed to delete photo." : "Gagal menghapus foto.",
          });
        } finally {
          setLoadingFoto(false);
        }
      },
    });
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const resetRef = () => { if (fileRef.current) fileRef.current.value = ""; };
    showAlert({
      type: "confirm",
      title: isEn_pg ? "Update Profile Photo?" : "Perbarui Foto Profil?",
      message: isEn_pg ? "Your current profile photo will be replaced." : "Foto profil Anda saat ini akan diganti.",
      confirmLabel: isEn_pg ? "Yes, Update" : "Ya, Perbarui",
      onConfirm: async () => {
        setLoadingFoto(true);
        try {
          const res = await profilService.uploadFoto(file);
          setUser((prev) => ({ ...prev, fotoProfil: res.data.data.fotoProfil }));
          showAlert({
            type: "success",
            title: isEn_pg ? "Photo Updated!" : "Foto Diperbarui!",
            message: isEn_pg ? "Photo has been updated." : "Foto profil berhasil diperbarui.",
          });
        } catch {
          showAlert({
            type: "error",
            title: isEn_pg ? "Failed!" : "Gagal!",
            message: isEn_pg ? "Failed to upload photo." : "Gagal mengupload foto.",
          });
        } finally {
          setLoadingFoto(false);
          resetRef();
        }
      },
      onCancel: resetRef,
    });
  };

  const initials =
    user?.nama
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";
  const IS = (disabled = false) => ({
    width: "100%",
    padding: "10px 13px",
    border: `2px solid ${disabled ? (darkMode ? "#334155" : "#E2E8F0") : darkMode ? "#475569" : "#CBD5E1"}`,
    borderRadius: "11px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    background: disabled ? (darkMode ? "#1E293B" : "#F8FAFC") : DK.inputBg,
    color: disabled ? DK.dimtext : DK.text,
    transition: "border-color .15s",
  });
  const onFocus = (e) => {
    e.target.style.borderColor = "#2563EB";
    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
  };
  const onBlur =
    (d = false) =>
    (e) => {
      e.target.style.borderColor = d
        ? darkMode
          ? "#334155"
          : "#E2E8F0"
        : darkMode
          ? "#475569"
          : "#CBD5E1";
      e.target.style.boxShadow = "none";
    };

  return (
    <>
    <form onSubmit={handleSave}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          paddingBottom: "20px",
          borderBottom: DK.border,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#2563EB,#7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              color: "#fff",
              overflow: "hidden",
              border: "3px solid #fff",
              boxShadow: "0 0 0 2px #2563EB",
            }}
          >
            {user?.fotoProfil ? (
              <img
                src={user.fotoProfil}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            disabled={loadingFoto}
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#2563EB",
              border: "2px solid #fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <svg
              width="9"
              height="9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          {/* iOS-style: X merah hapus foto kiri bawah */}
          {user?.fotoProfil && (
            <button
              type="button"
              onClick={handleHapusFotoPg}
              disabled={loadingFoto}
              title={isEn_pg ? "Remove photo" : "Hapus foto"}
              style={{
                position: "absolute",
                bottom: "-2px",
                left: "-2px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "#EF4444",
                border: "2px solid #fff",
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
          onChange={handleFoto}
        />
        <div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: DK.text,
              margin: "0 0 2px",
            }}
          >
            {user?.nama}
          </p>
          <p style={{ fontSize: "12px", color: DK.dimtext, margin: 0 }}>
            {user?.email}
          </p>
          {loadingFoto && (
            <p
              style={{ fontSize: "11px", color: "#2563EB", margin: "4px 0 0" }}
            >
              Mengupload foto...
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Nama Lengkap
          </label>
          <input
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama lengkap"
            style={IS()}
            onFocus={onFocus}
            onBlur={onBlur()}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            No. Telepon
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
            style={IS()}
            onFocus={onFocus}
            onBlur={onBlur()}
          />
          <p style={{ fontSize: "11px", color: DK.dimtext, margin: "4px 0 0" }}>
            Nomor yang dapat dihubungi
          </p>
        </div>
      </div>
      <div
        style={{
          height: "1px",
          background: darkMode ? "#1E293B" : "#F1F5F9",
          margin: "4px 0 14px",
        }}
      />
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: DK.dimtext,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Informasi Akun
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Email
          </label>
          <input value={user?.email || ""} disabled style={IS(true)} />
          <p style={{ fontSize: "11px", color: DK.dimtext, margin: "4px 0 0" }}>
            Tidak dapat diubah
          </p>
        </div>
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Username
          </label>
          <input value={user?.username || ""} disabled style={IS(true)} />
          <p style={{ fontSize: "11px", color: DK.dimtext, margin: "4px 0 0" }}>
            Tidak dapat diubah
          </p>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Role
          </label>
          <div
            style={{
              padding: "10px 13px",
              border: `2px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
              borderRadius: "11px",
              background: darkMode ? "#1E293B" : "#F8FAFC",
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
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            {t.statusAkun}
          </label>
          <div
            style={{
              padding: "10px 13px",
              border: `2px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
              borderRadius: "11px",
              background: darkMode ? "#1E293B" : "#F8FAFC",
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
                flexShrink: 0,
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
              Aktif
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: DK.border,
        }}
      >
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: loading ? "#93C5FD" : "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
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
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Menyimpan...
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
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
    {/* ── Poin 8: Konfirmasi Simpan Profil (Admin Pengaturan) ── */}
    {showConfirmPg && (
      <div onClick={() => setShowConfirmPg(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
        <div onClick={e => e.stopPropagation()} style={{ background:surfPg,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm_pg?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:bdrPg,overflow:"hidden",fontFamily:FPg }}>
          <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <p style={{ fontSize:"16px",fontWeight:800,color:dm_pg?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FPg }}>
              {isEn_pg ? "Save Profile?" : "Simpan Profil?"}
            </p>
            <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FPg }}>
              {isEn_pg ? "Are you sure you want to update your profile data?" : "Yakin ingin menyimpan perubahan data profil?"}
            </p>
          </div>
          <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
            <button onClick={() => setShowConfirmPg(false)} style={{ flex:1,padding:"11px",border:bdrPg,background:"transparent",color:subtPg,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FPg,borderRadius:"9px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = hovPg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {isEn_pg ? "Cancel" : "Batal"}
            </button>
            <button onClick={doSavePg} style={{ flex:1,padding:"11px",border:"2px solid #2563EB",background:"#2563EB",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FPg,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
              onMouseLeave={e => e.currentTarget.style.background = "#2563EB"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {isEn_pg ? "Yes, Save" : "Ya, Simpan"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PENGATURAN: PASSWORD FORM
// ─────────────────────────────────────────────────────────────
function PengaturanPasswordForm({ showAlert, darkMode, DK, t: tProp }) {
  const [form, setForm] = useState({
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

  const strength = !form.password_baru
    ? 0
    : form.password_baru.length < 8
      ? 1
      : form.password_baru.length >= 8 &&
          /[A-Z]/.test(form.password_baru) &&
          /[0-9]/.test(form.password_baru) &&
          /[^a-zA-Z0-9]/.test(form.password_baru)
        ? 4
        : form.password_baru.length >= 8 &&
            (/[A-Z]/.test(form.password_baru) ||
              /[0-9]/.test(form.password_baru))
          ? 3
          : 2;
  const SC = ["#E2E8F0", "#EF4444", "#F59E0B", "#3B82F6", "#059669"];
  const SL = ["", "Terlalu pendek", "Lemah", "Cukup kuat", "Sangat kuat"];

  const IS = {
    width: "100%",
    padding: "10px 42px 10px 13px",
    border: `2px solid ${darkMode ? "#475569" : "#CBD5E1"}`,
    borderRadius: "11px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    background: DK.inputBg,
    color: DK.text,
    transition: "border-color .15s",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = "#2563EB";
    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = darkMode ? "#475569" : "#CBD5E1";
    e.target.style.boxShadow = "none";
  };

  const Eye = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#94A3B8",
        padding: 0,
        display: "flex",
      }}
    >
      <svg
        width="15"
        height="15"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={
            show
              ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          }
        />
      </svg>
    </button>
  );

  const [showConfirmPw2, setShowConfirmPw2] = useState(false);
  const isEn_pw2 = !!(typeof window !== "undefined" && localStorage.getItem("laporku_lang") === "en");
  const dm_pw2 = !!darkMode;
  const surfPw2 = dm_pw2 ? "#1E293B" : "#fff";
  const bdrPw2  = dm_pw2 ? "1px solid #334155" : "1px solid #030c1769";
  const subtPw2 = dm_pw2 ? "#94A3B8" : "#374151";
  const hovPw2  = dm_pw2 ? "#273449" : "#F8FAFC";
  const FPw2    = "'Plus Jakarta Sans', sans-serif";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password_baru !== form.konfirmasi_password)
      return showAlert({ type: "error", title: isEn_pw2 ? "Failed!" : "Gagal!", message: isEn_pw2 ? "New passwords do not match." : "Password baru tidak sama." });
    if (form.password_baru.length < 8)
      return showAlert({ type: "error", title: isEn_pw2 ? "Failed!" : "Gagal!", message: isEn_pw2 ? "Password must be at least 8 characters." : "Password minimal 8 karakter." });
    setShowConfirmPw2(true);
  };

  const doUpdatePw2 = async () => {
    setShowConfirmPw2(false);
    setLoading(true);
    try {
      await profilService.updatePassword(form);
      setForm({ password_lama: "", password_baru: "", konfirmasi_password: "" });
      showAlert({ type: "success", title: isEn_pw2 ? "Password Updated!" : "Password Diperbarui!", message: isEn_pw2 ? "Password has been updated." : "Password berhasil diperbarui." });
    } catch (err) {
      showAlert({ type: "error", title: isEn_pw2 ? "Failed!" : "Gagal!", message: err.response?.data?.message || "Gagal memperbarui password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      {/* iOS-style inline warning banner */}
      <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #FDE68A", marginBottom: "18px" }}>
        <div style={{ background: "linear-gradient(135deg, #D97706, #B45309)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0 }}>{tProp?.perhatian || "Perhatian"}</p>
        </div>
        <div style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", padding: "12px 16px" }}>
          <p style={{ fontSize: "13px", color: "#78350F", margin: 0, lineHeight: 1.6 }}>
            {tProp?.peringatanSandi || "Setelah password diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang."}
          </p>
        </div>
      </div>
      <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Password Saat Ini
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass.lama ? "text" : "password"}
              value={form.password_lama}
              onChange={(e) =>
                setForm({ ...form, password_lama: e.target.value })
              }
              placeholder="Password saat ini"
              style={IS}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <Eye
              show={showPass.lama}
              onToggle={() => setShowPass((p) => ({ ...p, lama: !p.lama }))}
            />
          </div>
        </div>
        <div
          style={{
            height: "1px",
            background: darkMode ? "#1E293B" : "#F1F5F9",
          }}
        />
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Password Baru
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass.baru ? "text" : "password"}
              value={form.password_baru}
              onChange={(e) =>
                setForm({ ...form, password_baru: e.target.value })
              }
              placeholder="Minimal 8 karakter"
              style={IS}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <Eye
              show={showPass.baru}
              onToggle={() => setShowPass((p) => ({ ...p, baru: !p.baru }))}
            />
          </div>
          {form.password_baru && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background: i <= strength ? SC[strength] : "#E2E8F0",
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
        </div>
        <div>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: DK.text,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Konfirmasi Password Baru
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass.konfirmasi ? "text" : "password"}
              value={form.konfirmasi_password}
              onChange={(e) =>
                setForm({ ...form, konfirmasi_password: e.target.value })
              }
              placeholder="Ulangi password baru"
              style={IS}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <Eye
              show={showPass.konfirmasi}
              onToggle={() =>
                setShowPass((p) => ({ ...p, konfirmasi: !p.konfirmasi }))
              }
            />
          </div>
          {form.konfirmasi_password && (
            <p
              style={{
                fontSize: "11px",
                margin: "5px 0 0",
                fontWeight: 500,
                color:
                  form.password_baru !== form.konfirmasi_password
                    ? "#EF4444"
                    : "#059669",
              }}
            >
              {form.password_baru !== form.konfirmasi_password
                ? "⚠ Password tidak sama"
                : "✓ Password cocok"}
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: DK.border,
        }}
      >
        <button
          type="submit"
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: loading ? "#6EE7B7" : "#059669",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#047857";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "#059669";
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
              Memperbarui...
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
              Perbarui Password
            </>
          )}
        </button>
      </div>
    </form>
    {/* ── Poin 8: Konfirmasi Update Password (Admin Pengaturan) ── */}
    {showConfirmPw2 && (
      <div onClick={() => setShowConfirmPw2(false)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
        <div onClick={e => e.stopPropagation()} style={{ background:surfPw2,borderRadius:"14px",width:"100%",maxWidth:"360px",boxShadow:dm_pw2?"0 4px 24px rgba(0,0,0,0.5)":"0 4px 24px rgba(15,23,42,0.18)",border:bdrPw2,overflow:"hidden",fontFamily:FPw2 }}>
          <div style={{ padding:"28px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
            <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={1.8} style={{ marginBottom:"14px" }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <p style={{ fontSize:"16px",fontWeight:800,color:dm_pw2?"#F1F5F9":"#0F172A",margin:"0 0 8px",fontFamily:FPw2 }}>
              {isEn_pw2 ? "Update Password?" : "Perbarui Password?"}
            </p>
            <p style={{ fontSize:"13px",color:"#64748B",lineHeight:1.6,margin:0,fontFamily:FPw2 }}>
              {isEn_pw2 ? "After updating, you will need to log in again." : "Setelah diperbarui, Anda perlu login ulang."}
            </p>
          </div>
          <div style={{ display:"flex",gap:"8px",padding:"0 24px 24px" }}>
            <button onClick={() => setShowConfirmPw2(false)} style={{ flex:1,padding:"11px",border:bdrPw2,background:"transparent",color:subtPw2,fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FPw2,borderRadius:"9px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = hovPw2}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {isEn_pw2 ? "Cancel" : "Batal"}
            </button>
            <button onClick={doUpdatePw2} style={{ flex:1,padding:"11px",border:"2px solid #D97706",background:"#D97706",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:FPw2,borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#B45309"}
              onMouseLeave={e => e.currentTarget.style.background = "#D97706"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {isEn_pw2 ? "Yes, Update" : "Ya, Perbarui"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// NOTIFIKASI CONTENT
// ─────────────────────────────────────────────────────────────
function NotifikasiContent({
  notifData,
  notifUnread,
  onRefresh,
  onNavigate,
  onGoToLaporan,
  showAlert,
  darkMode,
  DK,
  bahasa: notifBahasa,
  onConfirmDelete,
  notifDeleteConfirm,
  onCancelDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [detailNotif, setDetailNotif] = useState(null);
  const B = darkMode ? "1px solid #334155" : "1px solid #030c1769";
  const CARD = {
    background: DK?.surface || "#fff",
    borderRadius: "16px",
    border: B,
    boxShadow: darkMode
      ? "0 1px 4px rgba(0,0,0,0.6)"
      : "0 1px 4px rgba(8,18,42,0.44)",
  };
  const textMain = DK?.text || "#0F172A";
  const textSub = DK?.subtext || "#64748B";
  const textDim = DK?.dimtext || "#94A3B8";
  const rowHover = darkMode ? "#273449" : "#F1F7FF";
  const isNEn = notifBahasa === "en";
  const ntxt = {
    judul: isNEn ? "Notifications" : "Notifikasi",
    semuaDibaca: isNEn ? "All notifications read" : "Semua notifikasi sudah dibaca",
    belumDibaca: (n) => isNEn ? `${n} unread notification${n>1?'s':''}` : `${n} notifikasi belum dibaca`,
    tandaiSemua: isNEn ? "Mark All as Read" : "Tandai Semua Dibaca",
    memproses: isNEn ? "Processing..." : "Memproses...",
    tidakAda: isNEn ? "No notifications" : "Tidak ada notifikasi",
    tidakAdaSub: isNEn ? "Notifications will appear when there is new activity" : "Notifikasi akan muncul saat ada aktivitas baru",
    baru: isNEn ? "New" : "Baru",
    detailJudul: isNEn ? "Notification Detail" : "Detail Notifikasi",
    waktu: isNEn ? "Time" : "Waktu",
    statusLabel: "Status",
    sudahDibaca: isNEn ? "Already Read" : "Sudah Dibaca",
    belumDibacaLabel: isNEn ? "Unread" : "Belum Dibaca",
    lihatLaporan: isNEn ? "View Report" : "Lihat Laporan",
    hapus: isNEn ? "Delete" : "Hapus",
    tutup: isNEn ? "Close" : "Tutup",
    hapusJudul: isNEn ? "Delete Notification?" : "Hapus Notifikasi?",
    hapusPesan: isNEn ? "This notification will be permanently deleted." : "Notifikasi ini akan dihapus permanen.",
    hapusYa: isNEn ? "Yes, Delete" : "Ya, Hapus",
    hapusBatal: isNEn ? "Cancel" : "Batal",
    laporan_baru: isNEn ? "New Report" : "Laporan Baru",
    status_update: isNEn ? "Status Update" : "Update Status",
    laporan_ditolak: isNEn ? "Rejected" : "Ditolak",
    notifikasi: isNEn ? "Notification" : "Notifikasi",
  };

  const handleBaca = async (notif) => {
    try {
      if (!notif.dibaca) await notifikasiService.baca(notif.id);
      onRefresh();
    } catch {}
    // Buka dialog detail
    setDetailNotif(notif);
  };

  const handleHapus = async (e, notif) => {
    e.stopPropagation();
    // Show confirm dialog instead of direct delete
    if (onConfirmDelete) {
      onConfirmDelete(notif);
    }
  };

  const doHapus = async (notif) => {
    try {
      await notifikasiService.hapus(notif.id);
      onRefresh();
      if (onCancelDelete) onCancelDelete();
      showAlert({
        type: "success",
        title: ntxt.hapusJudul,
        message: ntxt.hapusPesan,
      });
    } catch {
      if (onCancelDelete) onCancelDelete();
      showAlert({
        type: "error",
        title: "Gagal",
        message: "Gagal menghapus notifikasi.",
      });
    }
  };

  const handleBacaSemua = async () => {
    setLoading(true);
    try {
      await notifikasiService.bacaSemua();
      onRefresh();
      showAlert({
        type: "success",
        title: "Semua Dibaca",
        message: "Semua notifikasi telah ditandai sebagai sudah dibaca.",
      });
    } catch {
      showAlert({
        type: "error",
        title: "Gagal",
        message: "Gagal menandai notifikasi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diff = Math.floor((now - date) / 1000);
    const isEn = notifBahasa === "en";
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const timeStr = `${hh}:${min}`;
    if (diff < 60) return isEn ? "Just now" : "Baru saja";
    if (diff < 3600) return isEn ? `${Math.floor(diff / 60)}m ago` : `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return isEn ? `${Math.floor(diff / 3600)}h ago` : `${Math.floor(diff / 3600)} jam lalu`;
    const locale = isEn ? "en-US" : "id-ID";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + `, ${timeStr}`;
  };

  const ICON_CFG = {
    laporan_baru: {
      icon: (
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
        </svg>
      ),
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#2563EB",
      label: ntxt.laporan_baru,
    },
    status_update: {
      icon: (
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      bg: "#ECFDF5",
      border: "#A7F3D0",
      color: "#059669",
      label: ntxt.status_update,
    },
    laporan_ditolak: {
      icon: (
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#DC2626",
      label: ntxt.laporan_ditolak,
    },
    default: {
      icon: (
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      bg: "#F5F3FF",
      border: "#DDD6FE",
      color: "#7C3AED",
      label: ntxt.notifikasi,
    },
  };

  const getIconCfg = (tipe) => ICON_CFG[tipe] || ICON_CFG.default;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "0", flex: 1 }}
    >
      {/* ── Confirm Delete Dialog ── */}
      {notifDeleteConfirm && (
        <AlertPopup
          alert={{
            type: "delete",
            title: ntxt.hapusJudul,
            message: `"${notifDeleteConfirm.pesan?.slice(0, 60)}${notifDeleteConfirm.pesan?.length > 60 ? "..." : ""}" ${ntxt.hapusPesan}`,
            confirmLabel: ntxt.hapusYa,
          }}
          cancelLabel={ntxt.hapusBatal}
          onClose={onCancelDelete}
          onConfirm={() => doHapus(notifDeleteConfirm)}
          darkMode={darkMode}
        />
      )}
      {/* Dialog Detail Notifikasi */}
      {detailNotif && (() => {
        const cfg = getIconCfg(detailNotif.tipe);
        return (
          <div
            onClick={() => setDetailNotif(null)}
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
                background: DK?.surface || "#fff",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "420px",
                border: B,
                overflow: "hidden",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                boxShadow: "0 8px 32px rgba(15,23,42,0.25)",
              }}
            >
              {/* Header dialog */}
              <div
                style={{
                  padding: "20px 20px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  borderBottom: B,
                  background: darkMode ? "#273449" : "#F8FAFC",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: cfg.bg,
                    border: `1.5px solid ${cfg.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: cfg.color,
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: cfg.color,
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: textDim,
                      }}
                    >
                      {fmtTime(detailNotif.createdAt)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: textMain,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Detail Notifikasi
                  </p>
                </div>
                <button
                  onClick={() => setDetailNotif(null)}
                  style={{
                    background: darkMode ? "rgba(239,68,68,0.12)" : "#FFF1F2",
                    border: "1.5px solid #FECACA",
                    cursor: "pointer",
                    color: "#EF4444",
                    padding: "5px",
                    display: "flex",
                    borderRadius: "8px",
                    flexShrink: 0,
                    transition: "all .15s",
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* Body dialog */}
              <div style={{ padding: "20px" }}>
                <div
                  style={{
                    padding: "16px",
                    background: darkMode ? "#1E293B" : "#F8FAFC",
                    borderRadius: "12px",
                    border: B,
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: textMain,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {detailNotif.pesan}
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                  <div
                    style={{
                      padding: "12px",
                      background: darkMode ? "#273449" : "#fff",
                      borderRadius: "10px",
                      border: B,
                    }}
                  >
                    <p style={{ fontSize: "10px", fontWeight: 700, color: textDim, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Waktu</p>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: textMain, margin: "0 0 3px" }}>{fmtTime(detailNotif.createdAt)}</p>
                    <p style={{ fontSize: "11px", color: textDim, margin: 0 }}>
                      {(() => {
                        const d = new Date(detailNotif.createdAt);
                        const days = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
                        const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                        const hh = String(d.getHours()).padStart(2,"0");
                        const mm = String(d.getMinutes()).padStart(2,"0");
                        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`;
                      })()}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      background: darkMode ? "#273449" : "#fff",
                      borderRadius: "10px",
                      border: B,
                    }}
                  >
                    <p style={{ fontSize: "10px", fontWeight: 700, color: textDim, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Status</p>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: detailNotif.dibaca ? "#059669" : "#2563EB", margin: 0 }}>
                      {detailNotif.dibaca ? ntxt.sudahDibaca : ntxt.belumDibacaLabel}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {detailNotif.laporanId && (
                    <button
                      onClick={() => {
                        setDetailNotif(null);
                        if (onGoToLaporan) onGoToLaporan(detailNotif.laporanId);
                      }}
                      style={{
                        flex: 1,
                        padding: "11px",
                        background: "#2563EB",
                        border: "2px solid #1D4ED8",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        borderRadius: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1D4ED8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#2563EB")}
                    >
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" d="M9 5l7 7-7 7" />
                      </svg>
                      {ntxt.lihatLaporan}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      setDetailNotif(null);
                      e.stopPropagation();
                      if (onConfirmDelete) onConfirmDelete(detailNotif);
                    }}
                    style={{
                      flex: detailNotif.laporanId ? "0 0 auto" : 1,
                      padding: "11px 18px",
                      background: "#FEF2F2",
                      border: "2px solid #FECACA",
                      color: "#EF4444",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      borderRadius: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                    Hapus
                  </button>
                  <button
                    onClick={() => setDetailNotif(null)}
                    style={{
                      padding: "11px 18px",
                      background: "transparent",
                      border: B,
                      color: textSub,
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      borderRadius: "11px",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#273449" : "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
{ntxt.tutup}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: textMain,
              margin: "0 0 4px",
            }}
          >
            {ntxt.judul}
          </p>
          <p style={{ fontSize: "13px", color: textSub, margin: 0 }}>
            {notifUnread > 0 ? (
              <span>
                <strong style={{ color: textMain }}>{notifUnread}</strong>{" "}
                {notifUnread > 1 ? ntxt.belumDibaca(notifUnread).replace(/\d+\s+/, "") : ntxt.belumDibaca(notifUnread).replace(/\d+\s+/, "")}
              </span>
            ) : (
              ntxt.semuaDibaca
            )}
          </p>
        </div>
        {notifUnread > 0 && (
          <button
            onClick={handleBacaSemua}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: "#EFF6FF",
              border: "1.5px solid #BFDBFE",
              borderRadius: "11px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#2563EB",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#DBEAFE")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#EFF6FF")}
          >
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
            {loading ? ntxt.memproses : ntxt.tandaiSemua}
          </button>
        )}
      </div>

      <div style={{ ...CARD, overflow: "hidden", flex: 1 }}>
        {notifData.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: darkMode ? "#1E293B" : "#F8FAFC",
                border: B,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: darkMode ? "#475569" : "#CBD5E1",
              }}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: textSub,
                margin: "0 0 6px",
              }}
            >
              {ntxt.tidakAda}
            </p>
            <p style={{ fontSize: "12px", color: textDim, margin: 0 }}>
              {ntxt.tidakAdaSub}
            </p>
          </div>
        ) : (
          <div>
            {notifData.map((notif, i) => {
              const cfg = getIconCfg(notif.tipe);
              const hasLaporan = !!notif.laporanId;
              const unreadBg = darkMode ? "#1A2744" : "#FAFBFF";
              return (
                <div
                  key={notif.id}
                  onClick={() => handleBaca(notif)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px 16px",
                    borderBottom: i < notifData.length - 1 ? (darkMode ? "1px solid #1E293B" : "1px solid #F1F5F9") : "none",
                    background: notif.dibaca ? "transparent" : unreadBg,
                    cursor: "pointer",
                    transition: "background .15s",
                    position: "relative",
                    borderRadius: i === 0 ? "14px 14px 0 0" : i === notifData.length - 1 ? "0 0 14px 14px" : "0",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = rowHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = notif.dibaca ? "transparent" : unreadBg; }}
                >
                  {/* Unread dot */}
                  {!notif.dibaca && (
                    <div style={{ position:"absolute", top:"18px", left:"5px", width:"5px", height:"5px", borderRadius:"50%", background:"#3B82F6" }} />
                  )}
                  {/* Icon — larger, more iOS */}
                  <div style={{
                    width:"42px", height:"42px", borderRadius:"14px",
                    background: darkMode ? `${cfg.bg}30` : cfg.bg,
                    border:`1.5px solid ${cfg.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:cfg.color, flexShrink:0, boxShadow: darkMode ? "none" : `0 2px 6px ${cfg.border}60`,
                  }}>
                    {cfg.icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Pesan + waktu relatif sejajar */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px", marginBottom:"4px" }}>
                      <p style={{ fontSize:"13px", fontWeight: notif.dibaca ? 500 : 700, color:textMain, margin:0, lineHeight:1.5, flex:1 }}>
                        {notif.pesan}
                      </p>
                      <span style={{ fontSize:"10px", color:textDim, flexShrink:0, paddingTop:"2px", whiteSpace:"nowrap" }}>
                        {fmtTime(notif.createdAt)}
                      </span>
                    </div>
                    {/* Tanggal lengkap */}
                    <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom: hasLaporan ? "8px" : "0" }}>
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{ fontSize:"10px", color:textDim }}>
                        {(() => {
                          const d = new Date(notif.createdAt);
                          const isEn = notifBahasa === "en";
                          const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                          const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                          const mon = isEn ? MONTHS_EN[d.getMonth()] : MONTHS_ID[d.getMonth()];
                          const hh = String(d.getHours()).padStart(2,"0");
                          const mn = String(d.getMinutes()).padStart(2,"0");
                          return `${d.getDate()} ${mon} ${d.getFullYear()}, ${hh}:${mn}`;
                        })()}
                      </span>
                    </div>
                    {/* View Report button — iOS pill style */}
                    {hasLaporan && (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (onGoToLaporan) onGoToLaporan(notif.laporanId); }}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:"4px",
                          fontSize:"11px", fontWeight:700,
                          color:"#fff", background:"#2563EB",
                          border:"none", padding:"5px 12px",
                          borderRadius:"20px", cursor:"pointer",
                          fontFamily:"inherit", transition:"all .15s",
                          boxShadow:"0 2px 6px rgba(37,99,235,0.35)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background="#1D4ED8"; e.currentTarget.style.boxShadow="0 3px 8px rgba(37,99,235,0.45)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="#2563EB"; e.currentTarget.style.boxShadow="0 2px 6px rgba(37,99,235,0.35)"; }}
                      >
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
                        </svg>
                        {ntxt.lihatLaporan}
                      </button>
                    )}
                  </div>
                  {/* Kanan: unread badge + hapus */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px", flexShrink:0, paddingTop:"2px" }}>
                    {!notif.dibaca && (
                      <span style={{
                        fontSize:"9px", fontWeight:800,
                        color:"#fff", background:"#3B82F6",
                        padding:"2px 7px", borderRadius:"20px",
                        letterSpacing:"0.3px",
                      }}>
                        {ntxt.baru || "Baru"}
                      </span>
                    )}
                    {/* Tombol hapus — hanya untuk admin, tidak memengaruhi notif masyarakat */}
                    <button
                      onClick={(e) => handleHapus(e, notif)}
                      title="Hapus notifikasi"
                      style={{
                        background: "none",
                        border: `1.5px solid #FECACA`,
                        borderRadius: "8px",
                        width: "28px",
                        height: "28px",
                        cursor: "pointer",
                        color: "#EF4444",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .15s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FEF2F2";
                        e.currentTarget.style.borderColor = "#EF4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                        e.currentTarget.style.borderColor = "#FECACA";
                      }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LaporanTerlama({ onNavigate, onGoToLaporan, darkMode, DK, t }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    laporanService
      .getAdmin({ status: "menunggu" })
      .then((r) => {
        const sorted = (r.data.data || [])
          .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
          .slice(0, 5);
        setData(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hariIni = new Date();
  const selisihHari = (d) => {
    const diff = hariIni - new Date(d);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const badgeColor = (hari) => {
    if (hari >= 5)
      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };
    if (hari >= 3)
      return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" };
    return { bg: "#F0FDF4", color: "#059669", border: "#A7F3D0" };
  };

  const cardBg = darkMode ? "#1E293B" : "#fff";
  const cardBorder = darkMode ? "1px solid #334155" : B;
  const textMain = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub = darkMode ? "#94A3B8" : "#64748B";
  const textDim = darkMode ? "#64748B" : "#64748B";
  const rowHover = darkMode ? "#273449" : "#F8FAFC";

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: "16px",
        border: cardBorder,
        boxShadow: darkMode
          ? "0 1px 4px rgba(0,0,0,0.6)"
          : "0 1px 4px rgba(8,18,42,0.44)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: cardBorder,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: textMain,
              margin: 0,
            }}
          >
            {t.menungguTerlama}
          </p>
          <p style={{ fontSize: "11px", color: textSub, margin: "2px 0 0" }}>
            {loading ? t.menungguTerlamaSub : (t.menungguTerlamaCount ? t.menungguTerlamaCount(data.length) : t.menungguTerlamaSub)}
          </p>
        </div>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "#FEF2F2",
            border: "1.5px solid #FECACA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#DC2626"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>
      {loading ? (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            fontSize: "12px",
            color: textDim,
          }}
        >
          Memuat...
        </div>
      ) : data.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#059669",
              margin: "0 0 4px",
            }}
          >
            Semua laporan tertangani!
          </p>
          <p style={{ fontSize: "12px", color: textDim, margin: 0 }}>
            Tidak ada laporan menunggu
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", maxHeight: "320px" }}>
          <div>
            <div>
              {data.map((item, i) => {
                const hari = selisihHari(item.tanggal);
                const bc = badgeColor(hari);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "12px 16px",
                      borderBottom: cardBorder,
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = rowHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Nomor */}
                    <span style={{ fontSize:"11px", color:textDim, fontWeight:600, width:"18px", flexShrink:0, paddingTop:"2px" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* Konten vertical — sama persis struktur RecentLaporan */}
                    <div style={{ flex:1, minWidth:0 }}>
                      {/* Judul */}
                      <p style={{ fontSize:"12px", fontWeight:700, color:textMain, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.judul}
                      </p>
                      {/* Nama + badge hari sejajar kanan */}
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", marginBottom:"3px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"5px", minWidth:0 }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span style={{ fontSize:"11px", color:textSub, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {item.nama}
                          </span>
                        </div>
                        <span
                          onClick={() => onGoToLaporan ? onGoToLaporan(item.id) : onNavigate && onNavigate()}
                          style={{
                            fontSize:"10px", fontWeight:700, padding:"2px 0",
                            borderRadius:"20px", background:bc.bg, color:bc.color,
                            border:`1.5px solid ${bc.border}`, whiteSpace:"nowrap",
                            cursor:"pointer", flexShrink:0, transition:"opacity .15s",
                            minWidth: t?.bahasa === "en" ? "64px" : "60px",
                            textAlign:"center", display:"inline-block",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                        >
                          {hari === 0 ? (t?.hariIni || "Hari ini") : `${hari} ${t?.hariLabel || "hari"}`}
                        </span>
                      </div>
                      {/* Kategori */}
                      <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                          <path d="M4 6h16M4 10h16M4 14h8"/>
                        </svg>
                        <span style={{ fontSize:"11px", color:textDim }}>{item.kategori || "—"}</span>
                      </div>
                      {/* Tanggal */}
                      <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={textDim} strokeWidth={2} style={{ flexShrink:0 }}>
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span style={{ fontSize:"10px", color:textDim }}>
                          {(() => {
                            const d = new Date(item.tanggal);
                            const MONTHS_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
                            const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                            const mon = t?.bahasa === "en" ? MONTHS_EN[d.getMonth()] : MONTHS_ID[d.getMonth()];
                            const hh = String(d.getHours()).padStart(2,"0");
                            const mn = String(d.getMinutes()).padStart(2,"0");
                            return `${d.getDate()} ${mon} ${d.getFullYear()}, ${hh}:${mn}`;
                          })()} · {(() => {
                            const now = new Date();
                            const d = new Date(item.tanggal);
                            const diff = Math.floor((now - d) / 1000);
                            const isEn = t?.bahasa === "en";
                            if (diff < 60) return isEn ? "Just now" : "Baru saja";
                            if (diff < 3600) return isEn ? `${Math.floor(diff/60)}m ago` : `${Math.floor(diff/60)} mnt lalu`;
                            if (diff < 86400) return isEn ? `${Math.floor(diff/3600)}h ago` : `${Math.floor(diff/3600)} jam lalu`;
                            const days = Math.floor(diff / 86400);
                            return isEn ? `${days} days ago` : `${days} hari lalu`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
          borderRadius: "16px",
          background: "#F8FAFC",
          border: B,
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
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// DONUT CHART COMPONENTS — cursor-following tooltip
// ─────────────────────────────────────────────────────────────
function DonutChart1({ data, total, DK, darkMode, t, bahasa }) {
  const [hover, setHover] = React.useState(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef(null);
  return (
    <div
      ref={ref}
      style={{ position: "relative", width: 240, height: 240 }}
      onMouseMove={e => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <ResponsiveContainer width={240} height={240}>
        <PieChart>
          <Pie
            data={data}
            cx={110}
            cy={110}
            innerRadius={68}
            outerRadius={108}
            dataKey="value"
            strokeWidth={total === 0 ? 0 : 3}
            stroke={DK.surface}
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
        <p style={{ fontSize: "40px", fontWeight: 800, color: DK.text, margin: 0, lineHeight: 1 }}>
          {total}
        </p>
        <p style={{ fontSize: "12px", color: DK.dimtext, margin: "4px 0 0", fontWeight: 600 }}>
          {t?.totalLaporanDonut || "Total Laporan"}
        </p>
      </div>
      {/* Cursor-following tooltip */}
      {hover && total > 0 && (() => {
        const val = hover.value;
        const name = hover.name;
        const color = hover.fill;
        const pct = total ? Math.round((val / total) * 100) : 0;
        const TW = 136, TH = 72;
        const left = pos.x + 14 + TW > 240 ? pos.x - TW - 10 : pos.x + 14;
        const top  = pos.y + 14 + TH > 240 ? pos.y - TH - 10 : pos.y + 14;
        return (
          <div style={{
            position: "absolute", left, top,
            background: DK.surface, border: DK.border,
            borderRadius: "10px", padding: "8px 12px",
            fontSize: "12px", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none", whiteSpace: "nowrap",
            zIndex: 100, minWidth: "120px",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"4px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:color, flexShrink:0 }}/>
              <span style={{ fontWeight:700, color:DK.text }}>{name}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:DK.dimtext }}>{bahasa==="en"?"Reports":"Laporan"}</span>
              <span style={{ fontWeight:800, color:DK.text }}>{val}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:DK.dimtext }}>%</span>
              <span style={{ fontWeight:700, color }}>{pct}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function DonutChart2({ data, total, DK, darkMode, bahasa }) {
  const [hover, setHover] = React.useState(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const ref = React.useRef(null);
  return (
    <div
      ref={ref}
      style={{ position: "relative", flexShrink: 0 }}
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
            stroke={DK.surface}
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
        <p style={{ fontSize: "36px", fontWeight: 800, color: DK.text, margin: 0, lineHeight: 1 }}>{total}</p>
        <p style={{ fontSize: "11px", color: DK.dimtext, margin: 0, fontWeight: 600 }}>Total</p>
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
            background: DK.surface, border: DK.border,
            borderRadius: "10px", padding: "8px 12px",
            fontSize: "12px", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none", whiteSpace: "nowrap",
            zIndex: 100, minWidth: "120px",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"4px" }}>
              <div style={{ width:"10px", height:"10px", borderRadius:"3px", background:color, flexShrink:0 }}/>
              <span style={{ fontWeight:700, color:DK.text }}>{name}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:DK.dimtext }}>{bahasa==="en"?"Reports":"Laporan"}</span>
              <span style={{ fontWeight:800, color:DK.text }}>{val}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:"16px" }}>
              <span style={{ color:DK.dimtext }}>%</span>
              <span style={{ fontWeight:700, color }}>{pct}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// =============================================================
// VISITOR LOG PAGE — komponen terpisah agar hooks valid
// (useState/useEffect tidak boleh di dalam IIFE bersyarat)
// =============================================================
function VisitorLogPage({ darkMode, DK, bahasa }) {
  const [vStats,        setVStats]        = useState(null);
  const [vTable,        setVTable]        = useState([]);
  const [vPage,         setVPage]         = useState(1);
  const [vTotal,        setVTotal]        = useState(0);
  const [vLoading,      setVLoading]      = useState(true);
  const [vTableLoading, setVTableLoading] = useState(true);
  const [csvLoading,    setCsvLoading]    = useState(false);
  const [chartPeriode,  setChartPeriode]  = useState('7hari');

  useEffect(() => {
    setVLoading(true);
    analyticsService.getStats()
      .then(r => setVStats(r.data.data))
      .catch(() => {})
      .finally(() => setVLoading(false));
  }, []);

  useEffect(() => {
    setVTableLoading(true);
    analyticsService.getTable(vPage, 15)
      .then(r => { setVTable(r.data.data); setVTotal(r.data.meta?.total || 0); })
      .catch(() => {})
      .finally(() => setVTableLoading(false));
  }, [vPage]);

  const handleCsvDownload = async () => {
    setCsvLoading(true);
    try {
      const res = await analyticsService.exportCsv();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `visitor-log-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { } finally { setCsvLoading(false); }
  };

  const relativeTime = (dateStr, lang) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)      return lang==='en'?`${diff}s ago`:`${diff} detik lalu`;
    if (diff < 3600)    return lang==='en'?`${Math.floor(diff/60)}m ago`:`${Math.floor(diff/60)} menit lalu`;
    if (diff < 86400)   return lang==='en'?`${Math.floor(diff/3600)}h ago`:`${Math.floor(diff/3600)} jam lalu`;
    if (diff < 2592000) return lang==='en'?`${Math.floor(diff/86400)}d ago`:`${Math.floor(diff/86400)} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
  };

  const formatPage    = p => !p||p==='/'?bahasa==='en'?'Landing Page':'Halaman Utama':p==='/login'?'Login':p==='/register'?bahasa==='en'?'Register':'Daftar':p;
  const formatDevice  = d => !d?'-':d==='desktop'?bahasa==='en'?'Desktop':'Komputer':d==='mobile'?bahasa==='en'?'Mobile':'HP / Mobile':d==='tablet'?'Tablet':d;
  const formatCountry = c => { if(!c||c==='??') return bahasa==='en'?'Unknown':'Tidak Diketahui'; const m={ID:'Indonesia',US:'Amerika Serikat',SG:'Singapura',MY:'Malaysia',AU:'Australia',GB:'Inggris',JP:'Jepang',DE:'Jerman',NL:'Belanda',FR:'Prancis'}; return m[c]||c; };
  const flagEmoji     = c => { if(!c||c==='??') return '🌐'; try { return c.toUpperCase().replace(/./g,ch=>String.fromCodePoint(ch.charCodeAt(0)+127397)); } catch { return '🌐'; } };

  const lastPages  = Math.max(1, Math.ceil(vTotal/15));
  const harian     = vStats?.harian||[];
  const chartData  = harian;
  const maxH       = Math.max(...chartData.map(h=>h.count),1);
  const totalV     = vStats?.total??0;
  const todayCount = harian[harian.length-1]?.count??0;
  const avgPerDay  = harian.length?Math.round(harian.reduce((s,h)=>s+h.count,0)/harian.length):0;
  const durRows    = vTable.filter(r=>r.durationSec!=null);
  const avgDur     = durRows.length?Math.round(durRows.reduce((s,r)=>s+r.durationSec,0)/durRows.length):null;
  const avgDurLabel= avgDur==null?'-':avgDur>=60?`${Math.floor(avgDur/60)}m ${avgDur%60}s`:`${avgDur}s`;
  const lokasiValid= (vStats?.perNegara||[]).filter(n=>n.countryCode&&n.countryCode!=='??');

  const statCards = [
    { label:bahasa==='en'?'Total Visitors':'Total Pengunjung', val:totalV.toLocaleString(), sub:bahasa==='en'?'All time':'Semua waktu', gradient:'linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)', icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label:bahasa==='en'?'Today':'Hari Ini', val:todayCount.toLocaleString(), sub:bahasa==='en'?'Visits today':'Kunjungan hari ini', gradient:'linear-gradient(135deg,#059669 0%,#047857 100%)', icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label:bahasa==='en'?'Daily Average':'Rata-rata/Hari', val:avgPerDay.toLocaleString(), sub:bahasa==='en'?'Avg 7 days':'Rerata 7 hari', gradient:'linear-gradient(135deg,#D97706 0%,#B45309 100%)', icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { label:bahasa==='en'?'Avg Duration':'Durasi Rata-rata', val:avgDurLabel, sub:bahasa==='en'?'Time on page':'Waktu di halaman', gradient:'linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)', icon:<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ];

  // Line chart constants
  const VW=760, VH=270, PADL=36, PADR=12, PADT=20, PADB=44;
  const CW=VW-PADL-PADR, CH=VH-PADT-PADB;
  const pts = chartData.map((h,i)=>({
    x: PADL+(i/Math.max(chartData.length-1,1))*CW,
    y: PADT+CH-(h.count/maxH)*CH,
    count: h.count, label: h.label,
  }));
  const pathD = pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pts.length>1?`${pathD} L ${pts[pts.length-1].x} ${PADT+CH} L ${pts[0].x} ${PADT+CH} Z`:'';

  const periodeOpts = bahasa==='en'
    ?[['1hari','Today'],['7hari','7 Days']]
    :[['1hari','Hari Ini'],['7hari','7 Hari']];

  // Label hari pendek -> nama lengkap
  const hariLengkap = (label) => {
    const map = { 'Sen':'Senin','Sel':'Selasa','Rab':'Rabu','Kam':'Kamis','Jum':'Jumat','Sab':'Sabtu','Min':'Minggu', 'Mon':'Monday','Tue':'Tuesday','Wed':'Wednesday','Thu':'Thursday','Fri':'Friday','Sat':'Saturday','Sun':'Sunday' };
    return map[label] || label;
  };
  const peakDay    = chartData.length ? chartData.reduce((a,b)=>a.count>b.count?a:b) : null;
  const activeDay  = chartData.filter(h=>h.count>0).length;
  const totalDay   = chartData.length||7;
  // Perangkat dominan dari tabel
  const deviceCount = vTable.reduce((acc,r)=>{ if(r.deviceType) acc[r.deviceType]=(acc[r.deviceType]||0)+1; return acc; }, {});
  const dominanDevice = Object.entries(deviceCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
  const dominanLabel  = dominanDevice ? (bahasa==='en' ? (dominanDevice==='desktop'?'Desktop':dominanDevice==='mobile'?'Mobile':dominanDevice) : (dominanDevice==='desktop'?'Komputer':dominanDevice==='mobile'?'HP / Mobile':dominanDevice)) : '-';
  // Negara terbanyak dari lokasi valid
  const topNegara = lokasiValid.length ? lokasiValid[0] : null;
  const topNegaraLabel = topNegara ? formatCountry(topNegara.countryCode) : '-';

  const chartStats = [
    {
      label: bahasa==='en' ? 'Peak Traffic' : 'Puncak Traffic',
      val:   peakDay ? `${hariLengkap(peakDay.label)} · ${peakDay.count} ${bahasa==='en'?'visit':'kunjungan'}` : '-',
      valSmall: true,
      color: '#2563EB',
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
    {
      label: bahasa==='en' ? 'Active Rate' : 'Tingkat Aktif',
      val:   `${activeDay} / ${totalDay} ${bahasa==='en'?'days':'hari'}`,
      valSmall: true,
      sub:   `${totalDay ? Math.round((activeDay/totalDay)*100) : 0}% ${bahasa==='en'?'days had visitors':'hari ada pengunjung'}`,
      color: '#059669',
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    },
    {
      label: bahasa==='en' ? 'Top Device' : 'Perangkat Dominan',
      val:   dominanLabel,
      valSmall: false,
      sub:   dominanDevice ? `${deviceCount[dominanDevice]} ${bahasa==='en'?'sessions':'sesi'}` : (bahasa==='en'?'No data':'Belum ada'),
      color: '#D97706',
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    },
    {
      label: bahasa==='en' ? 'Top Country' : 'Negara Terbanyak',
      val:   topNegaraLabel,
      valSmall: topNegaraLabel.length > 10,
      sub:   topNegara ? `${topNegara._count.countryCode} ${bahasa==='en'?'visits':'kunjungan'}` : (bahasa==='en'?'No location data':'Data lokasi belum ada'),
      color: '#7C3AED',
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    },
  ];

  if (vLoading) return (
    <div style={{display:'flex',flexDirection:'column',gap:'18px',flex:1}}>
      <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,boxShadow:DK.cardShadow,padding:'18px 24px'}}>
        <p style={{fontSize:'20px',fontWeight:800,color:DK.text,margin:'0 0 4px'}}>{bahasa==='en'?'Visitor Log':'Log Pengunjung'}</p>
        <p style={{fontSize:'13px',color:DK.dimtext,margin:0}}>{bahasa==='en'?'Traffic data from visitors who gave analytics consent':'Data trafik pengunjung yang memberikan izin analitik'}</p>
      </div>
      <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,padding:'64px',textAlign:'center',color:DK.dimtext,flex:1}}>
        {bahasa==='en'?'Loading...':'Memuat...'}
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'18px',flex:1}}>

      {/* Header */}
      <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,boxShadow:DK.cardShadow,padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <p style={{fontSize:'20px',fontWeight:800,color:DK.text,margin:'0 0 4px'}}>{bahasa==='en'?'Visitor Log':'Log Pengunjung'}</p>
          <p style={{fontSize:'13px',color:DK.dimtext,margin:0}}>{bahasa==='en'?'Traffic data from visitors who gave analytics consent':'Data trafik pengunjung yang memberikan izin analitik'}</p>
        </div>
        <button onClick={handleCsvDownload} disabled={csvLoading}
          style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 18px',background:'#2563EB',border:'none',borderRadius:'12px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:csvLoading?'not-allowed':'pointer',fontFamily:'inherit',opacity:csvLoading?0.6:1,boxShadow:'0 2px 8px rgba(37,99,235,0.4)',transition:'opacity .15s'}}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {csvLoading?(bahasa==='en'?'Exporting...':'Mengekspor...'):(bahasa==='en'?'Export CSV':'Ekspor CSV')}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
        {statCards.map((s,i) => (
          <div key={i} style={{borderRadius:'16px',padding:'22px 24px',background:s.gradient,border:'2px solid rgba(0,0,0,0.2)',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'rgba(255,255,255,0.2)',border:'2px solid rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>{s.icon}</div>
              <span style={{fontSize:'11px',fontWeight:800,color:'#fff',letterSpacing:'0.3px',textTransform:'uppercase',textShadow:'0 1px 3px rgba(0,0,0,0.4)'}}>{s.label}</span>
            </div>
            <p style={{fontSize:'36px',fontWeight:800,color:'#fff',margin:0,lineHeight:1,letterSpacing:'-1px',textShadow:'0 2px 4px rgba(0,0,0,0.35)'}}>{s.val}</p>
            <p style={{fontSize:'13px',color:'#fff',margin:'8px 0 0',fontWeight:600,textShadow:'0 1px 3px rgba(0,0,0,0.35)'}}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABEL PENGUNJUNG — di atas chart ── */}
      <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,boxShadow:DK.cardShadow,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:DK.border,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <p style={{fontSize:'15px',fontWeight:800,color:DK.text,margin:0}}>
            {bahasa==='en'?'Visitor Log':'Tabel Pengunjung'}
            <span style={{marginLeft:'8px',fontSize:'12px',fontWeight:500,color:DK.dimtext}}>({vTotal.toLocaleString()} {bahasa==='en'?'records':'data'})</span>
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <button onClick={()=>setVPage(p=>Math.max(1,p-1))} disabled={vPage<=1||vTableLoading}
              style={{width:'32px',height:'32px',borderRadius:'10px',border:DK.border,background:'transparent',color:DK.text,cursor:vPage<=1?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:vPage<=1?0.3:1}}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <span style={{fontSize:'13px',color:DK.dimtext,padding:'0 8px',fontWeight:600}}>{vPage} / {lastPages}</span>
            <button onClick={()=>setVPage(p=>Math.min(lastPages,p+1))} disabled={vPage>=lastPages||vTableLoading}
              style={{width:'32px',height:'32px',borderRadius:'10px',border:DK.border,background:'transparent',color:DK.text,cursor:vPage>=lastPages?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:vPage>=lastPages?0.3:1}}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
            <thead>
              <tr style={{background:darkMode?'#1E293B':'#F8FAFC'}}>
                {['No',bahasa==='en'?'Device':'Perangkat',bahasa==='en'?'Country':'Negara',bahasa==='en'?'City':'Kota','Browser',bahasa==='en'?'Source':'Sumber',bahasa==='en'?'Duration':'Durasi',bahasa==='en'?'Time':'Waktu'].map(h => (
                  <th key={h} style={{padding:'11px 16px',textAlign:'left',fontWeight:700,color:DK.dimtext,borderBottom:DK.border,borderRight:DK.border,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vTableLoading?(
                <tr><td colSpan={8} style={{padding:'40px',textAlign:'center',color:DK.dimtext}}>{bahasa==='en'?'Loading...':'Memuat...'}</td></tr>
              ):vTable.length===0?(
                <tr><td colSpan={8} style={{padding:'40px',textAlign:'center',color:DK.dimtext}}>{bahasa==='en'?'No visitor data yet':'Belum ada data pengunjung'}</td></tr>
              ):vTable.map((row,i)=>(
                <tr key={row.id}
                  style={{borderBottom:DK.border,background:i%2===0?'transparent':(darkMode?'rgba(255,255,255,0.015)':'rgba(0,0,0,0.008)'),transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=darkMode?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'transparent':(darkMode?'rgba(255,255,255,0.015)':'rgba(0,0,0,0.008)')}>
                  <td style={{padding:'12px 16px',color:DK.dimtext,fontWeight:600,fontSize:'12px',borderRight:DK.border}}>{(vPage-1)*15+i+1}</td>
                  <td style={{padding:'12px 16px',borderRight:DK.border}}>
                    <span style={{background:darkMode?'#1E293B':'#F1F5F9',color:DK.dimtext,borderRadius:'8px',padding:'3px 10px',fontSize:'12px',fontWeight:600}}>{formatDevice(row.deviceType)}</span>
                  </td>
                  <td style={{padding:'12px 16px',borderRight:DK.border}}>
                    <span style={{
                      background: (!row.countryCode||row.countryCode==='??') ? 'transparent' : (darkMode ? '#1E3A5F' : '#EFF6FF'),
                      color:      (!row.countryCode||row.countryCode==='??') ? DK.dimtext : (darkMode ? '#FFFFFF' : '#2563EB'),
                      borderRadius:'8px', padding:'3px 10px', fontSize:'12px', fontWeight:600,
                      border: (!row.countryCode||row.countryCode==='??') ? `1px dashed ${darkMode?'#334155':'#CBD5E1'}` : `1px solid ${darkMode?'#2563EB':'#BFDBFE'}`,
                      display:'inline-block',
                    }}>
                      {formatCountry(row.countryCode)}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px',color:DK.text,fontSize:'12px',borderRight:DK.border}}>
                    {row.city||<span style={{color:darkMode?'#475569':'#CBD5E1'}}>-</span>}
                  </td>
                  <td style={{padding:'12px 16px',borderRight:DK.border}}>
                    {row.browserName?<span style={{background:darkMode?'#1E293B':'#F1F5F9',color:DK.dimtext,borderRadius:'8px',padding:'3px 8px',fontSize:'12px',fontWeight:600}}>{row.browserName}</span>:<span style={{color:darkMode?'#475569':'#CBD5E1',fontSize:'12px'}}>-</span>}
                  </td>

                  <td style={{padding:'12px 16px',color:DK.dimtext,fontSize:'12px',borderRight:DK.border,maxWidth:'130px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {row.referrer?<a href={row.referrer} target="_blank" rel="noopener noreferrer" style={{color:'#2563EB',fontSize:'12px',textDecoration:'none'}}>{row.referrer.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]}</a>:<span style={{color:darkMode?'#475569':'#CBD5E1'}}>Direct</span>}
                  </td>
                  <td style={{padding:'12px 16px',color:DK.text,fontWeight:500,borderRight:DK.border}}>
                    {row.durationSec!=null
                      ? row.durationSec>=60
                        ? `${Math.floor(row.durationSec/60)}m ${row.durationSec%60}s`
                        : <span style={{color:darkMode?'#94A3B8':'#64748B',fontSize:'12px',fontStyle:'italic'}}>{bahasa==='en'?'<60 second':'<60 detik'}</span>
                      : <span style={{color:darkMode?'#475569':'#CBD5E1',fontSize:'12px'}}>-</span>}
                  </td>
                  <td style={{padding:'12px 16px',whiteSpace:'nowrap'}}>
                    <span style={{color:DK.text,fontWeight:500}}>{relativeTime(row.createdAt,bahasa)}</span>
                    <span style={{display:'block',fontSize:'11px',color:DK.dimtext,marginTop:'1px'}}>{new Date(row.createdAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHART — di bawah tabel, split 65% kiri + 35% kanan ── */}
      <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,boxShadow:DK.cardShadow,overflow:'hidden'}}>
        {/* Header chart */}
        <div style={{padding:'14px 18px',borderBottom:DK.border,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
          <div>
            <p style={{fontSize:'13px',fontWeight:800,color:DK.text,margin:0}}>{bahasa==='en'?'Visitor Activity':'Aktivitas Pengunjung'}</p>
            <p style={{fontSize:'11px',color:DK.dimtext,margin:'2px 0 0'}}>{bahasa==='en'?'Traffic trend over time':'Tren trafik dari waktu ke waktu'}</p>
          </div>
          <div style={{position:'relative'}}>
            <select value={chartPeriode} onChange={e=>setChartPeriode(e.target.value)}
              style={{padding:'5px 28px 5px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:600,cursor:'pointer',border:`1.5px solid ${darkMode?'#475569':'#CBD5E1'}`,background:DK.surface,color:DK.text,fontFamily:'inherit',appearance:'none',outline:'none'}}>
              {periodeOpts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
            <svg style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={DK.dimtext} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* Split body: 65% chart kiri | divider | 35% ringkasan kanan */}
        <div style={{display:'flex',alignItems:'stretch',minHeight:'360px'}}>

          {/* Chart kiri 65% */}
          <div style={{flex:'0 0 65%',padding:'16px 12px 16px 20px',borderRight:DK.border,minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            {chartData.length===0?(
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#94A3B8',fontSize:'13px'}}>
                {bahasa==='en'?'No data yet':'Belum ada data'}
              </div>
            ):(
              <svg viewBox={`0 0 ${VW} ${VH+10}`} width="100%" style={{display:'block',flex:1}}>
                <defs>
                  <linearGradient id="vSplitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22"/>
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {/* Grid horizontal */}
                {[0,25,50,75,100].map(pct=>{
                  const y=PADT+CH-(pct/100)*CH, val=Math.round((maxH*pct)/100);
                  return (<g key={pct}>
                    <line x1={PADL} y1={y} x2={VW-PADR} y2={y} stroke={darkMode?'#334155':'#E2E8F0'} strokeWidth="1" strokeDasharray={pct===0?'none':'4 3'}/>
                    <text x={PADL-6} y={y+4} textAnchor="end" fontSize="11" fill={darkMode?'#94A3B8':'#374151'} fontFamily="-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif">{val}</text>
                  </g>);
                })}
                {/* Grid vertikal */}
                {pts.map((p,i)=><line key={`vg${i}`} x1={p.x} y1={PADT} x2={p.x} y2={PADT+CH} stroke={darkMode?'#334155':'#E2E8F0'} strokeWidth="1" strokeDasharray="4 3"/>)}
                {/* Area */}
                {areaD&&<path d={areaD} fill="url(#vSplitGrad)"/>}
                {/* Garis */}
                <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                {/* Titik + label */}
                {pts.map((p,i)=>(
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#2563EB" stroke={darkMode?'#1E293B':'#fff'} strokeWidth="2.5"/>
                    {p.count>0&&<text x={p.x} y={p.y-12} textAnchor="middle" fontSize="12" fontWeight="800" fill={darkMode?'#F1F5F9':'#1E293B'} fontFamily="-apple-system,sans-serif">{p.count}</text>}
                    <text x={p.x} y={PADT+CH+18} textAnchor="middle" fontSize="11" fill={darkMode?'#94A3B8':'#475569'} fontFamily="-apple-system,sans-serif">{p.label}</text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* Ringkasan kanan 35% */}
          <div style={{flex:'0 0 35%',padding:'24px 20px',display:'flex',flexDirection:'column',gap:'10px',justifyContent:'center'}}>
            <p style={{fontSize:'11px',fontWeight:700,color:DK.dimtext,textTransform:'uppercase',letterSpacing:'0.8px',margin:'0 0 10px'}}>{bahasa==='en'?'Summary':'Ringkasan'}</p>
            {chartStats.map((s,i)=>(
              <div key={i} style={{background:darkMode?'rgba(255,255,255,0.04)':'#F8FAFC',borderRadius:'12px',padding:'12px 14px',border:DK.border}}>
                <p style={{fontSize:'10px',fontWeight:700,color:DK.dimtext,margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</p>
                <p style={{fontSize:'14px',fontWeight:700,color:DK.text,margin:0,lineHeight:1.3}}>{s.val}</p>
                {s.sub && <p style={{fontSize:'11px',color:DK.dimtext,margin:'3px 0 0'}}>{s.sub}</p>}
              </div>
            ))}
            <p style={{fontSize:'11px',color:DK.dimtext,margin:'6px 0 0',lineHeight:1.5}}>
              {bahasa==='en'
                ?'Only visitors who accepted analytics cookies are tracked.'
                :'Hanya pengunjung yang menyetujui cookie analitik yang tercatat.'}
            </p>
          </div>

        </div>
      </div>

      {/* Lokasi — hanya tampil kalau ada data valid */}
      {lokasiValid.length>0&&(
        <div style={{background:DK.surface,borderRadius:'16px',border:DK.border,boxShadow:DK.cardShadow,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:DK.border}}>
            <p style={{fontSize:'13px',fontWeight:800,color:DK.text,margin:0}}>{bahasa==='en'?'Visitor Locations':'Lokasi Pengunjung'}</p>
            <p style={{fontSize:'11px',color:DK.dimtext,margin:'2px 0 0'}}>{bahasa==='en'?'Countries of origin':'Negara asal pengunjung'}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column'}}>
            {lokasiValid.map((n,i)=>{
              const total=vStats.total||1, cnt=n._count.countryCode, pct=Math.round((cnt/total)*100);
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 18px',borderBottom:i===lokasiValid.length-1?'none':DK.border}}>
                  <span style={{fontSize:'11px',fontWeight:800,color:'#fff',background:'#2563EB',borderRadius:'6px',padding:'3px 7px',flexShrink:0,letterSpacing:'0.5px'}}>{n.countryCode}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                      <span style={{fontSize:'13px',fontWeight:700,color:DK.text}}>{formatCountry(n.countryCode)}</span>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <span style={{fontSize:'13px',fontWeight:700,color:DK.text}}>{cnt}</span>
                        <span style={{fontSize:'12px',fontWeight:700,color:'#2563EB',minWidth:'38px',textAlign:'right'}}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{height:'6px',background:darkMode?'#1E293B':'#F1F5F9',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{width:`${Math.max(pct,2)}%`,height:'100%',background:'linear-gradient(90deg,#3B82F6,#2563EB)',borderRadius:'3px',transition:'width .5s'}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardAdminPage() {
  const { user, setUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [navHistory, setNavHistory] = useState([]); // untuk back button
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState(null);
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifData, setNotifData] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [highlightLaporanId, setHighlightLaporanId] = useState(null);

  // Navigate dengan history — pakai ini untuk semua perpindahan halaman
  const navTo = (nav) => {
    setNavHistory(prev => [...prev.slice(-9), activeNav]); // max 10 history
    setActiveNav(nav);
  };
  const goBack = () => {
    if (navHistory.length === 0) return;
    const prev = navHistory[navHistory.length - 1];
    setNavHistory(h => h.slice(0, -1));
    setActiveNav(prev);
  };
  const [notifDeleteConfirm, setNotifDeleteConfirm] = useState(null); // notif object to confirm delete

  // Pengaturan state — HARUS di atas loadNotif karena dipakai di sana
  const [notifSettings, setNotifSettings] = useState(() => {
    try { const s = localStorage.getItem("laporku_notif_settings"); return s ? JSON.parse(s) : [true, false, true]; } catch { return [true, false, true]; }
  });
  const [keamananSettings, setKeamananSettings] = useState(() => {
    try { const s = localStorage.getItem("laporku_keamanan_settings"); return s ? JSON.parse(s) : [true, false, true]; } catch { return [true, false, true]; }
  });
  const [laporanPerHalaman, setLaporanPerHalaman] = useState("20");
  const [formatTanggal, setFormatTanggal] = useState("DD/MM/YYYY");
  const [tampilAvatar, setTampilAvatar] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(
    () => localStorage.getItem("laporku_browser_notif") === "true" ||
      (typeof Notification !== "undefined" && Notification.permission === "granted")
  );
  const [autoRefresh, setAutoRefresh] = useState(
    () => localStorage.getItem("laporku_autorefresh") !== "false"
  );
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivasiModal, setShowPrivasiModal] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Dark mode & bahasa — load dari localStorage agar persist
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("laporku_dark") === "true",
  );
  const [aktivitasPeriode, setAktivitasPeriode] = useState("7hari");
  const [bahasa, setBahasa] = useState(
    () => localStorage.getItem("laporku_lang") || "id",
  );

  // Refs untuk akses nilai terbaru di dalam interval/timeout tanpa re-render issue
  const notifSettingsRef = React.useRef(notifSettings);
  const keamananSettingsRef = React.useRef(keamananSettings);
  React.useEffect(() => {
    notifSettingsRef.current = notifSettings;
    localStorage.setItem("laporku_notif_settings", JSON.stringify(notifSettings));
  }, [notifSettings]);
  React.useEffect(() => {
    keamananSettingsRef.current = keamananSettings;
    localStorage.setItem("laporku_keamanan_settings", JSON.stringify(keamananSettings));
  }, [keamananSettings]);

  const loadNotif = async () => {
    try {
      const res = await notifikasiService.getAll();
      const newData = res.data.data || [];
      const newUnread = res.data.unread || 0;
      const s = notifSettingsRef.current;

      // ── Real browser notification for new laporan ──────────────
      setNotifData((prev) => {
        const prevIds = new Set(prev.map((n) => n.id));
        const fresh = newData.filter((n) => !prevIds.has(n.id) && !n.dibaca);

        if (fresh.length > 0 && s[0]) {
          if (Notification.permission === "granted") {
            fresh.forEach((n) => {
              new Notification("LaporKu — Notifikasi Baru", {
                body: n.pesan,
                icon: "/favicon.ico",
                tag: n.id,
              });
            });
          } else if (Notification.permission === "default") {
            Notification.requestPermission();
          }
        }
        return newData;
      });

      // ── Alert laporan menumpuk: jika menunggu > 10 ─────────────
      if (s[2]) {
        laporanService
          .getStats()
          .then((r) => {
            const menunggu = r.data.data?.menunggu || 0;
            if (menunggu > 10 && Notification.permission === "granted") {
              new Notification("LaporKu — Alert Menumpuk!", {
                body: `Ada ${menunggu} laporan menunggu yang belum ditangani!`,
                icon: "/favicon.ico",
                tag: "menumpuk",
              });
            }
          })
          .catch(() => {});
      }

      setNotifUnread(newUnread);
    } catch {}
  };

  // Poll notif every 30s for badge update + real notifications — respects autoRefresh setting
  useEffect(() => {
    loadNotif();
    if (!autoRefresh) return;
    const t = setInterval(loadNotif, 30000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  // ── Idle timer: auto logout setelah 30 menit idle ──────────────
  useEffect(() => {
    // Hanya aktif jika keamananSettings[0] === true
    if (!keamananSettings[0]) return;

    let idleTimer = null;
    const IDLE_MS = 30 * 60 * 1000; // 30 menit

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        // Auto logout
        try {
          await authService.logout();
        } catch (_) {}
        setUser(null);
        sessionStorage.clear();
        navigate("/login");
      }, IDLE_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, resetTimer, { passive: true }),
    );
    resetTimer(); // start timer immediately

    return () => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keamananSettings[0]]);

  // ── Global date formatter — respects formatTanggal setting ────
  const fmtDate = (d, opts) => {
    const date = new Date(d);
    if (opts) return date.toLocaleDateString("id-ID", opts);
    // Default: show full date formatted per setting
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = date.getFullYear();
    const MONTHS_ID = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const MONTHS_EN = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const mon =
      bahasa === "en" ? MONTHS_EN[date.getMonth()] : MONTHS_ID[date.getMonth()];
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    if (formatTanggal === "MM/DD/YYYY") return `${mm}/${dd}/${yy}, ${hh}:${min}`;
    return `${dd} ${mon} ${yy}, ${hh}:${min}`;
  };

  // Terjemahan (id / en)
  const T = {
    id: {
      pengaturanSistem: "Pengaturan Sistem",
      konfigurasiAplikasi: "Konfigurasi aplikasi LaporKu",
      notifikasi: "Notifikasi",
      konfigurasiNotif: "Konfigurasi pemberitahuan sistem",
      keamanan: "Keamanan",
      pengaturanKeamanan: "Pengaturan keamanan akun admin",
      tampilan: "Tampilan",
      preferensiUI: "Preferensi antarmuka dashboard",
      tentangSistem: "Tentang Sistem",
      infoVersi: "Informasi versi dan aplikasi",
      modeTema: "Mode & Bahasa",
      pengaturanTema: "Tampilan tema & bahasa antarmuka",
      modeLightLabel: "Mode Terang",
      modeDarkLabel: "Mode Gelap",
      bahasaIndo: "Indonesia",
      bahasaInggris: "English",
      modeSaatIni: "Mode saat ini",
      bahasaAktif: "Bahasa aktif",
      notifLaporan: "Notifikasi laporan baru",
      notifLaporanSub: "Admin mendapat notif saat ada laporan masuk",
      notifEmail: "Email ringkasan harian",
      notifEmailSub: "Kirim ringkasan laporan setiap pagi",
      notifAlert: "Alert laporan menumpuk",
      notifAlertSub: "Peringatan jika laporan menunggu > 10",
      sesiOtomatis: "Sesi otomatis berakhir",
      sesiOtomatisSub: "Logout otomatis setelah tidak aktif 30 menit",
      loginSatu: "Login hanya satu perangkat",
      loginSatuSub: "Sesi lama akan berakhir saat login baru",
      logAktivitas: "Catat log aktivitas admin",
      logAktivitasSub: "Simpan histori tindakan admin",
      jmlPerHalaman: "Jumlah laporan per halaman",
      formatTanggalLabel: "Format tanggal",
      tampilAvatar: "Tampilkan avatar pengguna",
      tampilAvatarSub: "Tampilkan foto profil di tabel laporan",
      aksesPermanen: "Akses cepat",
      gelap: "Gelap",
      terang: "Terang",
      totalLaporan:"Total Laporan",
semuaWaktu:"semua waktu",
      bahasa:"id",

tingkatSelesai:"Tingkat Selesai",
dariTotal:"dari total laporan",

laporanHariIni:"Laporan Hari Ini",
masukHariIni:"masuk hari ini",

totalPengguna:"Total Pengguna",
akunTerdaftar:"akun terdaftar",
dashboard:"Dashboard",
laporan:"Laporan",
pengguna:"Pengguna",
pengaturan:"Pengaturan",
profil:"Profil",

menuUtama:"Menu Utama",

statistik:"Statistik",
aktivitasTerbaru:"Aktivitas Terbaru",

lihatSemua:"Lihat Semua",
cari:"Cari...",

      // Dashboard cards
      semuaLaporan:"semua laporan masuk",
      penggunaTerdaftar:"pengguna terdaftar",
      masukHariIni2:"masuk hari ini",
      dariLaporan2:(s,tot)=>`${s} dari ${tot} laporan`,
      perluAksi:"perlu aksi segera",
      sedangDitangani:"sedang ditangani",
      berhasilSelesai:"berhasil diselesaikan",
      tidakDapat:"tidak dapat diproses",
      menungguLabel:"Menunggu",
      diprosesLabel:"Diproses",
      selesaiLabel:"Selesai",
      ditolakLabel:"Ditolak",
      totalLaporanLabel:"Total Laporan",
      totalPenggunaLabel:"Total Pengguna",
      laporanHariIniLabel:"Laporan Hari Ini",
      tingkatSelesaiLabel:"Tingkat Selesai",
      ringkasanStatus:"Ringkasan Status Laporan",
      ringkasanSub:"Perbandingan laporan berdasarkan status",
      totalLaporanDonut:"Total Laporan",
      laporanTerbaru:"Laporan Masuk Terbaru",
      laporanTerbaruSub:"Pantauan laporan yang baru diterima",
      lihatSemua2:"Lihat Semua",
      menungguTerlama:"Menunggu Terlama",
      menungguTerlamaCount:(n)=>`${n} laporan menunggu`,
      hariIni:"Hari ini",
      hariLabel:"hari",
      menungguTerlamaSub:"Perlu segera ditangani",
      jumlahLaporan:"Jumlah Laporan",
      periodeWaktu:"Periode Waktu",
      aktivitasLaporan:"Aktivitas Laporan Masuk",
      trendSub:"Tren laporan masuk berdasarkan periode",
      distribusiStatus:"Distribusi Status",
      distribusiSub:"Perbandingan status laporan",
      belumAda:"Belum ada data",
      topKategori5:"5 kategori laporan terbanyak",
      dataRealtime:"Data real-time",
      analitikJudul:"Analitik Laporan",
      analitikSub:"Ringkasan performa & statistik laporan masuk",
      // Profil
      dataProfil:"Data Profil",
keamananAkun:"Keamanan Akun",
perbarui:"Perbarui informasi pribadi Anda",
kelolaSandi:"Kelola password dan keamanan akun",
nama:"Nama Lengkap",
telepon:"No. Telepon",
nomorHint:"Nomor yang dapat dihubungi",
tidakUbah:"Tidak dapat diubah",
infoAkun:"Informasi Akun",
statusAkun:"Status Akun",
simpanProfil:"Simpan Perubahan",
sandiSaatIni:"Password Saat Ini",
sandiBaru:"Password Baru",
sandiBaru8:"Minimal 8 karakter",
konfirmasiSandi:"Konfirmasi Password Baru",
ulangiSandi:"Ulangi password baru",
perbaruiSandi:"Perbarui Password",
perhatian:"Perhatian",
peringatanSandi:"Setelah password diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang.",
    },
    en: {
      pengaturanSistem: "System Settings",
      konfigurasiAplikasi: "LaporKu application configuration",
      notifikasi: "Notifications",
      konfigurasiNotif: "Configure system notifications",
      keamanan: "Security",
      pengaturanKeamanan: "Admin account security settings",
      tampilan: "Display",
      preferensiUI: "Dashboard interface preferences",
      tentangSistem: "About System",
      infoVersi: "Version and application information",
      modeTema: "Theme & Language",
      pengaturanTema: "Interface theme & language settings",
      modeLightLabel: "Light Mode",
      modeDarkLabel: "Dark Mode",
      bahasaIndo: "Indonesian",
      bahasaInggris: "English",
      modeSaatIni: "Current mode",
      bahasaAktif: "Active language",
      notifLaporan: "New report notification",
      notifLaporanSub: "Admin gets notified when a new report arrives",
      notifEmail: "Daily email summary",
      notifEmailSub: "Send daily report summary every morning",
      notifAlert: "Report backlog alert",
      notifAlertSub: "Warning if waiting reports exceed 10",
      sesiOtomatis: "Auto session expiry",
      sesiOtomatisSub: "Auto logout after 30 minutes of inactivity",
      loginSatu: "Single device login",
      loginSatuSub: "Old session ends when new login occurs",
      logAktivitas: "Log admin activity",
      logAktivitasSub: "Save admin action history",
      jmlPerHalaman: "Reports per page",
      formatTanggalLabel: "Date format",
      tampilAvatar: "Show user avatars",
      tampilAvatarSub: "Display profile photos in the report table",
      aksesPermanen: "Quick access",
      gelap: "Dark",
      terang: "Light",
totalLaporan:"Total Reports",
semuaWaktu:"all time",
      bahasa:"en",

tingkatSelesai:"Completion Rate",
dariTotal:"from total reports",

laporanHariIni:"Today's Reports",
masukHariIni:"received today",

totalPengguna:"Total Users",
akunTerdaftar:"registered accounts",
dashboard:"Dashboard",
laporan:"Reports",
pengguna:"Users",
pengaturan:"Settings",
profil:"Profile",

menuUtama:"Main Menu",

statistik:"Statistics",
aktivitasTerbaru:"Recent Activity",

lihatSemua:"View All",
cari:"Search...",

      // Dashboard cards
      semuaLaporan:"all reports received",
      penggunaTerdaftar:"registered users",
      masukHariIni2:"received today",
      dariLaporan2:(s,tot)=>`${s} of ${tot} reports`,
      perluAksi:"needs immediate action",
      sedangDitangani:"being processed",
      berhasilSelesai:"successfully resolved",
      tidakDapat:"could not be processed",
      menungguLabel:"Pending",
      diprosesLabel:"In Progress",
      selesaiLabel:"Resolved",
      ditolakLabel:"Rejected",
      totalLaporanLabel:"Total Reports",
      totalPenggunaLabel:"Total Users",
      laporanHariIniLabel:"Today's Reports",
      tingkatSelesaiLabel:"Completion Rate",
      ringkasanStatus:"Report Status Summary",
      ringkasanSub:"Comparison of reports by status",
      totalLaporanDonut:"Total Reports",
      laporanTerbaru:"Latest Reports",
      laporanTerbaruSub:"Monitoring newly received reports",
      lihatSemua2:"View All",
      menungguTerlama:"Longest Waiting",
      menungguTerlamaCount:(n)=>`${n} waiting report${n!==1?"s":""}`,
      hariIni:"Today",
      hariLabel:"days",
      menungguTerlamaSub:"Needs immediate attention",
      jumlahLaporan:"Number of Reports",
      periodeWaktu:"Time Period",
      aktivitasLaporan:"Report Activity",
      trendSub:"Report trend by period",
      distribusiStatus:"Status Distribution",
      distribusiSub:"Comparison of report status",
      belumAda:"No data yet",
      topKategori5:"Top 5 report categories",
      dataRealtime:"Real-time data",
      analitikJudul:"Report Analytics",
      analitikSub:"Performance summary & incoming report statistics",
      // Profil
      dataProfil:"Profile Data",
keamananAkun:"Account Security",
perbarui:"Update your personal information",
kelolaSandi:"Manage your password and account security",
nama:"Full Name",
telepon:"Phone Number",
nomorHint:"Contact number",
tidakUbah:"Cannot be changed",
infoAkun:"Account Information",
statusAkun:"Account Status",
simpanProfil:"Save Changes",
sandiSaatIni:"Current Password",
sandiBaru:"New Password",
sandiBaru8:"Minimum 8 characters",
konfirmasiSandi:"Confirm New Password",
ulangiSandi:"Re-enter new password",
perbaruiSandi:"Update Password",
perhatian:"Warning",
peringatanSandi:"After updating your password, all active sessions will end and you will need to log in again.",
    },
  };
  const t = T[bahasa];

  const handleToggleDark = (val) => {
    setDarkMode(val);
    localStorage.setItem("laporku_dark", String(val));
  };
  const handleBahasa = (lang) => {
    setBahasa(lang);
    localStorage.setItem("laporku_lang", lang);
  };

  // CSS vars untuk dark mode — inject ke :root
  const DK = darkMode
    ? {
        bg: "#0F172A",
        surface: "#1E293B",
        surfaceHover: "#273449",
        border: "1px solid #334155",
        text: "#F1F5F9",
        subtext: "#94A3B8",
        dimtext: "#64748B",
        inputBg: "#1E293B",
        inputBorder: "#334155",
        cardShadow: "0 2px 8px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)",
        headerBg: "#1E293B",
        sidebarBg: "#070D1A",
      }
    : {
        bg: "#F1F5F9",
        surface: "#fff",
        surfaceHover: "#F8FAFC",
        border: "1px solid #030c1769",
        text: "#0F172A",
        subtext: "#374151",
        dimtext: "#64748B",
        inputBg: "#fff",
        inputBorder: "#CBD5E1",
        cardShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        headerBg: "#fff",
        sidebarBg: "#0F172A",
      };

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const statusChartRef = useRef(null);
  const statusChartInst = useRef(null);

  useEffect(() => {
    const shown = sessionStorage.getItem("loginToastShown");
    if (!shown) {
      setAlert({
        type: "success",
        title: "Login Berhasil!",
        message: `Selamat datang, ${user?.nama || "Admin"}! Anda berhasil masuk sebagai Administrator.`,
      });
      sessionStorage.setItem("loginToastShown", "1");
    }
  }, []);

  useEffect(() => {
    if (activeNav !== "dashboard" && activeNav !== "analitik") return;
    laporanService
      .getStats()
      .then((r) => setStats(r.data.data))
      .catch(() => {});
    // Fetch raw laporan untuk filter periode chart
    laporanService
      .getAdmin({})
      .then((r) =>
        setStats((prev) =>
          prev
            ? { ...prev, rawLaporan: r.data.data }
            : { rawLaporan: r.data.data },
        ),
      )
      .catch(() => {});
  }, [activeNav]);

  useEffect(() => {
    if (!stats?.aktivitas || activeNav !== "dashboard") return;
    const loadChart = () => {
      if (!window.Chart || !chartRef.current) return;
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: stats.aktivitas.map((a) => a.label),
          datasets: [
            {
              label: "Laporan",
              data: stats.aktivitas.map((a) => a.count),
              backgroundColor: stats.aktivitas.map((_, i) =>
                i >= 5 ? "#CBD5E1" : "#2563EB",
              ),
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          clip: false,
          layout: { padding: { top: 20, right: 8 } },
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: { size: 11 },
                color: darkMode ? "#94A3B8" : "#374151",
              },
              grid: { color: darkMode ? "#1E293B" : "#F1F5F9" },
            },
            x: {
              ticks: {
                font: { size: 11 },
                color: darkMode ? "#94A3B8" : "#374151",
              },
              grid: { display: false },
            },
          },
        },
      });
    };
    if (window.Chart) {
      loadChart();
    } else {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      s.onload = loadChart;
      document.head.appendChild(s);
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [stats, activeNav, darkMode]);

  useEffect(() => {
    if (!stats || activeNav !== "dashboard") return;
    const loadStatusChart = () => {
      if (!window.Chart || !statusChartRef.current) return;
      if (statusChartInst.current) {
        statusChartInst.current.destroy();
      }
      statusChartInst.current = new window.Chart(statusChartRef.current, {
        type: "bar",
        data: {
          labels: ["Menunggu", "Diproses", "Selesai", "Ditolak"],
          datasets: [
            {
              data: [
                stats.menunggu,
                stats.diproses,
                stats.selesai,
                stats.ditolak,
              ],
              backgroundColor: ["#F59E0B", "#7C3AED", "#10B981", "#EF4444"],
              borderRadius: 8,
              borderSkipped: false,
              barThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.raw} laporan`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: { size: 11, family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" },
                color: darkMode ? "#94A3B8" : "#374151",
              },
              grid: { color: darkMode ? "#1E293B" : "#F1F5F9" },
              border: { display: false },
            },
            x: {
              ticks: {
                font: {
                  size: 12,
                  weight: "600",
                  family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                },
                color: darkMode ? "#94A3B8" : "#374151",
              },
              grid: { display: false },
              border: { display: false },
            },
          },
        },
      });
    };
    if (window.Chart) {
      loadStatusChart();
    } else {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      s.onload = loadStatusChart;
      document.head.appendChild(s);
    }
    return () => {
      if (statusChartInst.current) {
        statusChartInst.current.destroy();
        statusChartInst.current = null;
      }
    };
  }, [stats, activeNav, darkMode]);

  const showAlert = (alertData) => setAlert(alertData);

  const initials = user?.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    setUser(null);
    sessionStorage.clear(); // clear semua session termasuk appSessionStarted
    navigate("/login");
  };

  const navLabelsForTitle = {
    dashboard:   bahasa === "en" ? "Dashboard"        : "Dashboard",
    kategori:    bahasa === "en" ? "Categories"       : "Kelola Kategori",
    laporan:     bahasa === "en" ? "Reports"          : "Laporan",
    pengguna:    bahasa === "en" ? "Users"            : "Pengguna",
    analitik:    bahasa === "en" ? "Analytics"        : "Analitik",
    notifikasi:  bahasa === "en" ? "Notifications"    : "Notifikasi",
    pengaturan:  bahasa === "en" ? "Settings"         : "Pengaturan",
    pengunjung:  bahasa === "en" ? "Visitor Log"      : "Log Pengunjung",
    profil:      bahasa === "en" ? "Profile"          : "Profil",
  };
  const pageTitle = navLabelsForTitle[activeNav] || NAV.find((n) => n.id === activeNav)?.label || "Dashboard";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: DK.bg,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        transition: "background 0.3s, color 0.3s",
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
          cancelLabel={bahasa === "en" ? "Cancel" : "Batal"}
          darkMode={darkMode}
        />
      )}

      <ConfirmDialog
        dialog={
          confirmLogout
            ? {
                title: bahasa === "en" ? "Sign out?" : "Keluar dari akun?",
                message:
                  bahasa === "en"
                    ? "Your session will end and you will be redirected to login."
                    : "Sesi Anda akan diakhiri dan diarahkan ke halaman login.",
              }
            : null
        }
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        bahasa={bahasa}
        darkMode={darkMode}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: sidebarOpen ? "285px" : "60px",
          minHeight: "100vh",
          background: DK.sidebarBg,
          display: "flex",
          flexDirection: "column",
          transition: "width .28s cubic-bezier(.4,0,.2,1)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          borderRight: "none",
          boxShadow: "1px 0 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo — height 110px, container 100px agar pas */}
        <div
          style={{
            padding: sidebarOpen ? "0 18px" : "18px 10px",
            borderBottom: B,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            minHeight: "100px",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {sidebarOpen ? (
            <img
              src={logoDark}
              alt="LaporKu"
              style={{ height: "110px", width: "auto", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #334155",
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth={2.5}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
          )}

        </div>

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
            {t.menuUtama}
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
          {NAV.map((item) => {
            const isActive = activeNav === item.id;
            // Nav label translations
            const navLabels = {
              dashboard: bahasa === "en" ? "Dashboard" : "Dashboard",
              kategori: bahasa === "en" ? "Categories" : "Kelola Kategori",
              laporan: bahasa === "en" ? "Reports" : "Laporan",
              pengguna: bahasa === "en" ? "Users" : "Pengguna",
              analitik: bahasa === "en" ? "Analytics" : "Analitik",
              notifikasi: bahasa === "en" ? "Notifications" : "Notifikasi",
              pengaturan: bahasa === "en" ? "Settings" : "Pengaturan",
              pengunjung: bahasa === "en" ? "Visitor Log" : "Log Pengunjung",
            };
            const displayLabel = navLabels[item.id] || item.label;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navTo(item.id);
                  if (item.id === "notifikasi") loadNotif();
                }}
                title={!sidebarOpen ? item.label : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: sidebarOpen ? "9px 10px" : "10px",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: "10px",
                  border: isActive
                    ? "1.5px solid #3B82F6"
                    : "1.5px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive ? "rgba(37,99,235,0.9)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 400,
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
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
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {displayLabel}
                  </span>
                )}
                {sidebarOpen && item.badge && notifUnread > 0 && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#fff",
                      background: "#EF4444",
                      borderRadius: "99px",
                      padding: "1px 6px",
                      flexShrink: 0,
                      lineHeight: "16px",
                      minWidth: "16px",
                      textAlign: "center",
                    }}
                  >
                    {notifUnread > 99 ? "99+" : notifUnread}
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
                  {user?.nama || "Admin"}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.3)",
                    margin: 0,
                  }}
                >
                  Administrator
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
              borderRadius: "10px",
              border: "1.5px solid transparent",
              cursor: "pointer",
              background: "transparent",
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              fontWeight: 400,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
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
        {/* Header — height 64px, border bawah lebih tebal & turun */}
        <header
          style={{
            background: DK.headerBg,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: darkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: darkMode
              ? "0 4px 6px -2px rgba(0,0,0,0.4)"
              : "0 4px 6px -2px rgba(3,12,23,0.08)",
            transition: "background 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Back button — hanya muncul kalau ada history */}
            {navHistory.length > 0 && (
              <button
                onClick={goBack}
                title="Kembali"
                style={{
                  background: darkMode ? "#1E293B" : "#F1F5F9",
                  border: DK.border,
                  borderRadius: "10px",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  color: darkMode ? "#94A3B8" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? "#334155" : "#E2E8F0";
                  e.currentTarget.style.color = darkMode ? "#F1F5F9" : "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? "#1E293B" : "#F1F5F9";
                  e.currentTarget.style.color = darkMode ? "#94A3B8" : "#475569";
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: darkMode ? "#64748B" : "#94A3B8",
                  fontWeight: 500,
                }}
              >
                LaporKu
              </span>
              <svg
                width="12"
                height="12"
                fill="none"
                viewBox="0 0 24 24"
                stroke={darkMode ? "#475569" : "#CBD5E1"}
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
              onClick={() => {
                navTo("notifikasi");
                loadNotif();
              }}
              style={{
                position: "relative",
                background: darkMode ? "#1E293B" : "#F8FAFC",
                border: darkMode ? "1px solid #334155" : B,
                borderRadius: "10px",
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
                e.currentTarget.style.background = darkMode
                  ? "#273449"
                  : "#FEF3C7";
                e.currentTarget.style.boxShadow = "none";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode
                  ? "#1E293B"
                  : "#F8FAFC";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(15,23,42,0.08)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  fill="#FBBF24"
                  stroke="#FBBF24"
                  strokeWidth="1"
                />
              </svg>
              {notifUnread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    minWidth: "16px",
                    height: "16px",
                    background: "#EF4444",
                    borderRadius: "99px",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1,
                    padding: "0 3px",
                  }}
                >
                  {notifUnread > 99 ? "99+" : notifUnread}
                </span>
              )}
            </button>
            <ProfileDropdown
              user={user}
              initials={initials}
              onEditProfil={() => navTo("profil")}
              onPengaturan={() => navTo("pengaturan")}
              onLogout={() => setConfirmLogout(true)}
              darkMode={darkMode}
              DK={DK}
              bahasa={bahasa}
            />
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            padding: "22px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            background: DK.bg,
            transition: "background 0.3s",
          }}
        >
          {activeNav === "profil" && (
            <ProfilContent
              user={user}
              setUser={setUser}
              refreshUser={refreshUser}
              onBack={() => goBack()}
              showAlert={showAlert}
              darkMode={darkMode}
              DK={DK}
              bahasa={bahasa}
              t={t}
            />
          )}

          {activeNav === "kategori" && (
            <KategoriContent
              onBack={() => goBack()}
              showAlert={showAlert}
              darkMode={darkMode}
              DK={DK}
              bahasa={bahasa}
            />
          )}

          {activeNav === "laporan" && (
            <LaporanAdminPage
              onBack={() => goBack()}
              showAlert={showAlert}
              highlightId={highlightLaporanId}
              onHighlightConsumed={() => setHighlightLaporanId(null)}
              darkMode={darkMode}
              DK={DK}
              itemsPerPage={parseInt(laporanPerHalaman, 10) || 20}
              fmtDateExternal={fmtDate}
              autoRefresh={autoRefresh}
              bahasa={bahasa}
            />
          )}

          {activeNav === "notifikasi" && (
            <NotifikasiContent
              notifData={notifData}
              notifUnread={notifUnread}
              onRefresh={loadNotif}
              onNavigate={navTo}
              onGoToLaporan={(laporanId) => {
                setHighlightLaporanId(laporanId);
                navTo("laporan");
              }}
              showAlert={showAlert}
              darkMode={darkMode}
              DK={DK}
              bahasa={bahasa}
              onConfirmDelete={setNotifDeleteConfirm}
              notifDeleteConfirm={notifDeleteConfirm}
              onCancelDelete={() => setNotifDeleteConfirm(null)}
            />
          )}

          {activeNav === "pengguna" && (
            <PenggunaContent
              onBack={() => goBack()}
              showAlert={showAlert}
              darkMode={darkMode}
              DK={DK}
              bahasa={bahasa}
            />
          )}

          {activeNav === "dashboard" && (
            <>
              {/* ── Row 1: Big stats ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                  marginBottom: "0",
                }}
              >
                {[
                  {
                    label: t.totalLaporanLabel,
                    val: stats?.total ?? "—",
                    sub: t.semuaLaporan,
                    accent: "#2563EB",
                    bg: "#EFF6FF",
                    border: "#BFDBFE",
                    gradient:
                      "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                    ),
                  },
                  {
                    label: t.totalPenggunaLabel,
                    val: stats?.totalUser ?? "—",
                    sub: t.penggunaTerdaftar,
                    accent: "#059669",
                    bg: "#ECFDF5",
                    border: "#A7F3D0",
                    gradient:
                      "linear-gradient(135deg, #047857 0%, #065F46 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                  {
                    label: t.laporanHariIniLabel,
                    val: stats?.hariIni ?? "—",
                    sub: t.masukHariIni2,
                    accent: "#D97706",
                    bg: "#FFFBEB",
                    border: "#FDE68A",
                    gradient:
                      "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                  },
                  {
                    label: t.tingkatSelesaiLabel,
                    val: stats?.total
                      ? `${Math.round((stats.selesai / stats.total) * 100)}%`
                      : "—",
                    sub: t.dariLaporan2(stats?.selesai ?? 0, stats?.total ?? 0),
                    accent: "#059669",
                    bg: "#ECFDF5",
                    border: "#A7F3D0",
                    gradient:
                      "linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...CARD,
                      padding: "18px 20px",
                      background: s.gradient,
                      border: "2px solid rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      padding: "22px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        {s.label}
                      </span>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.2)",
                          border: "2px solid rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        {s.icon}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "42px",
                        fontWeight: 800,
                        color: "#fff",
                        margin: 0,
                        lineHeight: 1,
                        letterSpacing: "-1px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.val}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#fff",
                        margin: "8px 0 0",
                        fontWeight: 600,
                        textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Row 2: Status cards ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                  marginBottom: "0",
                }}
              >
                {[
                  {
                    label: t.menungguLabel,
                    val: stats?.menunggu ?? "—",
                    sub: t.perluAksi,
                    gradient:
                      "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    ),
                  },
                  {
                    label: t.diprosesLabel,
                    val: stats?.diproses ?? "—",
                    sub: t.sedangDitangani,
                    gradient:
                      "linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)",
                    icon: (
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: t.selesaiLabel,
                    val: stats?.selesai ?? "—",
                    sub: t.berhasilSelesai,
                    gradient:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                  },
                  {
                    label: t.ditolakLabel,
                    val: stats?.ditolak ?? "—",
                    sub: t.tidakDapat,
                    gradient:
                      "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...CARD,
                      padding: "18px 20px",
                      background: s.gradient,
                      border: "2px solid rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      padding: "22px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.2)",
                          border: "2px solid rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        {s.icon}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "42px",
                        fontWeight: 800,
                        color: "#fff",
                        margin: 0,
                        lineHeight: 1,
                        letterSpacing: "-1px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.val}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#fff",
                        margin: "8px 0 0",
                        fontWeight: 600,
                        textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Ringkasan Status Laporan ── */}
              <div
                style={{
                  background: DK.surface,
                  borderRadius: "16px",
                  border: DK.border,
                  boxShadow: DK.cardShadow,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: DK.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: DK.text,
                        margin: 0,
                      }}
                    >
                      {t.ringkasanStatus}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: DK.subtext,
                        margin: "2px 0 0",
                      }}
                    >
                      {t.ringkasanSub}
                    </p>
                  </div>
                </div>
                {/* Body: donut kiri | divider | legend kanan */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    minHeight: "280px",
                  }}
                >
                  {/* Kiri: Donut — Recharts PieChart */}
                  <div
                    style={{
                      flex: "0 0 50%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "32px 24px",
                      position: "relative",
                    }}
                  >
                    {(() => {
                      const total =
                        (stats?.menunggu || 0) +
                        (stats?.diproses || 0) +
                        (stats?.selesai || 0) +
                        (stats?.ditolak || 0);
                      const pieData = [
                        { name: t.menungguLabel, value: stats?.menunggu || 0, color: "#F59E0B" },
                        { name: t.diprosesLabel, value: stats?.diproses || 0, color: "#7C3AED" },
                        { name: t.selesaiLabel,  value: stats?.selesai  || 0, color: "#10B981" },
                        { name: t.ditolakLabel,  value: stats?.ditolak  || 0, color: "#EF4444" },
                      ];
                      const emptyData = [{ name: "Empty", value: 1, color: darkMode ? "#334155" : "#E2E8F0" }];
                      const data = total === 0 ? emptyData : pieData.filter(d => d.value > 0);
                      return (
                        <DonutChart1
                          data={data}
                          total={total}
                          DK={DK}
                          darkMode={darkMode}
                          t={t}
                          bahasa={bahasa}
                        />
                      );
                    })()}
                  </div>
                  {/* Divider */}
                  <div
                    style={{
                      width: "1px",
                      background: darkMode ? "#334155" : "#E2E8F0",
                      flexShrink: 0,
                      margin: "20px 0",
                    }}
                  />
                  {/* Kanan: Legend */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      padding: "32px 40px",
                      gap: "0",
                    }}
                  >
                    {[
                      {
                        val: stats?.menunggu || 0,
                        color: "#F59E0B",
                        label: t.menungguLabel,
                      },
                      {
                        val: stats?.diproses || 0,
                        color: "#7C3AED",
                        label: t.diprosesLabel,
                      },
                      {
                        val: stats?.selesai || 0,
                        color: "#10B981",
                        label: t.selesaiLabel,
                      },
                      {
                        val: stats?.ditolak || 0,
                        color: "#EF4444",
                        label: t.ditolakLabel,
                      },
                    ].map((s, idx) => {
                      const total =
                        (stats?.menunggu || 0) +
                        (stats?.diproses || 0) +
                        (stats?.selesai || 0) +
                        (stats?.ditolak || 0);
                      const pct = total ? Math.round((s.val / total) * 100) : 0;
                      return (
                        <div
                          key={s.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "14px 0",
                            borderBottom:
                              idx < 3
                                ? `1px solid ${darkMode ? "#334155" : "#F1F5F9"}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "4px",
                              background: s.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: DK.subtext,
                              flex: 1,
                            }}
                          >
                            {s.label}
                          </span>
                          <span
                            style={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: DK.text,
                              minWidth: "32px",
                              textAlign: "right",
                            }}
                          >
                            {s.val}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: DK.dimtext,
                              minWidth: "46px",
                            }}
                          >
                            ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Row 3: Laporan Terbaru + Menunggu Terlama ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                {/* Laporan Masuk Terbaru */}
                <div
                  style={{
                    background: DK.surface,
                    borderRadius: "16px",
                    border: DK.border,
                    boxShadow: DK.cardShadow,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderBottom: DK.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: DK.text,
                          margin: 0,
                        }}
                      >
                        {t.laporanTerbaru}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: DK.subtext,
                          margin: "2px 0 0",
                        }}
                      >
                        {t.laporanTerbaruSub}
                      </p>
                    </div>
                    <button
                      onClick={() => navTo("laporan")}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#2563EB",
                        background: "#EFF6FF",
                        border: "2px solid #BFDBFE",
                        borderRadius: "9px",
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "2px 2px 0 #BFDBFE",
                      }}
                    >
                      {t.lihatSemua2}
                    </button>
                  </div>
                  <RecentLaporan
                    onNavigate={() => navTo("laporan")}
                    darkMode={darkMode}
                    DK={DK}
                    fmtDateExternal={fmtDate}
                    t={t}
                  />
                </div>

                {/* Laporan Menunggu Terlama */}
                <LaporanTerlama
                  onNavigate={() => navTo("laporan")}
                  onGoToLaporan={(id) => { setHighlightLaporanId(id); navTo("laporan"); }}
                  darkMode={darkMode}
                  DK={DK}
                  t={t}
                />
              </div>
            </>
          )}

          {activeNav === "analitik" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                flex: 1,
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: DK.surface,
                  borderRadius: "16px",
                  border: DK.border,
                  boxShadow: DK.cardShadow,
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: DK.text,
                      margin: "0 0 4px",
                    }}
                  >
                    {t.analitikJudul}
                  </p>
                  <p style={{ fontSize: "13px", color: DK.dimtext, margin: 0 }}>
                    {t.analitikSub}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: DK.dimtext,
                    background: DK.surface,
                    border: DK.border,
                    borderRadius: "10px",
                    padding: "6px 14px",
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
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {t.dataRealtime}
                </div>
              </div>

              {/* 4 stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                }}
              >
                {[
                  {
                  label: t.totalLaporan,
val:
  (stats?.menunggu ?? 0) +
  (stats?.diproses ?? 0) +
  (stats?.selesai ?? 0) +
  (stats?.ditolak ?? 0),
sub: t.semuaWaktu,
gradient: "linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)",
icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                    ),
                  },
                  {
                   label: t.tingkatSelesai,
val:
(()=>{ 
 const total=(stats?.menunggu??0)+(stats?.diproses??0)+(stats?.selesai??0)+(stats?.ditolak??0); 
 return total?Math.round((stats?.selesai??0)/total*100)+"%":"0%"; 
})(),

sub: t.dariTotal,
                    gradient: "linear-gradient(135deg,#059669 0%,#047857 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                  },
                  {
                   label: t.laporanHariIni,

val: stats?.hariIni ?? "—",

sub: t.masukHariIni,
                    gradient: "linear-gradient(135deg,#D97706 0%,#B45309 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                  },
                  {
                   label: t.totalPengguna,

val: stats?.totalUser ?? "—",

sub: t.akunTerdaftar,
                    gradient: "linear-gradient(135deg,#7C3AED 0%,#6D28D9 100%)",
                    icon: (
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      ...CARD,
                      padding: "22px 24px",
                      background: s.gradient,
                      border: "2px solid rgba(0,0,0,0.2)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.2)",
                          border: "2px solid rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        {s.icon}
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#fff",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "42px",
                        fontWeight: 800,
                        color: "#fff",
                        margin: 0,
                        lineHeight: 1,
                        letterSpacing: "-1px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.val}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#fff",
                        margin: "8px 0 0",
                        fontWeight: 600,
                        textShadow: "0 1px 3px rgba(0,0,0,0.35)",
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Row 2: Donut + Top Kategori bar chart */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                {/* Distribusi Status — big donut */}
                <div
                  style={{
                    background: DK.surface,
                    borderRadius: "16px",
                    border: DK.border,
                    boxShadow: DK.cardShadow,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ padding: "14px 18px", borderBottom: DK.border }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: DK.text,
                        margin: 0,
                      }}
                    >
                      {t.distribusiStatus}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: DK.dimtext,
                        margin: "2px 0 0",
                      }}
                    >
                      {t.distribusiSub}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "28px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "40px",
                    }}
                  >
                    {(() => {
                      const total =
                        (stats?.menunggu || 0) +
                        (stats?.diproses || 0) +
                        (stats?.selesai || 0) +
                        (stats?.ditolak || 0);
                      const segments = [
                        { val: stats?.menunggu || 0, color: "#F59E0B", label: t.menungguLabel },
                        { val: stats?.diproses || 0, color: "#7C3AED", label: t.diprosesLabel },
                        { val: stats?.selesai  || 0, color: "#10B981", label: t.selesaiLabel  },
                        { val: stats?.ditolak  || 0, color: "#EF4444", label: t.ditolakLabel  },
                      ];
                      const pieData = segments.filter(s => s.val > 0).map(s => ({ name: s.label, value: s.val, color: s.color }));
                      const emptyData = [{ name: "Empty", value: 1, color: darkMode ? "#334155" : "#E2E8F0" }];
                      const data = total === 0 ? emptyData : pieData;
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
                          <DonutChart2
                            data={data}
                            total={total}
                            DK={DK}
                            darkMode={darkMode}
                            bahasa={bahasa}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {segments.map((s) => (
                              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: s.color, flexShrink: 0 }} />
                                <span style={{ fontSize: "13px", fontWeight: 600, color: DK.subtext, minWidth: "80px" }}>{s.label}</span>
                                <span style={{ fontSize: "16px", fontWeight: 800, color: DK.text }}>{s.val}</span>
                                <span style={{ fontSize: "12px", color: DK.dimtext }}>({total ? Math.round((s.val / total) * 100) : 0}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                                </div>

                {/* Top Kategori — horizontal bar chart */}
                <div
                  style={{
                    background: DK.surface,
                    borderRadius: "16px",
                    border: DK.border,
                    boxShadow: DK.cardShadow,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{ padding: "14px 18px", borderBottom: DK.border }}
                  >
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: DK.text,
                        margin: 0,
                      }}
                    >
                      Top Kategori
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: DK.dimtext,
                        margin: "2px 0 0",
                      }}
                    >
                      {t.topKategori5}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {stats?.topKategori?.length ? (
                      stats.topKategori.map((k, i) => {
                        const colors = [
                          "#2563EB",
                          "#7C3AED",
                          "#059669",
                          "#D97706",
                          "#DC2626",
                        ];
                        const bgs = darkMode
                          ? [
                              "#1E3A5F",
                              "#2D1B69",
                              "#064E3B",
                              "#451A03",
                              "#450A0A",
                            ]
                          : [
                              "#EFF6FF",
                              "#F5F3FF",
                              "#ECFDF5",
                              "#FFFBEB",
                              "#FEF2F2",
                            ];
                        const borders = darkMode
                          ? [
                              "#2563EB",
                              "#7C3AED",
                              "#059669",
                              "#D97706",
                              "#DC2626",
                            ]
                          : [
                              "#BFDBFE",
                              "#DDD6FE",
                              "#A7F3D0",
                              "#FDE68A",
                              "#FECACA",
                            ];
                        const nama = k.kategori || "—";
                        const jumlah = k._count?.kategori ?? 0;
                        const max = stats.topKategori[0]?._count?.kategori || 1;
                        const pct = Math.round((jumlah / max) * 100);
                        return (
                          <div key={i}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "6px",
                                    background: bgs[i],
                                    border: `1.5px solid ${borders[i]}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      color: colors[i],
                                    }}
                                  >
                                    {i + 1}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    color: DK.text,
                                  }}
                                >
                                  {nama}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: colors[i],
                                  background: bgs[i],
                                  padding: "2px 10px",
                                  borderRadius: "20px",
                                  border: `1.5px solid ${borders[i]}`,
                                }}
                              >
                                {jumlah}
                              </span>
                            </div>
                            <div
                              style={{
                                height: "10px",
                                background: darkMode ? "#334155" : "#F1F5F9",
                                borderRadius: "99px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}bb)`,
                                  borderRadius: "99px",
                                  transition: "width .6s ease",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "24px 0",
                          color: DK.dimtext,
                          fontSize: "13px",
                        }}
                      >
                        Belum ada data
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Aktivitas — line chart gede */}
              <div
                style={{
                  background: DK.surface,
                  borderRadius: "16px",
                  border: DK.border,
                  boxShadow: DK.cardShadow,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 18px",
                    borderBottom: DK.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: DK.text,
                        margin: 0,
                      }}
                    >
                      {t.aktivitasLaporan}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: DK.dimtext,
                        margin: "2px 0 0",
                      }}
                    >
                      {t.trendSub}
                    </p>
                  </div>
                  <div style={{ position: "relative" }}>
                    <select
                      value={aktivitasPeriode}
                      onChange={(e) => setAktivitasPeriode(e.target.value)}
                      style={{
                        padding: "5px 28px 5px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: `1.5px solid ${darkMode ? "#475569" : "#CBD5E1"}`,
                        background: DK.inputBg,
                        color: DK.text,
                        fontFamily: "inherit",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      {(bahasa === "en"
                        ? [["1hari","1 Day"],["7hari","7 Days"],["1bulan","1 Month"],["1tahun","1 Year"]]
                        : [["1hari","1 Hari"],["7hari","7 Hari"],["1bulan","1 Bulan"],["1tahun","1 Tahun"]]
                      ).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <svg
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={DK.dimtext}
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                <div style={{ padding: "24px" }}>
                  {(() => {
                  // Strategy Pattern: PeriodeStrategyFactory pilih strategy sesuai periode
const allLaporan = stats?.rawLaporan || [];
const filtered = PeriodeStrategyFactory.create(aktivitasPeriode).process(allLaporan, stats);
                    const data = filtered.length
                      ? filtered
                      : stats?.aktivitas || [];
                    if (!data.length)
                      return (
                        <div
                          style={{
                            height: "200px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8",
                            fontSize: "13px",
                          }}
                        >
                          {t.belumAda}
                        </div>
                      );

                    // Gunakan viewBox fixed — path d TIDAK bisa pakai %
                    const VW = 800; // viewBox width
                    const VH = 300; // viewBox height (area chart)
                    const PADL = 40; // left padding (y-axis)
                    const PADR = 16; // right padding
                    const PADT = 20; // top padding
                    const PADB = 40; // bottom padding (x-axis labels)
                    const CW = VW - PADL - PADR; // chart area width
                    const CH = VH - PADT - PADB; // chart area height
                    const maxV = Math.max(...data.map((a) => a.count), 1);

                    const points = data.map((a, i) => ({
                      x: PADL + (i / Math.max(data.length - 1, 1)) * CW,
                      y: PADT + CH - (a.count / maxV) * CH,
                      count: a.count,
                      label: a.label,
                    }));

                    // Path pakai pixel murni — garis pasti muncul
                    const pathD = points
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                      .join(" ");
                    const areaD = `${pathD} L ${points[points.length - 1].x} ${PADT + CH} L ${points[0].x} ${PADT + CH} Z`;

                    return (
                      <div style={{ position: "relative" }}>
                        <svg
                          viewBox={`0 0 ${VW} ${VH + 10}`}
                          width="100%"
                          height={VH + 10}
                          style={{ overflow: "visible" }}
                        >
                          <defs>
                            <linearGradient
                              id="lineGrad2"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#2563EB"
                                stopOpacity="0.22"
                              />
                              <stop
                                offset="100%"
                                stopColor="#2563EB"
                                stopOpacity="0.01"
                              />
                            </linearGradient>
                          </defs>

                          {/* ── Sumbu Y — judul ── */}
                          <text
                            x={10}
                            y={VH / 2}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="700"
                            fill={darkMode ? "#94A3B8" : "#374151"}
                            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
                            transform={`rotate(-90, 10, ${VH / 2})`}
                          >
                            {t.jumlahLaporan}
                          </text>

                          {/* ── Grid horizontal + label Y ── */}
                          {[0, 25, 50, 75, 100].map((pct) => {
                            const y = PADT + CH - (pct / 100) * CH;
                            const val = Math.round((maxV * pct) / 100);
                            return (
                              <g key={pct}>
                                <line
                                  x1={PADL}
                                  y1={y}
                                  x2={VW - PADR}
                                  y2={y}
                                  stroke={darkMode ? "#334155" : "#E2E8F0"}
                                  strokeWidth="1"
                                  strokeDasharray={pct === 0 ? "none" : "4 3"}
                                />
                                <text
                                  x={PADL - 6}
                                  y={y + 4}
                                  textAnchor="end"
                                  fontSize="11"
                                  fill={darkMode ? "#94A3B8" : "#374151"}
                                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
                                >
                                  {val}
                                </text>
                              </g>
                            );
                          })}

                          {/* ── Sumbu X — judul ── */}
                          <text
                            x={PADL + CW / 2}
                            y={VH + 8}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="700"
                            fill={darkMode ? "#94A3B8" : "#374151"}
                            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
                          >
                            {t.periodeWaktu}
                          </text>

                          {/* ── Grid vertikal per titik X ── */}
                          {points.map((p, i) => (
                            <line
                              key={`vg-${i}`}
                              x1={p.x}
                              y1={PADT}
                              x2={p.x}
                              y2={PADT + CH}
                              stroke={darkMode ? "#334155" : "#E2E8F0"}
                              strokeWidth="1"
                              strokeDasharray="4 3"
                            />
                          ))}

                          {/* ── Area fill ── */}
                          <path d={areaD} fill="url(#lineGrad2)" />

                          {/* ── Garis penghubung antar titik ── */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#2563EB"
                                stroke={darkMode ? "#1E293B" : "#fff"}
                                strokeWidth="2.5"
                              />
                              {p.count > 0 && (
                                <text
                                  x={p.x}
                                  y={p.y - 12}
                                  textAnchor="middle"
                                  fontSize="12"
                                  fontWeight="800"
                                  fill={darkMode ? "#F1F5F9" : "#1E293B"}
                                  fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
                                >
                                  {p.count}
                                </text>
                              )}
                              <text
                                x={p.x}
                                y={PADT + CH + 18}
                                textAnchor="middle"
                                fontSize="11"
                                fill={darkMode ? "#94A3B8" : "#475569"}
                                fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
                              >
                                {p.label}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}


          {activeNav === "pengunjung" && (
            <VisitorLogPage darkMode={darkMode} DK={DK} bahasa={bahasa} />
          )}

          {activeNav === "pengaturan" && (() => {
            // ── iOS-style helpers ──────────────────────────────────────
            const SLabel = ({ children }) => (
              <p style={{ fontSize:"11px", fontWeight:700, color:DK.dimtext, letterSpacing:"1.2px", textTransform:"uppercase", margin:"0 0 6px 4px" }}>{children}</p>
            );
            const SCard = ({ children }) => (
              <div style={{ background:DK.surface, borderRadius:"16px", border:DK.border, overflow:"hidden", boxShadow:darkMode?"0 1px 4px rgba(0,0,0,0.4)":"0 1px 4px rgba(8,18,42,0.08)", marginBottom:"20px" }}>
                {children}
              </div>
            );
            const SRow = ({ icon, iconBg, title, sub, right, onPress, last }) => (
              <div onClick={onPress} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 16px", borderBottom:last?"none":DK.border, cursor:onPress?"pointer":"default", transition:"background .12s" }}
                onMouseEnter={e=>{ if(onPress) e.currentTarget.style.background=darkMode?"#273449":"#F8FAFC"; }}
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

            return (
              <div style={{ display:"flex", flexDirection:"column", gap:"0", fontFamily:"-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>

                {/* ── FAQ Modal ── */}
                {showFaqModal && (
                  <div onClick={()=>{setShowFaqModal(false);setOpenFaqIdx(null);}} style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
                    <div onClick={e=>e.stopPropagation()} style={{ background:DK.surface, borderRadius:"20px", width:"100%", maxWidth:"600px", border:DK.border, overflow:"hidden", boxShadow:darkMode?"0 24px 48px rgba(0,0,0,0.6)":"0 24px 48px rgba(15,23,42,0.18)", maxHeight:"85vh", display:"flex", flexDirection:"column", fontFamily:"inherit" }}>
                      <div style={{ padding:"18px 20px", borderBottom:DK.border, background:darkMode?"#273449":"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                        <div>
                          <p style={{ fontSize:"16px", fontWeight:800, color:DK.text, margin:0 }}>FAQ</p>
                          <p style={{ fontSize:"12px", color:DK.dimtext, margin:"2px 0 0" }}>{bahasa==="en"?"Frequently asked questions":"Pertanyaan yang sering ditanyakan"}</p>
                        </div>
                        <button onClick={()=>{setShowFaqModal(false);setOpenFaqIdx(null);}} style={{ width:"32px", height:"32px", borderRadius:"50%", background:darkMode?"rgba(239,68,68,0.12)":"#FFF1F2", border:"1.5px solid #FECACA", cursor:"pointer", color:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div style={{ overflowY:"auto", flex:1, padding:"8px 20px" }}>
                        {getFAQ(bahasa).map((item, idx) => (
                          <div key={idx} onClick={()=>setOpenFaqIdx(openFaqIdx===idx?null:idx)} style={{ borderBottom: idx < getFAQ(bahasa).length-1 ? DK.border : "none", padding:"14px 0", cursor:"pointer" }}>
                            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                              <p style={{ fontSize:"14px", fontWeight:600, color:DK.text, margin:0, flex:1, lineHeight:1.5 }}>{item.q}</p>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2.5} style={{ flexShrink:0, marginTop:"3px", transform:openFaqIdx===idx?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                              </svg>
                            </div>
                            {openFaqIdx===idx && (
                              <p style={{ fontSize:"13px", color:DK.subtext, margin:"10px 0 0", lineHeight:1.7 }}>{item.a}</p>
                            )}
                          </div>
                        ))}
                        <div style={{ height:"16px" }}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Privasi Modal ── */}
                {showPrivasiModal && (
                  <div onClick={()=>setShowPrivasiModal(false)} style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
                    <div onClick={e=>e.stopPropagation()} style={{ background:DK.surface, borderRadius:"20px", width:"100%", maxWidth:"600px", border:DK.border, overflow:"hidden", boxShadow:darkMode?"0 24px 48px rgba(0,0,0,0.6)":"0 24px 48px rgba(15,23,42,0.18)", maxHeight:"85vh", display:"flex", flexDirection:"column", fontFamily:"inherit" }}>
                      <div style={{ padding:"18px 20px", borderBottom:DK.border, background:darkMode?"#273449":"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                        <div>
                          <p style={{ fontSize:"16px", fontWeight:800, color:DK.text, margin:0 }}>{bahasa==="en"?"Privacy Policy":"Kebijakan Privasi"}</p>
                          <p style={{ fontSize:"12px", color:DK.dimtext, margin:"2px 0 0" }}>{bahasa==="en"?"Last updated: May 2026":"Terakhir diperbarui: Mei 2026"}</p>
                        </div>
                        <button onClick={()=>setShowPrivasiModal(false)} style={{ width:"32px", height:"32px", borderRadius:"50%", background:darkMode?"rgba(239,68,68,0.12)":"#FFF1F2", border:"1.5px solid #FECACA", cursor:"pointer", color:"#EF4444", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div style={{ overflowY:"auto", flex:1, padding:"8px 20px" }}>
                        {getPrivasi(bahasa).map((item, idx) => (
                          <div key={idx} style={{ marginTop:"16px" }}>
                            <p style={{ fontSize:"14px", fontWeight:700, color:DK.text, margin:"0 0 6px" }}>{item.title}</p>
                            <p style={{ fontSize:"13px", color:DK.subtext, margin:0, lineHeight:1.7, whiteSpace:"pre-line" }}>{item.content}</p>
                          </div>
                        ))}
                        <div style={{ height:"24px" }}/>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Profile Card ── */}
                <div onClick={()=>navTo("profil")} style={{ background:DK.surface, borderRadius:"16px", border:DK.border, padding:"16px", display:"flex", alignItems:"center", gap:"14px", marginBottom:"24px", cursor:"pointer", boxShadow:darkMode?"0 1px 4px rgba(0,0,0,0.4)":"0 1px 4px rgba(8,18,42,0.08)", transition:"background .12s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background=darkMode?"#273449":"#F8FAFC")}
                  onMouseLeave={e=>(e.currentTarget.style.background=DK.surface)}>
                  <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", fontWeight:800, color:"#fff", overflow:"hidden", flexShrink:0, border:`2px solid ${DK.border}` }}>
                    {user?.fotoProfil
                      ? <img src={user.fotoProfil} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : (user?.nama?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"AD")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"16px", fontWeight:700, color:DK.text, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.nama||"Admin"}</p>
                    <p style={{ fontSize:"12px", color:DK.dimtext, margin:"0 0 5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                    <div style={{ display:"flex", gap:"5px" }}>
                      <span style={{ fontSize:"11px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", background:darkMode?"#1E3A5F":"#DBEAFE", color:"#1D4ED8", border:"1.5px solid #BFDBFE", textTransform:"capitalize" }}>{user?.role}</span>
                      <span style={{ fontSize:"11px", fontWeight:700, padding:"2px 8px", borderRadius:"20px", background:darkMode?"#064E3B":"#DCFCE7", color:"#15803D", border:"1.5px solid #86EFAC" }}>Aktif</span>
                    </div>
                  </div>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2.5} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>

                {/* ── Biodata ── */}
                <SLabel>{bahasa==="en"?"Account Info":"Biodata"}</SLabel>
                <SCard>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} iconBg={darkMode?"#1E3A5F":"#EFF6FF"} title={bahasa==="en"?"Full Name":"Nama Lengkap"} sub={user?.nama||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} iconBg={darkMode?"#1E3A5F":"#EFF6FF"} title="Username" sub={`@${user?.username||"-"}`}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} iconBg={darkMode?"#064E3B":"#ECFDF5"} title="Email" sub={user?.email||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a2 2 0 0 1 2-2.18h3"/></svg>} iconBg={darkMode?"#451A03":"#FFFBEB"} title={bahasa==="en"?"Phone":"No. HP"} sub={user?.phone||"-"}/>
                  <SRow icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>} iconBg={darkMode?"#450A0A":"#FEF2F2"} title={bahasa==="en"?"Change Password":"Ubah Password"} sub={bahasa==="en"?"Update account security":"Perbarui keamanan akun"} onPress={()=>navTo("profil")} last/>
                </SCard>

                {/* ── Tampilan & Bahasa ── */}
                <SLabel>{bahasa==="en"?"Display & Language":"Tampilan & Bahasa"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={darkMode?"#FBBF24":"#475569"} strokeWidth={2}>{darkMode?<path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>:<circle cx="12" cy="12" r="5"/>}</svg>}
                    iconBg={darkMode?"#1C2A3A":"#F1F5F9"}
                    title={darkMode?(bahasa==="en"?"Dark Mode":"Mode Gelap"):(bahasa==="en"?"Light Mode":"Mode Terang")}
                    sub={darkMode?(bahasa==="en"?"Dark interface active":"Tampilan gelap aktif"):(bahasa==="en"?"Light interface active":"Tampilan terang aktif")}
                    right={<Toggle on={darkMode} onToggle={()=>handleToggleDark(!darkMode)}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>}
                    iconBg={darkMode?"#064E3B":"#ECFDF5"}
                    title={bahasa==="en"?"Language":"Bahasa"}
                    sub={bahasa==="id"?"Indonesia 🇮🇩":"English 🇬🇧"}
                    right={
                      <div style={{ display:"flex", gap:"4px" }}>
                        {["id","en"].map(lang=>(
                          <button key={lang} onClick={()=>handleBahasa(lang)} style={{ minWidth:"40px", height:"28px", padding:"0 10px", borderRadius:"8px", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:`1.5px solid ${bahasa===lang?"#22C55E":DK.border}`, background:bahasa===lang?"#22C55E":"transparent", color:bahasa===lang?"#fff":DK.subtext, transition:"all .15s" }}>
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    }
                    last
                  />
                </SCard>

                {/* ── Notifikasi ── */}
                <SLabel>{bahasa==="en"?"Notifications":"Notifikasi"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                    iconBg={darkMode?"#1E3A5F":"#EFF6FF"}
                    title={bahasa==="en"?"New Report Alert":"Notifikasi Laporan Baru"}
                    sub={bahasa==="en"?"Get notified when a report arrives":"Terima notif saat laporan masuk"}
                    right={<Toggle on={notifSettings[0]} onToggle={()=>setNotifSettings(s=>{const n=[...s];n[0]=!n[0];return n;})}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
                    iconBg={darkMode?"#450A0A":"#FEF2F2"}
                    title={bahasa==="en"?"Backlog Alert":"Alert Laporan Menumpuk"}
                    sub={bahasa==="en"?"Warning if waiting reports > 10":"Peringatan jika menunggu > 10"}
                    right={<Toggle on={notifSettings[2]} onToggle={()=>setNotifSettings(s=>{const n=[...s];n[2]=!n[2];return n;})}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>}
                    iconBg={darkMode?"#2D1B69":"#F5F3FF"}
                    title={bahasa==="en"?"Browser Notifications":"Notifikasi Browser"}
                    sub={browserNotif?(bahasa==="en"?"Notifications allowed":"Izin diberikan"):(bahasa==="en"?"Click to allow":"Klik untuk izinkan")}
                    right={<Toggle on={browserNotif} onToggle={async()=>{
                      if(!browserNotif){
                        const perm = await Notification.requestPermission();
                        const granted = perm==="granted";
                        setBrowserNotif(granted);
                        localStorage.setItem("laporku_browser_notif", String(granted));
                      } else {
                        setBrowserNotif(false);
                        localStorage.setItem("laporku_browser_notif", "false");
                      }
                    }}/>}
                    last
                  />
                </SCard>

                {/* ── Keamanan ── */}
                <SLabel>{bahasa==="en"?"Security":"Keamanan"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#7C3AED" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    iconBg={darkMode?"#2D1B69":"#F5F3FF"}
                    title={bahasa==="en"?"Auto Logout":"Sesi Otomatis Berakhir"}
                    sub={bahasa==="en"?"Auto logout after 30 min idle":"Logout otomatis setelah 30 mnt idle"}
                    right={<Toggle on={keamananSettings[0]} onToggle={()=>setKeamananSettings(s=>{const n=[...s];n[0]=!n[0];return n;})}/>}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
                    iconBg={darkMode?"#064E3B":"#ECFDF5"}
                    title={bahasa==="en"?"Auto Refresh Data":"Refresh Data Otomatis"}
                    sub={bahasa==="en"?"Refresh report data every 30s":"Perbarui data laporan setiap 30 dtk"}
                    right={<Toggle on={autoRefresh} onToggle={()=>{
                      const newVal = !autoRefresh;
                      setAutoRefresh(newVal);
                      localStorage.setItem("laporku_autorefresh", String(newVal));
                    }}/>}
                    last
                  />
                </SCard>

                {/* ── Bantuan ── */}
                <SLabel>{bahasa==="en"?"Help & Support":"Bantuan"}</SLabel>
                <SCard>
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                    iconBg={darkMode?"#1E3A5F":"#EFF6FF"}
                    title="FAQ"
                    sub={bahasa==="en"?"Frequently asked questions":"Pertanyaan yang sering ditanyakan"}
                    onPress={()=>setShowFaqModal(true)}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                    iconBg={darkMode?"#064E3B":"#ECFDF5"}
                    title={bahasa==="en"?"Privacy Policy":"Kebijakan Privasi"}
                    sub={bahasa==="en"?"How we handle your data":"Cara kami mengelola data Anda"}
                    onPress={()=>setShowPrivasiModal(true)}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#25D366" strokeWidth={2}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>}
                    iconBg={darkMode?"#14532D":"#F0FDF4"}
                    title="WhatsApp"
                    sub="+62 878-7016-5060"
                    onPress={()=>window.open("https://wa.me/6287870165060?text=Halo%20LaporKu%2C%20saya%20butuh%20bantuan.","_blank")}
                  />
                  <SRow
                    icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                    iconBg={darkMode?"#1E3A5F":"#EFF6FF"}
                    title="Email"
                    sub="laporku.app@gmail.com"
                    onPress={()=>window.open("mailto:laporku.app@gmail.com?subject=Bantuan%20LaporKu","_blank")}
                    last
                  />
                </SCard>

                {/* ── Tentang ── */}
                <SLabel>{bahasa==="en"?"About":"Tentang Aplikasi"}</SLabel>
                <SCard>
                  {[
                    { label:bahasa==="en"?"Version":"Versi", val:"v1.0.0", icon:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
                    { label:bahasa==="en"?"Developer":"Developer", val:"Kelompok 4 SI UINSA", icon:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
                    { label:bahasa==="en"?"Institution":"Institusi", val:"UIN Sunan Ampel Surabaya", icon:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                    { label:bahasa==="en"?"Course":"Mata Kuliah", val:"Pemrograman Web", icon:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
                    { label:bahasa==="en"?"Lecturer":"Dosen", val:"Subhan Nooriansyah M.Kom", icon:<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={DK.dimtext} strokeWidth={2}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                  ].map(({label, val, icon}, idx, arr)=>(
                    <SRow key={label} icon={icon} iconBg={darkMode?"#1E293B":"#F8FAFC"} title={label} right={<span style={{ fontSize:"12px", fontWeight:500, color:DK.dimtext, maxWidth:"180px", textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{val}</span>} last={idx===arr.length-1}/>
                  ))}
                </SCard>

                {/* ── Logout ── */}
                <button onClick={()=>setConfirmLogout(true)} style={{ width:"100%", padding:"14px", background:"#EF4444", border:"1.5px solid #DC2626", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(239,68,68,0.35)", transition:"all .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background="#DC2626"; e.currentTarget.style.boxShadow="0 2px 8px rgba(220,38,38,0.4)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="#EF4444"; e.currentTarget.style.boxShadow="0 2px 8px rgba(239,68,68,0.35)"; }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span style={{ fontSize:"15px", fontWeight:600, color:"#fff" }}>{bahasa==="en"?"Log Out":"Keluar"}</span>
                </button>

                <p style={{ textAlign:"center", fontSize:"12px", color:DK.dimtext, margin:"16px 0 0" }}>LaporKu · v1.0.0 · © 2026</p>

              </div>
            );
          })()}

          {![
            "dashboard",
            "profil",
            "kategori",
            "laporan",
            "pengguna",
            "analitik",
            "notifikasi",
            "pengaturan",
            "pengunjung",
          ].includes(activeNav) && (
            <div
              style={{
                background: DK.surface,
                borderRadius: "16px",
                border: DK.border,
                boxShadow: DK.cardShadow,
                overflow: "hidden",
                flex: 1,
              }}
            >
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
  ); cv
}