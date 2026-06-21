import { useState, useEffect, useRef } from 'react';
import { analyticsService } from '../services/api.service';

// ── AES-GCM Encryption Helpers (Web Crypto API) ──────────────
// crypto.subtle HANYA tersedia di "Secure Context":
//   ✅ https://...
//   ✅ http://localhost / http://127.0.0.1
//   ❌ http://<IP>:port  ← tidak dianggap secure oleh browser
// Jika tidak tersedia, fallback ke Base64 biasa agar tombol tetap berfungsi.
const STORAGE_KEY_RAW = 'laporku-storage-key-v1-32bytes!!';

const isCryptoAvailable =
  typeof crypto !== 'undefined' &&
  typeof crypto.subtle !== 'undefined' &&
  typeof crypto.randomUUID === 'function';

async function getKey() {
  const raw = new TextEncoder().encode(STORAGE_KEY_RAW.slice(0, 32));
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptValue(plaintext) {
  // Fallback: jika crypto.subtle tidak tersedia (HTTP via IP), simpan sebagai Base64
  if (!isCryptoAvailable) {
    return btoa(unescape(encodeURIComponent(plaintext)));
  }
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const merged = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
  merged.set(iv, 0);
  merged.set(new Uint8Array(cipherBuf), iv.byteLength);
  return btoa(String.fromCharCode(...merged));
}

async function decryptValue(b64) {
  // Fallback: decode Base64 biasa
  if (!isCryptoAvailable) {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch {
      return null;
    }
  }
  try {
    const key = await getKey();
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = bytes.slice(0, 12);
    const cipher = bytes.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  } catch { return null; }
}

// Buat UUID yang kompatibel di semua environment
function generateUUID() {
  if (isCryptoAvailable) return crypto.randomUUID();
  // Fallback manual UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'necessary',
    label: 'Necessary',
    desc: 'Cookie yang diperlukan agar website berfungsi. Tidak dapat dinonaktifkan.',
    required: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    desc: 'Membantu kami memahami cara pengunjung berinteraksi dengan website.',
    required: false,
  },
  {
    id: 'preferences',
    label: 'Preferences',
    desc: 'Menyimpan preferensi tampilan dan pengaturan pengguna.',
    required: false,
  },
];

