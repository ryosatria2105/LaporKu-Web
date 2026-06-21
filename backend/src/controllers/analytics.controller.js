import { prisma } from '../lib/prisma.js';

// ── Parse browser dari user agent ─────────────────────────────
function parseBrowser(ua) {
  if (!ua) return null;
  if (ua.includes('Edg/'))     return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome/'))  return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
  return 'Other';
}

// ── Parse OS dari user agent ──────────────────────────────────
function parseOS(ua) {
  if (!ua) return null;
  if (ua.includes('Windows NT 10') || ua.includes('Windows NT 11')) return 'Windows 10/11';
  if (ua.includes('Windows NT'))   return 'Windows';
  if (ua.includes('Android'))      return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Mac OS X'))     return 'macOS';
  if (ua.includes('Linux'))        return 'Linux';
  return 'Other';
}

// ─────────────────────────────────────────────────────────────
// Cek apakah IP adalah private / loopback
// ─────────────────────────────────────────────────────────────
function isPrivateIp(ip) {
  if (!ip) return true;
  const clean = ip.replace('::ffff:', '');
  return (
    clean === '::1' ||
    clean === '127.0.0.1' ||
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.2') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.') ||
    clean === 'localhost'
  );
}

// ─────────────────────────────────────────────────────────────
// Fetch IP publik server (dipakai saat dev dengan IP private)
// Cache 10 menit agar tidak spam request
// ─────────────────────────────────────────────────────────────
let _cachedPublicIp = null;
let _cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 menit

