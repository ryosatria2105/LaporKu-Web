import { useState, useEffect, useRef } from "react";
import { laporanService, kategoriService } from "../services/api.service";

const B = "1px solid #030c1769";

const STATUS_CFG_BASE = {
  semua: { color: "#475569", bg: "#F1F5F9", border: "#CBD5E1" },
  menunggu: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  diproses: { color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
  selesai: { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
  ditolak: { color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" },
};
const STATUS_CFG = {
  semua: { ...STATUS_CFG_BASE.semua, label: "Semua" },
  menunggu: { ...STATUS_CFG_BASE.menunggu, label: "Menunggu" },
  diproses: { ...STATUS_CFG_BASE.diproses, label: "Diproses" },
  selesai: { ...STATUS_CFG_BASE.selesai, label: "Selesai" },
  ditolak: { ...STATUS_CFG_BASE.ditolak, label: "Ditolak" },
};
// Return STATUS_CFG with localized labels
function getStatusCfg(lt) {
  if (!lt) return STATUS_CFG;
  return {
    semua: { ...STATUS_CFG_BASE.semua, label: lt.semua || "Semua" },
    menunggu: { ...STATUS_CFG_BASE.menunggu, label: lt.menunggu || "Menunggu" },
    diproses: { ...STATUS_CFG_BASE.diproses, label: lt.diproses || "Diproses" },
    selesai: { ...STATUS_CFG_BASE.selesai, label: lt.selesai || "Selesai" },
    ditolak: { ...STATUS_CFG_BASE.ditolak, label: lt.ditolak || "Ditolak" },
  };
}

const NEXT_STATUS = {
  menunggu: ["diproses", "ditolak"],
  diproses: ["selesai", "ditolak", "menunggu"],
  selesai: [],
  ditolak: ["menunggu"],
};

function StatusBadge({ status, lt: sblt }) {
  const cfg = getStatusCfg(sblt)[status] || getStatusCfg(sblt).semua;
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "20px",
        border: `1.5px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
        display: "inline-block",
        minWidth: "108px",
        textAlign: "center",
      }}
    >
      {cfg.label}
    </span>
  );
}

function RejectModal({ laporan, onConfirm, onCancel, darkMode, DK, lt: rlt }) {
  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(false);
  if (!laporan) return null;
  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm(alasan.trim());
    setLoading(false);
  };
  const bd = darkMode ? "1px solid #334155" : B;
  const bg = DK?.surface || "#fff";
  const tx = DK?.text || "#0F172A";
  const sub = DK?.subtext || "#64748B";
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
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
          background: bg,
          borderRadius: "14px",
          width: "100%",
          maxWidth: "420px",
          border: bd,
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: "0 4px 24px rgba(15,23,42,0.18)",
        }}
      >
        <div
          style={{
            padding: "20px 24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px",
            }}
          >
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#DC2626"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 800,
              color: tx,
              margin: "0 0 4px",
            }}
          >
            {rlt?.tolakLaporan || "Tolak Laporan"}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: sub,
              margin: "0 0 16px",
              lineHeight: 1.5,
            }}
          >
            {rlt?.masukkanAlasan || "Masukkan alasan penolakan untuk laporan:"}
            <br />
            <strong style={{ color: tx }}>"{laporan.judul}"</strong>
          </p>
        </div>
        <div style={{ padding: "0 24px 24px" }}>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder={
              rlt?.tolakPlaceholder ||
              "Contoh: Laporan tidak dilengkapi bukti foto yang valid..."
            }
            autoFocus
            rows={3}
            style={{
              width: "100%",
              padding: "10px 13px",
              border: `2px solid ${darkMode ? "#475569" : "#CBD5E1"}`,
              borderRadius: "9px",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              color: tx,
              background: DK?.inputBg || "#fff",
              transition: "border-color .15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#EF4444")}
            onBlur={(e) =>
              (e.target.style.borderColor = darkMode ? "#475569" : "#CBD5E1")
            }
          />
          <p
            style={{ fontSize: "11px", color: "#94A3B8", margin: "5px 0 16px" }}
          >
            {rlt?.alasanHint ||
              "Alasan ini akan dikirimkan ke pengguna sebagai notifikasi."}
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "11px",
                border: bd,
                background: "transparent",
                color: tx,
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                borderRadius: "9px",
                transition: "background .15s",
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
              {rlt?.batal || "Batal"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: "11px",
                border: "2px solid #DC2626",
                background: "#EF4444",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                borderRadius: "9px",
                transition: "all .15s",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#DC2626";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#EF4444";
              }}
            >
              {loading ? rlt?.menyimpan || "Menyimpan..." : rlt?.tolakBtn || "Tolak Laporan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({
  laporan,
  onUpdate,
  onReject,
  darkMode,
  DK,
  lt: sdlt,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoad] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const allowed = NEXT_STATUS[laporan.status] || [];
  const STATUS_SD = getStatusCfg(sdlt);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  if (allowed.length === 0) return <StatusBadge status={laporan.status} lt={sdlt} />;

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((o) => !o);
  };

  const [confirmNext, setConfirmNext] = useState(null);
  const isEn = sdlt?.diproses === "In Progress" || sdlt?.diproses === "In Process";

  const handlePilih = (next) => {
    setOpen(false);
    if (next === "ditolak") { onReject(laporan); return; }
    setConfirmNext(next); // Poin 8: tampilkan konfirmasi dulu
  };

  const doUpdateStatus = async () => {
    if (!confirmNext) return;
    setLoad(true);
    setConfirmNext(null);
    try {
      await laporanService.updateStatus(laporan.id, confirmNext);
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal update status");
    } finally {
      setLoad(false);
    }
  };

  const dropBg = DK?.surface || "#fff";
  const dropBorder = darkMode ? "1px solid #334155" : B;

  const STATUS_LABELS = {
    diproses: sdlt?.diproses || (isEn ? "In Progress" : "Diproses"),
    selesai:  sdlt?.selesai  || (isEn ? "Resolved"   : "Selesai"),
    menunggu: sdlt?.menunggu || (isEn ? "Pending"    : "Menunggu"),
    ditolak:  sdlt?.ditolak  || (isEn ? "Rejected"   : "Ditolak"),
  };

  return (
    <div ref={btnRef} style={{ display: "inline-block" }}>
      {/* Poin 8: Konfirmasi sebelum update status */}
      {confirmNext && (
        <div onClick={() => setConfirmNext(null)} style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:DK?.surface||"#fff",borderRadius:"14px",width:"100%",maxWidth:"340px",boxShadow:"0 4px 24px rgba(15,23,42,0.18)",border:dropBorder,overflow:"hidden",fontFamily:"inherit" }}>
            <div style={{ padding:"24px 24px 16px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
              <div style={{ width:"48px",height:"48px",borderRadius:"12px",background:"#EFF6FF",border:"1.5px solid #BFDBFE",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"14px" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p style={{ fontSize:"15px",fontWeight:800,color:DK?.text||"#0F172A",margin:"0 0 8px" }}>
                {isEn ? "Change Status?" : "Ubah Status?"}
              </p>
              <p style={{ fontSize:"13px",color:DK?.dimtext||"#64748B",lineHeight:1.6,margin:0 }}>
                {isEn
                  ? `Change report status to "${STATUS_LABELS[confirmNext]}"?`
                  : `Ubah status laporan menjadi "${STATUS_LABELS[confirmNext]}"?`}
              </p>
            </div>
            <div style={{ display:"flex",gap:"8px",padding:"0 24px 20px" }}>
              <button onClick={()=>setConfirmNext(null)} style={{ flex:1,padding:"10px",border:dropBorder,background:"transparent",color:DK?.subtext||"#374151",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:"9px" }}>
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button onClick={doUpdateStatus} style={{ flex:1,padding:"10px",border:"2px solid #2563EB",background:"#2563EB",color:"#fff",fontSize:"13px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",borderRadius:"9px" }}>
                {isEn ? "Yes, Change" : "Ya, Ubah"}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={handleOpen}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          fontSize: "12px",
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: "20px",
          cursor: loading ? "not-allowed" : "pointer",
          border: `1.5px solid ${STATUS_SD[laporan.status]?.border}`,
          background: STATUS_SD[laporan.status]?.bg,
          color: STATUS_SD[laporan.status]?.color,
          fontFamily: "inherit",
          transition: "all .12s",
          minWidth: "108px",
        }}
      >
        {loading
          ? sdlt?.menyimpan || "Menyimpan..."
          : STATUS_SD[laporan.status]?.label}
        {!loading && (
          <svg
            width="10"
            height="10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 99999,
            background: dropBg,
            border: dropBorder,
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(15,23,42,0.15)",
            overflow: "hidden",
            minWidth: "130px",
          }}
        >
          {allowed.map((next) => (
            <button
              key={next}
              onClick={() => handlePilih(next)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "9px 12px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: 600,
                color: STATUS_SD[next]?.color,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = STATUS_SD[next]?.bg)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: STATUS_SD[next]?.color,
                  flexShrink: 0,
                }}
              />
              {STATUS_SD[next]?.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const SORT_OPTS_ID = [
  { val: "terbaru", label: "Terbaru" },
  { val: "terlama", label: "Terlama" },
  { val: "az", label: "A → Z" },
  { val: "za", label: "Z → A" },
];
const getSortOpts = (lt) =>
  lt
    ? [
        { val: "terbaru", label: lt.terbaru },
        { val: "terlama", label: lt.terlama },
        { val: "az", label: lt.az },
        { val: "za", label: lt.za },
      ]
    : SORT_OPTS_ID;

export default function LaporanAdminPage({
  onBack,
  showAlert,
  highlightId,
  onHighlightConsumed,
  darkMode,
  DK: DKprop,
  itemsPerPage: itemsPerPageProp,
  fmtDateExternal,
  autoRefresh = true,
  bahasa = "id",
}) {
  const DK = DKprop || {
    surface: "#fff",
    border: B,
    text: "#0F172A",
    subtext: "#374151",
    dimtext: "#64748B",
    inputBg: "#fff",
    surfaceHover: "#F8FAFC",
    cardShadow: "0 1px 4px rgba(8,18,42,0.44)",
  };
  const dm = !!darkMode;
  const bd = dm ? "1px solid #334155" : B;
  const ITEMS_PER_PAGE = itemsPerPageProp || 20;
  const isEn = bahasa === "en";
  const lt = {
    judul: isEn ? "Reports" : "Laporan",
    sub: isEn
      ? "Manage and monitor public reports in real-time"
      : "Kelola dan pantau laporan masyarakat secara real-time",
    cariPlaceholder: isEn
      ? "Search report, ID, or reporter..."
      : "Cari laporan, ID, atau pelapor...",
    dataRealtime: isEn ? "Real-time data" : "Data real-time",
    semua: isEn ? "All" : "Semua",
    menunggu: isEn ? "Pending" : "Menunggu",
    diproses: isEn ? "In Progress" : "Diproses",
    selesai: isEn ? "Resolved" : "Selesai",
    ditolak: isEn ? "Rejected" : "Ditolak",
    semuaKategori: isEn ? "All Categories" : "Semua Kategori",
    terbaru: isEn ? "Latest" : "Terbaru",
    terlama: isEn ? "Oldest" : "Terlama",
    az: isEn ? "A → Z" : "A → Z",
    za: isEn ? "Z → A" : "Z → A",
    thNo: "No",
    thLaporan: isEn ? "Report" : "Laporan",
    thKategori: isEn ? "Category" : "Kategori",
    thPelapor: isEn ? "Reporter" : "Pelapor",
    thTanggal: isEn ? "Date" : "Tanggal",
    thStatus: "Status",
    thAksi: isEn ? "Action" : "Aksi",
    memuat: isEn ? "Loading data..." : "Memuat data...",
    tidakAda: isEn ? "No reports found" : "Tidak ada laporan",
    tidakAdaSub: isEn
      ? "Try changing filter or search keyword"
      : "Coba ubah filter atau kata kunci pencarian",
    detail: isEn ? "Detail" : "Detail",
    tutup: isEn ? "Close" : "Tutup",
    menampilkan: isEn ? "Showing" : "Menampilkan",
    dari: isEn ? "of" : "dari",
    laporan: isEn ? "reports" : "laporan",
    prev: isEn ? "← Prev" : "← Prev",
    next: isEn ? "Next →" : "Next →",
    batal: isEn ? "Cancel" : "Batal",
    tolakLaporan: isEn ? "Reject Report" : "Tolak Laporan",
    tolakPlaceholder: isEn
      ? "E.g.: Report lacks valid evidence photo..."
      : "Contoh: Laporan tidak dilengkapi bukti foto yang valid...",
    masukkanAlasan: isEn
      ? "Enter reason for rejecting the report:"
      : "Masukkan alasan penolakan untuk laporan:",
    alasanHint: isEn
      ? "This reason will be sent to the reporter as notification."
      : "Alasan ini akan dikirimkan ke pengguna sebagai notifikasi.",
    menyimpan: isEn ? "Saving..." : "Menyimpan...",
    tolakBtn: isEn ? "Reject Report" : "Tolak Laporan",
    hapus: isEn ? "Delete" : "Hapus",
    viewAktif: isEn ? "Active" : "Aktif",
    viewArsip: isEn ? "Archive" : "Arsip",
    arsipKosong: isEn ? "No archived reports" : "Tidak ada laporan diarsip",
    arsipKosongSub: isEn ? "Deleted reports will appear here" : "Laporan yang dihapus akan muncul di sini",
    pulihkan: isEn ? "Restore" : "Pulihkan",
    hapusKonfirm: isEn ? "Delete this report?" : "Hapus laporan ini?",
    hapusWarning: isEn ? "Report will be hidden from users. Data remains in database." : "Laporan akan disembunyikan dari pengguna. Data tetap ada di database.",
    pulihkanKonfirm: isEn ? "Restore this report?" : "Pulihkan laporan ini?",
    pulihkanWarning: isEn ? "Report will be visible to users again." : "Laporan akan terlihat kembali oleh pengguna.",
    statusPending: isEn ? "Pending" : "Menunggu",
    statusInProgress: isEn ? "In Progress" : "Diproses",
    statusResolved: isEn ? "Resolved" : "Selesai",
    statusRejected: isEn ? "Rejected" : "Ditolak",
    laporanTotal: (n) => (isEn ? `${n} reports` : `${n} laporan`),
    statusSummary: (m, d, s, r) =>
      isEn
        ? `${m} pending • ${d} in progress • ${s} resolved • ${r} rejected`
        : `${m} menunggu • ${d} diproses • ${s} selesai • ${r} ditolak`,
    waktu: isEn ? "Time" : "Waktu",
    statusLabel: "Status",
    sudahDibaca: isEn ? "Already Read" : "Sudah Dibaca",
    belumDibaca: isEn ? "Unread" : "Belum Dibaca",
    lihatLaporan: isEn ? "View Report" : "Lihat Laporan",
    fotoBukti: (n) =>
      isEn
        ? `Evidence Photos (${n} photo${n > 1 ? "s" : ""})`
        : `Foto Bukti (${n} foto)`,
    statusCard: isEn ? "Status" : "Status",
    tanggalCard: isEn ? "Date" : "Tanggal",
    pelapor: isEn ? "Reporter" : "Pelapor",
    kategori: isEn ? "Category" : "Kategori",
    noHp: isEn ? "Phone" : "No HP",
    lokasi: isEn ? "Location" : "Lokasi",
    keterangan: isEn ? "Description" : "Keterangan",
    alasanPenolakan: isEn ? "Rejection Reason" : "Alasan Penolakan",
    detailNotifJudul: isEn ? "Report Detail" : "Detail Laporan",
    baruSaja: isEn ? "Just now" : "Baru saja",
    menitLalu: isEn ? "min ago" : "menit lalu",
    jamLalu: isEn ? "hr ago" : "jam lalu",
    hariLalu: isEn ? "days ago" : "hari lalu",
    blnLalu: isEn ? "mo ago" : "bln lalu",
  };
  // Computed localized status config and sort options
  const STATUS_LT = getStatusCfg(lt);
  const SORT_OPTS = getSortOpts(lt);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode,     setViewMode]  = useState("aktif"); // aktif | arsip
  const [filterStatus, setFS]       = useState("semua");
  const [filterKat, setFK] = useState("Semua");
  const [search, setSearch] = useState("");
  const [urutkan, setUrutkan] = useState("terbaru");
  const [kategoriList, setKL] = useState([]);
  const [detail, setDetail] = useState(null);
  const [stats, setStats] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [openMenuId,    setOpenMenuId]    = useState(null);
  const [menuPos,       setMenuPos]       = useState({top:0,right:0});
  const [lightbox, setLightbox] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Date formatter — use external format setting if provided
  const fmtDate = (d) => {
    if (fmtDateExternal) return fmtDateExternal(d);
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const load = async () => {
    setLoading(true);
    setCurrentPage(1); // reset page on new filter/search
    try {
      const params = {};
      if (viewMode === 'arsip') params.include_deleted = 'true';
      if (filterStatus !== "semua") params.status = filterStatus;
      if (filterKat !== "Semua") params.kategori = filterKat;
      if (search.trim()) params.search = search.trim();
      const res = await laporanService.getAdmin(params);
      let rows = res.data.data;
      if (urutkan === "terbaru")
        rows = [...rows].sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
        );
      if (urutkan === "terlama")
        rows = [...rows].sort(
          (a, b) => new Date(a.tanggal) - new Date(b.tanggal),
        );
      if (urutkan === "az")
        rows = [...rows].sort((a, b) => a.judul.localeCompare(b.judul));
      if (urutkan === "za")
        rows = [...rows].sort((a, b) => b.judul.localeCompare(a.judul));
      setData(rows);
      return rows;
    } catch {
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const r = await laporanService.getStats();
      setStats(r.data.data);
    } catch {}
  };

  useEffect(() => {
    kategoriService
      .getAll()
      .then((r) => setKL(r.data.data))
      .catch(() => {});
    loadStats();
  }, []);

  useEffect(() => {
    load();
  }, [filterStatus, filterKat, urutkan, viewMode]);

  // Close titik-3 menu saat klik di luar
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      load();
      loadStats();
    }, 30000);
    return () => clearInterval(t);
  }, [filterStatus, filterKat, urutkan, viewMode, autoRefresh]);

  useEffect(() => {
    if (!highlightId) return;
    const openHighlight = async () => {
      const rows = await load();
      const found = rows.find((r) => r.id === highlightId);
      if (found) {
        setDetail(found);
      } else {
        try {
          const res = await laporanService.getAdmin({ search: highlightId });
          const match = res.data.data?.find((r) => r.id === highlightId);
          if (match) setDetail(match);
        } catch {}
      }
      if (onHighlightConsumed) onHighlightConsumed();
    };
    openHighlight();
  }, [highlightId]);

  const handleRejectConfirm = async (alasan) => {
    if (!rejectTarget) return;
    try {
      await laporanService.updateStatus(
        rejectTarget.id,
        "ditolak",
        alasan || undefined,
      );
      setRejectTarget(null);
      load();
      loadStats();
      if (showAlert)
        showAlert({
          type: "success",
          title: "Laporan Ditolak",
          message: `Laporan "${rejectTarget.judul}" berhasil ditolak dan notifikasi dikirim ke pengguna.`,
        });
    } catch (err) {
      if (showAlert)
        showAlert({
          type: "error",
          title: "Gagal",
          message: err.response?.data?.message || "Gagal menolak laporan.",
        });
    }
  };

  const handleAdminDelete = async () => {
    if (!deleteTarget) return;
    try {
      await laporanService.adminDelete(deleteTarget.id);
      setDeleteTarget(null); setDetail(null); load(); loadStats();
      if (showAlert) showAlert({ type:'success', title: isEn?'Report Deleted':'Laporan Dihapus', message: isEn?'Report hidden from users.':'Laporan disembunyikan dari pengguna.' });
    } catch (err) {
      setDeleteTarget(null);
      if (showAlert) showAlert({ type:'error', title:'Gagal', message: err.response?.data?.message||'Gagal menghapus laporan.' });
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      await laporanService.restore(restoreTarget.id);
      setRestoreTarget(null); setDetail(null); load(); loadStats();
      if (showAlert) showAlert({ type:'success', title: isEn?'Report Restored':'Laporan Dipulihkan', message: isEn?'Report is visible again.':'Laporan terlihat kembali oleh pengguna.' });
    } catch (err) {
      setRestoreTarget(null);
      if (showAlert) showAlert({ type:'error', title:'Gagal', message: err.response?.data?.message||'Gagal memulihkan laporan.' });
    }
  };

  const CARD = {
    background: DK.surface,
    borderRadius: "12px",
    border: bd,
    boxShadow: DK.cardShadow,
  };
  const headerBg = dm ? "#273449" : "#F8FAFC";
  const filterBg = dm ? "#1E293B" : "#FAFAFA";
  const rowHover = dm ? "#273449" : "#F8FAFC";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", flex: 1, gap: "0" }}
    >
      {/* Lightbox — full screen + prev/next */}
      {lightbox &&
        (() => {
          const isMulti = lightbox.list && lightbox.list.length > 1;
          const cur = lightbox.list
            ? lightbox.list[lightbox.idx]
            : lightbox.url;
          const goTo = (ni) => setLightbox({ ...lightbox, idx: ni });
          return (
            <div
              onClick={() => setLightbox(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999999,
                background: "rgba(0,0,0,0.97)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setLightbox(null)}
                style={{
                  position: "fixed",
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
                  zIndex: 1,
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
              {isMulti && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(
                      (lightbox.idx - 1 + lightbox.list.length) %
                        lightbox.list.length,
                    );
                  }}
                  style={{
                    position: "fixed",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
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
                    zIndex: 1,
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
              )}
              {isMulti && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo((lightbox.idx + 1) % lightbox.list.length);
                  }}
                  style={{
                    position: "fixed",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
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
                    zIndex: 1,
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
              )}
              <img
                src={cur}
                alt="preview"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100vw",
                  height: "100vh",
                  objectFit: "contain",
                  userSelect: "none",
                }}
              />
              {isMulti && (
                <div
                  style={{
                    position: "fixed",
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
                  {lightbox.idx + 1} / {lightbox.list.length}
                </div>
              )}
            </div>
          );
        })()}

      <RejectModal
        laporan={rejectTarget}
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
        darkMode={dm}
        DK={DK}
        lt={lt}
      />

      {/* ── Konfirmasi Hapus ── */}
      {deleteTarget && (
        <div onClick={()=>setDeleteTarget(null)} style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:DK.surface,borderRadius:'16px',width:'100%',maxWidth:'360px',border:dm?'1px solid #334155':'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 4px 24px rgba(15,23,42,0.18)',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif'}}>
            <div style={{padding:'28px 24px 16px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={1.8} style={{marginBottom:'14px'}}>
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              <p style={{fontSize:'16px',fontWeight:800,color:DK.text,margin:'0 0 8px'}}>{lt.hapusKonfirm}</p>
              <p style={{fontSize:'13px',color:DK.dimtext,lineHeight:1.6,margin:0}}>{lt.hapusWarning}</p>
            </div>
            <div style={{display:'flex',gap:'8px',padding:'0 24px 24px'}}>
              <button onClick={()=>setDeleteTarget(null)} style={{flex:1,padding:'11px',border:'2px solid #94A3B8',background:dm?'#1E293B':'#F1F5F9',color:dm?'#CBD5E1':'#374151',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',borderRadius:'11px'}}>
                {isEn?'Cancel':'Batal'}
              </button>
              <button onClick={handleAdminDelete} style={{flex:1,padding:'11px',border:'2px solid #DC2626',background:'#EF4444',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',borderRadius:'11px'}}>
                {lt.hapus}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Pulihkan ── */}
      {restoreTarget && (
        <div onClick={()=>setRestoreTarget(null)} style={{position:'fixed',inset:0,zIndex:99999,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:DK.surface,borderRadius:'16px',width:'100%',maxWidth:'360px',border:dm?'1px solid #334155':'1px solid #E2E8F0',overflow:'hidden',boxShadow:'0 4px 24px rgba(15,23,42,0.18)',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif'}}>
            <div style={{padding:'28px 24px 16px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
              <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={1.8} style={{marginBottom:'14px'}}>
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
              </svg>
              <p style={{fontSize:'16px',fontWeight:800,color:DK.text,margin:'0 0 8px'}}>{lt.pulihkanKonfirm}</p>
              <p style={{fontSize:'13px',color:DK.dimtext,lineHeight:1.6,margin:0}}>{lt.pulihkanWarning}</p>
            </div>
            <div style={{display:'flex',gap:'8px',padding:'0 24px 24px'}}>
              <button onClick={()=>setRestoreTarget(null)} style={{flex:1,padding:'11px',border:'2px solid #94A3B8',background:dm?'#1E293B':'#F1F5F9',color:dm?'#CBD5E1':'#374151',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',borderRadius:'11px'}}>
                {isEn?'Cancel':'Batal'}
              </button>
              <button onClick={handleRestore} style={{flex:1,padding:'11px',border:'2px solid #059669',background:'#059669',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',borderRadius:'11px'}}>
                {lt.pulihkan}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...CARD, overflow: "visible" }}>
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: bd,
            background: headerBg,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "12px",
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
                {lt.judul}
              </p>
              <p style={{ fontSize: "13px", color: DK.dimtext, margin: 0 }}>
                {lt.sub}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                border: bd,
                borderRadius: "9px",
                background: DK.inputBg,
                width: "260px",
                boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
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
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder={lt.cariPlaceholder}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  flex: 1,
                  color: DK.text,
                  background: "transparent",
                }}
              />
            </div>
          </div>
          {stats && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: DK.dimtext,
                fontWeight: 500,
              }}
            >
              <span style={{ fontWeight: 700, color: DK.text }}>
                {lt.laporanTotal(
                  (stats.menunggu || 0) +
                    (stats.diproses || 0) +
                    (stats.selesai || 0) +
                    (stats.ditolak || 0),
                )}
              </span>
              <span>•</span>
              <span style={{ color: "#B45309", fontWeight: 600 }}>
                {stats.menunggu || 0} {lt.menunggu.toLowerCase()}
              </span>
              <span>•</span>
              <span style={{ color: "#6D28D9", fontWeight: 600 }}>
                {stats.diproses || 0} {lt.diproses.toLowerCase()}
              </span>
              <span>•</span>
              <span style={{ color: "#059669", fontWeight: 600 }}>
                {stats.selesai || 0} {lt.selesai.toLowerCase()}
              </span>
              <span>•</span>
              <span style={{ color: "#DC2626", fontWeight: 600 }}>
                {stats.ditolak || 0} {lt.ditolak.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div
          style={{
            padding: "10px 20px",
            borderBottom: bd,
            background: filterBg,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* ── Toggle Aktif / Arsip ── */}
          <div style={{display:'flex',gap:'4px',background:dm?'#0F172A':'#F1F5F9',padding:'3px',borderRadius:'22px',border:dm?'1px solid #334155':'1px solid #E2E8F0',marginRight:'4px'}}>
            {[['aktif', lt.viewAktif||'Aktif'], ['arsip', lt.viewArsip||'Arsip']].map(([mode, label]) => (
              <button key={mode} onClick={()=>{ setViewMode(mode); setFS('semua'); }}
                style={{
                  padding:'4px 16px', borderRadius:'20px', fontSize:'12px',
                  fontWeight:700, cursor:'pointer', border:'none', fontFamily:'inherit',
                  background: viewMode===mode ? (mode==='arsip'?'#D97706':'#2563EB') : 'transparent',
                  color: viewMode===mode ? '#fff' : DK.dimtext,
                  transition:'all .15s',
                }}
              >{label}</button>
            ))}
          </div>

          {Object.entries(STATUS_LT).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFS(key)}
              style={{
                minWidth: "90px",
                padding: "5px 14px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "inherit",
                textAlign: "center",
                border: `1.5px solid ${filterStatus === key ? cfg.border : dm ? "#334155" : "#E2E8F0"}`,
                background: filterStatus === key ? cfg.bg : "transparent",
                color: filterStatus === key ? cfg.color : DK.dimtext,
                transition: "all .12s",
              }}
            >
              {cfg.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <select
            value={filterKat}
            onChange={(e) => setFK(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "8px",
              border: bd,
              fontSize: "12px",
              fontFamily: "inherit",
              background: DK.inputBg,
              color: DK.text,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="Semua">{lt.semuaKategori}</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>
          <select
            value={urutkan}
            onChange={(e) => setUrutkan(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "8px",
              border: bd,
              fontSize: "12px",
              fontFamily: "inherit",
              background: DK.inputBg,
              color: DK.text,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {SORT_OPTS.map((o) => (
              <option key={o.val} value={o.val}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: DK.dimtext,
              fontSize: "13px",
            }}
          >
            {lt.memuat}
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: DK.text,
                margin: "0 0 4px",
              }}
            >
              {lt.tidakAda}
            </p>
            <p style={{ fontSize: "12px", color: DK.subtext, margin: 0 }}>
              {lt.tidakAdaSub}
            </p>
          </div>
        ) : (
          (() => {
            const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
            const safePage = Math.min(
              Math.max(currentPage, 1),
              Math.max(totalPages, 1),
            );
            const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
            const pageData = data.slice(pageStart, pageStart + ITEMS_PER_PAGE);

            return (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <thead>
                      <tr style={{ background: headerBg, borderBottom: bd }}>
                        {[
                          { label: lt.thNo, align: "center", w: "44px" },
                          { label: lt.thLaporan, align: "left" },
                          { label: lt.thKategori, align: "left" },
                          { label: lt.thPelapor, align: "left" },
                          { label: lt.thTanggal, align: "left" },
                          { label: lt.thStatus, align: "center" },
                          { label: lt.thAksi, align: "center", w: "80px" },
                        ].map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "11px 14px",
                              textAlign: h.align,
                              fontSize: "13px",
                              fontWeight: 700,
                              color: DK.text,
                              width: h.w,
                            }}
                          >
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((item, i) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: bd,
                            transition: "background .12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = rowHover)
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
                              color: DK.subtext,
                              borderRight: bd,
                            }}
                          >
                            {String(pageStart + i + 1).padStart(2, "0")}
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              borderRight: bd,
                              maxWidth: "220px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: DK.text,
                                margin: "0 0 2px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.judul}
                            </p>
                            <p
                              style={{
                                fontSize: "11px",
                                color: DK.dimtext,
                                margin: 0,
                              }}
                            >
                              {item.id}
                            </p>
                          </td>
                          <td style={{ padding: "12px 14px", borderRight: bd }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "#F5F3FF",
                                border: "1.5px solid #DDD6FE",
                                color: "#6D28D9",
                              }}
                            >
                              {item.kategori}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", borderRight: bd }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg,#2563EB,#7C3AED)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "#fff",
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {item.user?.fotoProfil ? (
                                  <img
                                    src={item.user.fotoProfil}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  item.nama?.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <span
                                style={{ fontSize: "12px", color: DK.subtext }}
                              >
                                {item.nama}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              borderRight: bd,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "12px",
                                color: DK.subtext,
                                margin: 0,
                              }}
                            >
                              {fmtDate(item.tanggal)}
                            </p>
                            <p
                              style={{
                                fontSize: "10px",
                                color: DK.dimtext,
                                margin: "2px 0 0",
                              }}
                            >
                              {(() => {
                                const now = new Date();
                                const d = new Date(item.tanggal);
                                const diff = Math.floor((now - d) / 1000);
                                if (diff < 60) return "Baru saja";
                                if (diff < 3600)
                                  return `${Math.floor(diff / 60)} mnt lalu`;
                                if (diff < 86400)
                                  return `${Math.floor(diff / 3600)} jam lalu`;
                                const days = Math.floor(diff / 86400);
                                if (days < 30) return `${days} hari lalu`;
                                return `${Math.floor(days / 30)} bln lalu`;
                              })()}
                            </p>
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              borderRight: bd,
                              textAlign: "center",
                            }}
                          >
                            <StatusDropdown
                              laporan={item}
                              onUpdate={() => {
                                load();
                                loadStats();
                              }}
                              onReject={setRejectTarget}
                              darkMode={dm}
                              DK={DK}
                              lt={lt}
                            />
                          </td>
                          <td
                            style={{
                              padding: "12px 14px",
                              textAlign: "center",
                            }}
                          >
                            <div style={{display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'}}>
                              <button
                                onClick={() => setDetail(item)}
                                style={{
                                  padding: "5px 12px",
                                  background: "#EFF6FF",
                                  color: "#2563EB",
                                  border: "1.5px solid #BFDBFE",
                                  borderRadius: "7px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                {lt.detail}
                              </button>
                              {/* ── Titik 3 menu ── */}
                              <div style={{position:'relative'}}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); const r=e.currentTarget.getBoundingClientRect(); setMenuPos({top:r.bottom+4,right:window.innerWidth-r.right}); setOpenMenuId(openMenuId===item.id?null:item.id); }}
                                  style={{
                                    width:'30px', height:'30px',
                                    background: item.deletedAt ? '#FEF3C7' : '#F8FAFC',
                                    border: item.deletedAt ? '1.5px solid #FDE68A' : `1.5px solid ${dm?'#334155':'#E2E8F0'}`,
                                    borderRadius:'7px', cursor:'pointer',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color: item.deletedAt ? '#D97706' : DK.dimtext,
                                    fontFamily:'inherit', fontSize:'16px', fontWeight:700,
                                  }}
                                  title={item.deletedAt ? (isEn?'Hidden':'Tersembunyi') : (isEn?'Actions':'Aksi')}
                                >
                                  ⋮
                                </button>
                                {openMenuId === item.id && (
                                  <div
                                    onClick={e=>e.stopPropagation()}
                                    style={{
                                      position:'fixed', right:menuPos.right, top:menuPos.top, zIndex:99999,
                                      background:DK.surface, border:dm?'1px solid #334155':'1px solid #E2E8F0',
                                      borderRadius:'10px', overflow:'hidden', minWidth:'140px',
                                      boxShadow:'0 4px 16px rgba(15,23,42,0.15)',
                                    }}
                                  >
                                    {!item.deletedAt ? (
                                      <button
                                        onClick={()=>{ setDeleteTarget(item); setOpenMenuId(null); }}
                                        style={{
                                          display:'flex', alignItems:'center', gap:'8px',
                                          width:'100%', padding:'10px 14px',
                                          background:'transparent', border:'none',
                                          color:'#EF4444', fontSize:'13px', fontWeight:600,
                                          cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                                        }}
                                        onMouseEnter={e=>(e.currentTarget.style.background='#FEF2F2')}
                                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                                      >
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                                        </svg>
                                        {lt.hapus}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={()=>{ setRestoreTarget(item); setOpenMenuId(null); }}
                                        style={{
                                          display:'flex', alignItems:'center', gap:'8px',
                                          width:'100%', padding:'10px 14px',
                                          background:'transparent', border:'none',
                                          color:'#059669', fontSize:'13px', fontWeight:600,
                                          cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                                        }}
                                        onMouseEnter={e=>(e.currentTarget.style.background='#ECFDF5')}
                                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                                      >
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                                        </svg>
                                        {lt.pulihkan}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination controls ── */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderTop: bd,
                      background: dm ? "#273449" : "#F8FAFC",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <p
                      style={{ fontSize: "12px", color: DK.dimtext, margin: 0 }}
                    >
                      {lt.menampilkan}{" "}
                      <strong style={{ color: DK.text }}>
                        {pageStart + 1}–
                        {Math.min(pageStart + ITEMS_PER_PAGE, data.length)}
                      </strong>{" "}
                      {lt.dari}{" "}
                      <strong style={{ color: DK.text }}>{data.length}</strong>{" "}
                      {lt.laporan}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={safePage === 1}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "7px",
                          border: bd,
                          background: "transparent",
                          color: safePage === 1 ? DK.dimtext : DK.text,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: safePage === 1 ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          opacity: safePage === 1 ? 0.5 : 1,
                        }}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - safePage) <= 1,
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`e${idx}`}
                              style={{
                                padding: "6px 4px",
                                color: DK.dimtext,
                                fontSize: "12px",
                              }}
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "7px",
                                border:
                                  p === safePage ? "1.5px solid #2563EB" : bd,
                                background:
                                  p === safePage ? "#2563EB" : "transparent",
                                color: p === safePage ? "#fff" : DK.text,
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                minWidth: "32px",
                              }}
                            >
                              {p}
                            </button>
                          ),
                        )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={safePage === totalPages}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "7px",
                          border: bd,
                          background: "transparent",
                          color: safePage === totalPages ? DK.dimtext : DK.text,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor:
                            safePage === totalPages ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          opacity: safePage === totalPages ? 0.5 : 1,
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>

      {/* Modal Detail */}
      {detail &&
        (() => {
          const BASE =
            import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";
          let fotoList = [];
          try {
            const p = JSON.parse(detail.gambar);
            fotoList = Array.isArray(p) ? p : [detail.gambar];
          } catch {
            if (detail.gambar) fotoList = [detail.gambar];
          }
          const relTime = (d) => {
            const diff = Math.floor((new Date() - new Date(d)) / 1000);
            if (diff < 60) return "Baru saja";
            if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
            const days = Math.floor(diff / 86400);
            if (days < 30) return `${days} hari lalu`;
            return `${Math.floor(days / 30)} bulan lalu`;
          };
          const months = [
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
          const dd = new Date(detail.tanggal);
          const fullDate = `${dd.getDate()} ${months[dd.getMonth()]} ${dd.getFullYear()}`;
          const sCfg = STATUS_CFG[detail.status] || STATUS_CFG.menunggu;
          return (
            <div
              onClick={() => setDetail(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                background: "rgba(15,23,42,0.55)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: DK.surface,
                  borderRadius: "20px",
                  width: "100%",
                  maxWidth: "560px",
                  border: bd,
                  overflow: "hidden",
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                  boxShadow: dm
                    ? "0 24px 48px rgba(0,0,0,0.6)"
                    : "0 24px 48px rgba(15,23,42,0.18)",
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "18px 20px",
                    borderBottom: bd,
                    background: headerBg,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: DK.text,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {detail.judul}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: DK.dimtext,
                        margin: "2px 0 0",
                      }}
                    >
                      {detail.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setDetail(null)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: dm ? "rgba(239,68,68,0.12)" : "#FFF1F2",
                      border: "1.5px solid #FECACA",
                      cursor: "pointer",
                      color: "#EF4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all .15s",
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
                <div style={{ overflowY: "auto", flex: 1 }}>
                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 14px",
                          background: dm ? "#273449" : "#F8FAFC",
                          borderRadius: "14px",
                          border: bd,
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: DK.dimtext,
                            margin: "0 0 6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Status
                        </p>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: "20px",
                            border: `1.5px solid ${sCfg.border}`,
                            background: sCfg.bg,
                            color: sCfg.color,
                            display: "inline-block",
                            minWidth: "108px",
                            textAlign: "center",
                          }}
                        >
                          {sCfg.label}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: "12px 14px",
                          background: dm ? "#273449" : "#F8FAFC",
                          borderRadius: "14px",
                          border: bd,
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: DK.dimtext,
                            margin: "0 0 6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          Tanggal
                        </p>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: DK.text,
                            margin: 0,
                          }}
                        >
                          {fullDate}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: DK.dimtext,
                            margin: "2px 0 0",
                          }}
                        >
                          {relTime(detail.tanggal)}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        borderRadius: "14px",
                        border: bd,
                        overflow: "hidden",
                      }}
                    >
                      {[
                        {
                          label: lt.pelapor,
                          val: detail.nama,
                          icon: (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          ),
                        },
                        {
                          label: lt.kategori,
                          val: detail.kategori,
                          icon: (
                            <svg
                              width="13"
                              height="13"
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
                          label: lt.noHp,
                          val: detail.nohp || "-",
                          icon: (
                            <svg
                              width="13"
                              height="13"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a2 2 0 0 1 2-2.18h3" />
                            </svg>
                          ),
                        },
                      ].map(({ label, val, icon }, idx, arr) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            padding: "12px 14px",
                            borderBottom: bd,
                            background: dm ? "#1E293B" : "#fff",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              background: dm ? "#273449" : "#F1F5F9",
                              border: bd,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2563EB",
                              flexShrink: 0,
                              marginTop: "1px",
                            }}
                          >
                            {icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                color: DK.dimtext,
                                margin: "0 0 2px",
                                textTransform: "uppercase",
                                letterSpacing: "0.7px",
                              }}
                            >
                              {label}
                            </p>
                            <p
                              style={{
                                fontSize: "13px",
                                color: DK.text,
                                margin: 0,
                                lineHeight: 1.5,
                                wordBreak: "break-word",
                              }}
                            >
                              {val}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Lokasi row — clickable to GMaps if GPS coords embedded */}
                      {(() => {
                        const rawLokasi = detail.lokasi || "";
                        const hasCoords = rawLokasi.includes("::");
                        const displayAddr = hasCoords
                          ? rawLokasi.split("::")[0]
                          : rawLokasi;
                        const coordStr = hasCoords
                          ? rawLokasi.split("::")[1]
                          : null;
                        const gmapsUrl = coordStr
                          ? `https://www.google.com/maps?q=${coordStr}`
                          : null;
                        return (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              padding: "12px 14px",
                              borderBottom: "none",
                              background: dm ? "#1E293B" : "#fff",
                            }}
                          >
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                background: hasCoords
                                  ? dm
                                    ? "#1E3A5F"
                                    : "#EFF6FF"
                                  : dm
                                    ? "#273449"
                                    : "#F1F5F9",
                                border: hasCoords
                                  ? `1.5px solid ${dm ? "#2563EB" : "#BFDBFE"}`
                                  : bd,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: hasCoords ? "#2563EB" : "#2563EB",
                                flexShrink: 0,
                                marginTop: "1px",
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
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  marginBottom: "2px",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: DK.dimtext,
                                    margin: 0,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.7px",
                                  }}
                                >
                                  {lt.lokasi}
                                </p>
                                {hasCoords && (
                                  <span
                                    style={{
                                      fontSize: "9px",
                                      fontWeight: 700,
                                      color: "#2563EB",
                                      background: "#EFF6FF",
                                      border: "1px solid #BFDBFE",
                                      padding: "1px 6px",
                                      borderRadius: "20px",
                                      letterSpacing: "0.3px",
                                    }}
                                  >
                                    GPS
                                  </span>
                                )}
                              </div>
                              {gmapsUrl ? (
                                <a
                                  href={gmapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: "13px",
                                    color: "#2563EB",
                                    margin: 0,
                                    lineHeight: 1.5,
                                    wordBreak: "break-word",
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "5px",
                                    transition: "opacity .15s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "0.75")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                >
                                  <span style={{ flex: 1 }}>
                                    {displayAddr || "-"}
                                  </span>
                                  <svg
                                    width="12"
                                    height="12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    style={{ flexShrink: 0, marginTop: "2px" }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              ) : (
                                <p
                                  style={{
                                    fontSize: "13px",
                                    color: DK.text,
                                    margin: 0,
                                    lineHeight: 1.5,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {displayAddr || "-"}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div
                      style={{
                        padding: "14px",
                        background: dm ? "#1E293B" : "#F8FAFC",
                        borderRadius: "14px",
                        border: bd,
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: DK.dimtext,
                          margin: "0 0 8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        {lt.keterangan}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: DK.text,
                          margin: 0,
                          lineHeight: 1.7,
                        }}
                      >
                        {detail.keterangan || "-"}
                      </p>
                    </div>
                    {detail.alasanPenolakan && (
                      <div
                        style={{
                          padding: "14px",
                          background: dm ? "rgba(239,68,68,0.1)" : "#FEF2F2",
                          borderRadius: "14px",
                          border: `1.5px solid ${dm ? "#7F1D1D" : "#FECACA"}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <svg
                            width="13"
                            height="13"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#DC2626"
                            strokeWidth={2}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          <p
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: "#DC2626",
                              margin: 0,
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                            }}
                          >
                            Alasan Penolakan
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#DC2626",
                            margin: 0,
                            lineHeight: 1.7,
                          }}
                        >
                          {detail.alasanPenolakan}
                        </p>
                      </div>
                    )}
                    {fotoList.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: DK.dimtext,
                            margin: "0 0 10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          {lt.fotoBukti(fotoList.length)}
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3,1fr)",
                            gap: "8px",
                          }}
                        >
                          {fotoList.map((g, i) => (
                            <div
                              key={i}
                              style={{
                                position: "relative",
                                borderRadius: "12px",
                                overflow: "hidden",
                                border: bd,
                                cursor: "zoom-in",
                                aspectRatio: "1",
                              }}
                              onClick={() =>
                                setLightbox({
                                  url: `${BASE}/uploads/${g}`,
                                  list: fotoList.map(
                                    (f) => `${BASE}/uploads/${f}`,
                                  ),
                                  idx: i,
                                })
                              }
                            >
                              <img
                                src={`${BASE}/uploads/${g}`}
                                alt={`bukti-${i + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform .2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.transform = "scale(1.06)")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.transform = "scale(1)")
                                }
                                onError={(e) =>
                                  (e.target.parentElement.style.display =
                                    "none")
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: bd,
                    background: headerBg,
                    display: "flex",
                    justifyContent: "flex-end",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => setDetail(null)}
                    style={{
                      padding: "10px 24px",
                      background: dm ? "rgba(100,116,139,0.1)" : "#F1F5F9",
                      border: "2px solid #94A3B8",
                      color: DK.subtext,
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      borderRadius: "12px",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = dm
                        ? "#334155"
                        : "#F1F5F9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {lt.tutup}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}