// ── Duration Tracker ──────────────────────────────────────────
// Mengirim durasi saat user meninggalkan halaman atau tab tersembunyi
function useDurationTracker(sessionId, analyticsEnabled) {
  const startTimeRef = useRef(Date.now());
  const sentRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !analyticsEnabled) return;

    // Reset timer saat sessionId berubah
    startTimeRef.current = Date.now();
    sentRef.current = false;

    const sendDuration = () => {
      if (sentRef.current) return;
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSec < 1) return;
      sentRef.current = true;

      // Gunakan sendBeacon agar tidak gagal saat tab tutup
      // URL harus absolut untuk sendBeacon — gunakan origin yang sama dengan halaman
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const url = `${baseUrl}/api/v1/analytics/visit/${sessionId}/duration`;
      const blob = new Blob(
        [JSON.stringify({ duration_sec: durationSec })],
        { type: 'application/json' }
      );
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback: fetch keepalive
        fetch(url, {
          method: 'PATCH',
          body: JSON.stringify({ duration_sec: durationSec }),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Kirim durasi saat: tab tersembunyi, atau halaman di-unload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDuration();
        // Reset agar bisa mulai lagi saat kembali ke tab
        setTimeout(() => {
          startTimeRef.current = Date.now();
          sentRef.current = false;
        }, 50);
      }
    };

    const handleBeforeUnload = () => sendDuration();

    // Ping duration setiap 60 detik supaya data masuk tanpa harus tutup tab
    const pingInterval = setInterval(() => {
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSec < 10) return;
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const url = `${baseUrl}/api/v1/analytics/visit/${sessionId}/duration`;
      fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({ duration_sec: durationSec }),
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }, 60000); // ping tiap 60 detik

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(pingInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, analyticsEnabled]);
}
// ─────────────────────────────────────────────────────────────

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true,
    analytics: false,
    preferences: false,
  });

  // Track session untuk duration setelah consent diberikan
  const [trackingSession, setTrackingSession] = useState(null);
  useDurationTracker(trackingSession, consent.analytics);

  // Deteksi dark mode dari localStorage (sama seperti DashboardAdminPage)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('laporku_dark') === 'true'
  );

  useEffect(() => {
    // Sync dark mode jika diubah dari halaman lain
    const onStorage = (e) => {
      if (e.key === 'laporku_dark') setDarkMode(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    (async () => {
      const raw = localStorage.getItem('laporku_consent');
      if (!raw) { setShow(true); return; }
      const val = await decryptValue(raw);
      if (val === null) { setShow(true); return; }
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object') {
          const merged = { necessary: true, ...parsed };
          setConsent(merged);
          // Kalau analytics sudah disetujui, mulai tracking duration
          if (merged.analytics) {
            const rawSession = localStorage.getItem('laporku_session');
            if (rawSession) {
              const sessionId = await decryptValue(rawSession).catch(() => null);
              if (sessionId) setTrackingSession(sessionId);
            }
          }
        } else {
          setShow(true);
        }
      } catch { setShow(true); }
    })();
  }, []);

  // Minta lokasi browser untuk city akurat — resolve 5s, tidak blocking jika ditolak
  const getBrowserCity = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      const timer = setTimeout(() => resolve(null), 5000);
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        ()    => { clearTimeout(timer); resolve(null); },
        { timeout: 5000, maximumAge: 600000 }
      );
    });

  const saveConsent = async (consentData) => {
    const sessionId = generateUUID();
    const payload = { necessary: true, ...consentData };
    const [encConsent, encSession] = await Promise.all([
      encryptValue(JSON.stringify(payload)),
      encryptValue(sessionId),
    ]);
    localStorage.setItem('laporku_consent', encConsent);
    localStorage.setItem('laporku_session', encSession);

    if (payload.analytics) {
      let visitorKey = localStorage.getItem('laporku_visitor_key');
      if (!visitorKey) {
        visitorKey = generateUUID();
        localStorage.setItem('laporku_visitor_key', visitorKey);
      }

      // Coba dapat koordinat browser untuk city yang akurat
      // Jika user tolak permission → coords null → city dari IP seperti biasa
      const coords = await getBrowserCity();

      try {
        await analyticsService.trackVisit({
          session_id:    sessionId,
          page_visited:  window.location.pathname,
          referrer:      document.referrer || null,
          consent_given: true,
          device_type:   window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          language:      navigator.language || null,
          visitor_key:   visitorKey,
          latitude:      coords ? coords.lat : null,
          longitude:     coords ? coords.lng : null,
        });
        setTrackingSession(sessionId);
      } catch { /* non-blocking */ }
    }

    setConsent(payload);
    setShow(false);
    setShowCustomize(false);
  };

  const handleAcceptAll  = () => saveConsent({ necessary: true, analytics: true, preferences: true });
  const handleDeclineAll = () => saveConsent({ necessary: true, analytics: false, preferences: false });
  const handleSaveCustom = () => saveConsent(consent);

  if (!show) return null;

  // Warna teks mengikuti dark mode
  const textPrimary   = darkMode ? '#F1F5F9' : '#1F2937';
  const textSecondary = darkMode ? '#CBD5E1' : '#6B7280';
  const bgBanner      = darkMode ? '#1E293B' : '#ffffff';
  const borderBanner  = darkMode ? '1px solid #334155' : '1px solid #E5E7EB';
  const bgModal       = darkMode ? '#1E293B' : '#ffffff';
  const bgModalHeader = darkMode ? '#273449' : '#F9FAFB';
  const borderModal   = darkMode ? '1px solid #334155' : '1px solid #F3F4F6';
  const toggleOffBg   = darkMode ? '#334155' : '#D1D5DB';

  return (
    <>
      {/* ── Banner utama ── */}
      {!showCustomize && (
        <div
          className="fixed bottom-0 left-0 right-0 shadow-lg p-4"
          style={{
            zIndex: 999999,
            background: bgBanner,
            borderTop: borderBanner,
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>
                Kami menggunakan cookies 🍪
              </p>
              <p className="text-xs" style={{ color: textSecondary }}>
                Kami menggunakan cookies untuk meningkatkan pengalaman Anda dan menganalisis trafik pengunjung.{' '}
                <button
                  onClick={() => setShowCustomize(true)}
                  className="underline hover:opacity-75 font-medium"
                  style={{ color: '#3B82F6' }}
                >
                  Kustomisasi pilihan
                </button>
              </p>
            </div>
            <div className="flex gap-3 shrink-0 flex-wrap">
              <button
                onClick={handleDeclineAll}
                style={{
                  minHeight: '44px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #475569' : '1px solid #D1D5DB',
                  background: 'transparent',
                  color: textSecondary,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Tolak
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                style={{
                  minHeight: '44px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #475569' : '1px solid #D1D5DB',
                  background: 'transparent',
                  color: textSecondary,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Kustomisasi
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  minHeight: '44px',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  background: '#16A34A',
                  color: '#fff',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Terima Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Customize ── */}
      {showCustomize && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
          style={{ zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div
            style={{
              background: bgModal,
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              width: '100%',
              maxWidth: '440px',
              overflow: 'visible',
              border: borderBanner,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: borderModal,
                background: bgModalHeader,
                borderRadius: '16px 16px 0 0',
              }}
            >
              <p style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: 0 }}>
                Pengaturan Cookie
              </p>
              <p style={{ fontSize: '12px', color: textSecondary, margin: '4px 0 0' }}>
                Pilih kategori cookie yang ingin Anda izinkan.
              </p>
            </div>

            {/* Categories */}
            <div
              style={{
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxHeight: '240px',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: textPrimary, margin: 0 }}>
                      {cat.label}
                      {cat.required && (
                        <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 400, color: textSecondary, fontStyle: 'italic' }}>
                          Selalu aktif
                        </span>
                      )}
                    </p>
                    <p style={{ fontSize: '12px', color: textSecondary, margin: '4px 0 0', lineHeight: 1.5 }}>
                      {cat.desc}
                    </p>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    disabled={cat.required}
                    onClick={() => !cat.required && setConsent(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      height: '24px',
                      width: '44px',
                      flexShrink: 0,
                      borderRadius: '9999px',
                      border: '2px solid transparent',
                      transition: 'background-color 0.2s',
                      cursor: cat.required ? 'not-allowed' : 'pointer',
                      opacity: cat.required ? 0.7 : 1,
                      background: (cat.required || consent[cat.id]) ? '#16A34A' : toggleOffBg,
                      outline: 'none',
                    }}
                    aria-pressed={consent[cat.id]}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        height: '20px',
                        width: '20px',
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transform: (cat.required || consent[cat.id]) ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                        pointerEvents: 'none',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: borderModal,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleDeclineAll}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    cursor: 'pointer',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: darkMode ? '1px solid #475569' : '1px solid #D1D5DB',
                    background: 'transparent',
                    color: textSecondary,
                    touchAction: 'manipulation',
                  }}
                >
                  Tolak Semua
                </button>
                <button
                  onClick={handleSaveCustom}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    cursor: 'pointer',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: '1px solid #16A34A',
                    background: 'transparent',
                    color: '#16A34A',
                    touchAction: 'manipulation',
                  }}
                >
                  Simpan Pilihan
                </button>
                <button
                  onClick={handleAcceptAll}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    cursor: 'pointer',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    border: 'none',
                    background: '#16A34A',
                    color: '#fff',
                    touchAction: 'manipulation',
                  }}
                >
                  Terima Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}