async function getPublicServerIp() {
  const now = Date.now();
  if (_cachedPublicIp && now - _cacheTime < CACHE_TTL) return _cachedPublicIp;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const { ip } = await res.json();
    _cachedPublicIp = ip;
    _cacheTime = now;
    return ip;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Resolusi IP → negara & kota via ip-api.com (free, no key)
// Saat development (IP private), otomatis fetch IP publik server
// ─────────────────────────────────────────────────────────────
async function resolveGeo(ip) {
  try {
    let targetIp = ip?.replace('::ffff:', '') || null;

    // Saat dev/localhost: pakai IP publik server agar city/ISP terisi
    if (isPrivateIp(targetIp)) {
      const publicIp = await getPublicServerIp();
      if (!publicIp) {
        // Fallback lokal jika tidak ada koneksi ke ipify
        return { countryCode: 'ID', country: 'Indonesia', city: 'Local' };
      }
      targetIp = publicIp;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `http://ip-api.com/json/${targetIp}?fields=status,countryCode,country,city,isp`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 'success') return null;
    return {
      countryCode: data.countryCode || null,
      country:     data.country     || null,
      city:        data.city        || null,
      isp:         data.isp         || null,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Reverse geocode lat/lng → city + countryCode via Nominatim (free, no key)
// Dipakai saat frontend kirim koordinat browser (lebih akurat dari IP)
// ─────────────────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'LaporKu-App/1.0' },
      }
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;
    const addr = data.address || {};
    // city: coba beberapa field dari Nominatim (berbeda tiap negara)
    const city =
      addr.city || addr.town || addr.village ||
      addr.municipality || addr.county || addr.state_district || null;
    const countryCode = (addr.country_code || '').toUpperCase() || null;
    return { city, countryCode };
  } catch {
    return null;
  }
}

export async function trackVisit(req, res) {
  try {
    const { session_id, page_visited, referrer, consent_given, device_type, language, visitor_key, latitude, longitude } = req.body;
    const ua       = req.headers['user-agent'] || null;
    const clientIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();

    if (!consent_given)
      return res.status(200).json({ success: true, message: 'Consent not given, not tracked' });

    const hasCoords = latitude != null && longitude != null &&
      !isNaN(Number(latitude)) && !isNaN(Number(longitude));

    // Prioritas: koordinat browser (akurat) → fallback IP-based
    const geoPromise = hasCoords
      ? reverseGeocode(Number(latitude), Number(longitude))
      : resolveGeo(clientIp);

    const log = await prisma.visitorLog.create({
      data: {
        sessionId:    session_id,
        userAgent:    ua,
        ipAddress:    clientIp,
        referrer:     referrer     || null,
        pageVisited:  page_visited,
        consentGiven: true,
        deviceType:   device_type  || null,
        browserName:  parseBrowser(ua),
        osName:       parseOS(ua),
        language:     language     || null,
        visitorKey:   visitor_key  || null,
        lastSeenAt:   new Date(),
      },
    });

    // Update geo setelah record dibuat (fire-and-forget)
    geoPromise.then(async (geo) => {
      if (!geo) return;
      await prisma.visitorLog.update({
        where: { id: log.id },
        data: {
          countryCode: geo.countryCode || null,
          city:        geo.city        || null,
          ispName:     geo.isp         || null,
        },
      }).catch(() => {});
    });

    return res.status(201).json({ success: true, message: 'Visit tracked', sessionId: log.sessionId });
  } catch (err) {
    console.error('[ANALYTICS trackVisit]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateDuration(req, res) {
  try {
    const { sessionId } = req.params;
    const { duration_sec } = req.body;
    if (duration_sec == null || isNaN(Number(duration_sec))) {
      return res.status(400).json({ success: false, message: 'duration_sec diperlukan' });
    }
    await prisma.visitorLog.updateMany({
      where: { sessionId },
      data: { durationSec: Math.round(Number(duration_sec)) },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('[ANALYTICS updateDuration]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/analytics/visitors — summary grafik pengunjung
// ─────────────────────────────────────────────────────────────
export async function getVisitorStats(req, res) {
  try {
    // ── Poin 13: Semua query dijalankan paralel (Promise.all) ──
    // Sebelumnya: 7 query COUNT harian berjalan sequential (loop await)
    // Sekarang: 1 raw SQL GROUP BY + Promise.all → response < 3 detik

    // Build 7-day date range
    const days = Array.from({ length: 7 }, (_, i) => {
      const from = new Date();
      from.setDate(from.getDate() - (6 - i));
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return { from, to, label: from.toLocaleDateString('id-ID', { weekday: 'short' }), tanggal: from.toISOString().split('T')[0] };
    });

    const sevenDaysAgo = days[0].from;

    const [total, harianRaw, perNegara, perDevice] = await Promise.all([
      prisma.visitorLog.count(),
      // Single query: group by date untuk 7 hari — jauh lebih cepat dari 7x COUNT
      prisma.$queryRaw`
        SELECT
          DATE(created_at AT TIME ZONE 'Asia/Jakarta') AS tgl,
          COUNT(*)::int AS count
        FROM visitor_logs
        WHERE created_at >= ${sevenDaysAgo}
        GROUP BY tgl
        ORDER BY tgl ASC
      `,
      prisma.visitorLog.groupBy({
        by: ['countryCode'],
        _count: { countryCode: true },
        orderBy: { _count: { countryCode: 'desc' } },
        take: 10,
      }),
      prisma.visitorLog.groupBy({
        by: ['deviceType'],
        _count: { deviceType: true },
        orderBy: { _count: { deviceType: 'desc' } },
      }),
    ]);

    // Merge raw result ke format harian lengkap (isi 0 untuk hari tanpa data)
    const harianMap = Object.fromEntries(
      harianRaw.map(r => [r.tgl.toISOString().split('T')[0], r.count])
    );
    const harian = days.map(d => ({
      label:   d.label,
      tanggal: d.tanggal,
      count:   harianMap[d.tanggal] ?? 0,
    }));

    return res.json({
      success: true,
      data: { total, harian, perNegara, perDevice },
    });
  } catch (err) {
    console.error('[ANALYTICS getVisitorStats]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/analytics/visitors/table — tabel pengunjung
// ─────────────────────────────────────────────────────────────
export async function getVisitorTable(req, res) {
  try {
    const page    = Math.max(1, parseInt(req.query.page     || '1'));
    const perPage = Math.min(100, parseInt(req.query.per_page || '20'));
    const skip    = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      prisma.visitorLog.count(),
      prisma.visitorLog.findMany({
        select: {
          id:          true,
          sessionId:   true,
          pageVisited: true,
          deviceType:  true,
          countryCode: true,
          city:        true,
          browserName: true,
          osName:      true,
          ispName:     true,
          language:    true,
          referrer:    true,
          visitorKey:  true,
          lastSeenAt:  true,
          durationSec: true,
          createdAt:   true,
          // ipAddress sengaja tidak diekspos ke frontend
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
    ]);

    return res.json({
      success: true,
      data: rows,
      meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
    });
  } catch (err) {
    console.error('[ANALYTICS getVisitorTable]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/analytics/visitors/csv — export CSV pengunjung
// ─────────────────────────────────────────────────────────────
export async function exportVisitorCsv(req, res) {
  try {
    const rows = await prisma.visitorLog.findMany({
      select: {
        id:          true,
        pageVisited: true,
        deviceType:  true,
        countryCode: true,
        city:        true,
        ispName:     true,
        durationSec: true,
        createdAt:   true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const header = 'ID,Halaman,Device,Negara,Kota,ISP,Durasi (detik),Waktu Kunjungan\n';
    const body = rows.map(r =>
      [
        r.id,
        `"${(r.pageVisited || '').replace(/"/g, '""')}"`,
        r.deviceType  || '-',
        r.countryCode || '-',
        r.city        || '-',
        `"${(r.ispName || '-').replace(/"/g, '""')}"`,
        r.durationSec ?? '-',
        new Date(r.createdAt).toLocaleString('id-ID'),
      ].join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pengunjung-${Date.now()}.csv"`);
    return res.send('\uFEFF' + header + body);
  } catch (err) {
    console.error('[ANALYTICS exportVisitorCsv]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}