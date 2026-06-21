import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import logoDark from '../assets/logo-darkmode.png';
import logoLight from '../assets/logo-lightmode.png';
import CookieBanner from '../components/CookieBanner';

/* ── Confirm Dialog Component ─────────────────────── */
function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.30)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'cdFadeIn .15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: '0 8px 32px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          animation: 'cdSlideUp .20s cubic-bezier(0.22,1,0.36,1)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div style={{ padding: '22px 22px 18px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', lineHeight: 1.3 }}>
            {dialog.title}
          </p>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            {dialog.message}
          </p>
        </div>
        <div style={{ height: '1px', background: '#F1F5F9' }} />
        <div style={{ display: 'flex' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px 16px',
              border: 'none', borderRight: '1px solid #F1F5F9',
              background: 'transparent', color: '#64748B',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Batalkan</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '13px 16px',
              border: 'none', background: 'transparent', color: '#2563EB',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Lanjutkan</button>
        </div>
      </div>
      <style>{`
        @keyframes cdFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes cdSlideUp { from { opacity:0; transform:translateY(10px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [overlayColor, setOverlayColor] = useState('#060C1D');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const handleThemeToggle = () => {
    if (themeTransitioning) return;
    setOverlayColor(darkMode ? '#F0F5FF' : '#060C1D');
    setThemeTransitioning(true);
    setTimeout(() => setDarkMode(prev => !prev), 200);
    setTimeout(() => setThemeTransitioning(false), 580);
  };
  const navbarRef = useRef(null);
  const twRef = useRef(null);
  const logo = darkMode ? logoDark : logoLight;
  const imgBorder = darkMode
  ? '2px solid rgb(255, 255, 255)'
  : '2px solid #08172c';

  const confirmNavigate = (destination, title, message) => {
    setMenuOpen(false);
    setConfirmDialog({ destination, title, message });
  };
  const handleConfirm = () => {
    const dest = confirmDialog.destination;
    setConfirmDialog(null);
    navigate(dest);
  };
  const handleCancel = () => setConfirmDialog(null);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    }
  }, [user, loading]);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        navbarRef.current.classList.toggle('stuck', window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = twRef.current;
    if (!el) return;
    const words = ['Sampaikan Masalah,', 'Laporkan Kejadian,', 'Suarakan Keluhan,'];
    let wi = 0, ci = 0, del = false;
    let timer;
    function type() {
      const w = words[wi];
      el.textContent = del ? w.slice(0, ci - 1) : w.slice(0, ci + 1);
      del ? ci-- : ci++;
      if (!del && ci === w.length) { del = true; timer = setTimeout(type, 1800); return; }
      if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      timer = setTimeout(type, del ? 52 : 82);
    }
    timer = setTimeout(type, 1300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let gsap, ScrollTrigger;
    import('gsap').then(g => {
      import('gsap/ScrollTrigger').then(st => {
        gsap = g.gsap;
        ScrollTrigger = st.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        function stTrigger(trigger, start = 'top 82%') {
          return { trigger, start, toggleActions: 'play none none none' };
        }

        gsap.fromTo('.nav-inner', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power2.out', delay: .1 });

        const heroTl = gsap.timeline({ delay: .3 });
        heroTl
          .fromTo('.hero-left h1', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, .2)
          .fromTo('.hero-left > p', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power2.out' }, .4)
          .fromTo('.hero-cta .btn-primary', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power2.out' }, .55)
          .fromTo('.hero-right', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: .95, ease: 'power3.out' }, .25);

        document.querySelectorAll('.sec-hd').forEach(el => {
          gsap.fromTo(el, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: .75, ease: 'power3.out', scrollTrigger: stTrigger(el, 'top 88%') });
        });

        // ── Feat-row animation: clean slide + fade (no 3D flip) ──
        document.querySelectorAll('.feat-row').forEach((row) => {
          const isRev = row.classList.contains('rev');
          const img = row.querySelector('.feat-img');
          const txt = row.querySelector('.feat-txt');
          const trigger = { trigger: row, start: 'top 80%', toggleActions: 'play none none none' };

          gsap.fromTo(img,
            { x: isRev ? 50 : -50, opacity: 0 },
            { x: 0, opacity: 1, duration: .85, ease: 'power3.out', scrollTrigger: trigger }
          );
          gsap.fromTo(txt,
            { x: isRev ? -50 : 50, opacity: 0 },
            { x: 0, opacity: 1, duration: .85, ease: 'power3.out', delay: .15, scrollTrigger: trigger }
          );
          const listItems = txt.querySelectorAll('.feat-list li');
          if (listItems.length) {
            gsap.fromTo(listItems, { y: 16, opacity: 0 }, {
              y: 0, opacity: 1, stagger: .1, duration: .45, ease: 'power2.out', delay: .35,
              scrollTrigger: { trigger: row, start: 'top 76%', toggleActions: 'play none none none' }
            });
          }
        });
        // ────────────────────────────────────────────────────────

        document.querySelectorAll('.tl-item').forEach((item, i) => {
          gsap.fromTo(item, { y: 36, opacity: 0 }, {
            y: 0, opacity: 1, duration: .7, ease: 'power3.out', delay: i * 0.18,
            scrollTrigger: { trigger: '.timeline', start: 'top 78%', toggleActions: 'play none none none' }
          });
        });

        gsap.fromTo('.about-img',
          { x: -56, opacity: 0 },
          { x: 0, opacity: 1, duration: .95, ease: 'power3.out', scrollTrigger: stTrigger('.about-grid', 'top 78%') }
        );
        gsap.fromTo('.about-txt',
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: .9, ease: 'power3.out', delay: .15, scrollTrigger: stTrigger('.about-grid', 'top 78%') }
        );

        document.querySelectorAll('.faq-item').forEach((item, i) => {
          gsap.fromTo(item, { scale: .94, opacity: 0 }, {
            scale: 1, opacity: 1, duration: .55, ease: 'back.out(1.2)', delay: i * 0.09,
            scrollTrigger: stTrigger('.faq-list', 'top 82%')
          });
        });

        gsap.fromTo('.cta-body',
          { scale: .95, y: 30, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: .85, ease: 'power3.out', scrollTrigger: stTrigger('.cta', 'top 78%') }
        );

        document.querySelectorAll('.footer-grid > *').forEach((el, i) => {
          gsap.fromTo(el, { y: 22, opacity: 0 }, {
            y: 0, opacity: 1, duration: .6, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: stTrigger('.footer-grid', 'top 90%')
          });
        });
      });
    });
    return () => {
      import('gsap/ScrollTrigger').then(st => {
        st.ScrollTrigger?.getAll().forEach(t => t.kill());
      });
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 66, behavior: 'smooth' });
    setMenuOpen(false);
  };

 const faqData = [
  { q: 'Apakah LaporKu gratis untuk digunakan?', a: 'Ya, LaporKu sepenuhnya gratis untuk semua pengguna. Tidak ada biaya tersembunyi atau langganan. Kami berkomitmen menjaga layanan ini tetap terbuka dan accessible bagi seluruh masyarakat Indonesia.' },
  { q: 'Berapa lama laporan saya ditindaklanjuti?', a: 'Waktu penanganan laporan bergantung pada kualitas laporan yang dikirimkan. Laporan dengan bukti yang jelas dan informasi lengkap akan diproses lebih cepat oleh admin. Sebaliknya, laporan yang kurang jelas atau minim bukti membutuhkan waktu verifikasi lebih lama. Pastikan laporan Anda disertai foto dan deskripsi yang detail untuk penanganan yang optimal.' },
  { q: 'Apakah data pribadi saya aman di LaporKu?', a: 'Keamanan data adalah prioritas utama kami. Password disimpan menggunakan metode hash dan seluruh data digunakan sesuai kebijakan privasi. Kami tidak menjual data kepada pihak ketiga manapun.' },
  { q: 'Jenis masalah apa yang bisa dilaporkan?', a: 'Berbagai jenis laporan fasilitas umum: jalan rusak, lampu jalan mati, drainase, sampah menumpuk, dan permasalahan fasilitas umum lainnya yang membutuhkan perhatian.' },
  { q: 'Apakah LaporKu tersedia di semua kota?', a: 'Saat ini LaporKu masih tersedia di wilayah Surabaya. Kami terus mengembangkan platform ini dan berencana memperluas layanan ke kota-kota lain di Indonesia secara bertahap. Pantau terus update dari kami!' },
];
  return (
    <div className={darkMode ? 'lp-dark' : 'lp-light'}>

      <ConfirmDialog dialog={confirmDialog} onConfirm={handleConfirm} onCancel={handleCancel} />

      {themeTransitioning && (
        <div className="theme-overlay" style={{ background: overlayColor }} />
      )}

      {/* NAVBAR */}
      <header className="navbar" id="navbar" ref={navbarRef}>
        <div className="nav-inner">
          <button onClick={() => scrollTo('#home')} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}>
<img src={logo} alt="LaporKu" style={{height:'clamp(44px, 8vw, 88px)', width:'auto', display:'block', flexShrink:0}} />          </button>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'4px'}}>
<nav className="nav-menu" style={{alignItems:'center',gap:'2px',marginRight:'8px'}}>              {[['#home','Home'],['#about','About Us'],['#fitur','Features'],['#cara-kerja','How It Works'],['#faq','FAQ']].map(([href,label]) => (
                <button key={href} onClick={() => scrollTo(href)} className="nm" style={{background:'none',border:'none',cursor:'pointer'}}>{label}</button>
              ))}
            </nav>
           <button
  className="theme-toggle-btn"
  onClick={handleThemeToggle}
  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  style={{
    width:'36px', height:'36px', borderRadius:'8px', border:'none',
    cursor: themeTransitioning ? 'default' : 'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    background: darkMode ? 'rgba(255,255,255,0.1)' : 'var(--gray-100)',
    transition:'background .2s',
  }}>
              <span className={themeTransitioning ? 'theme-icon-spin' : ''} style={{ display: 'flex' }}>
                {darkMode ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" width="18" height="18">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </span>
            </button>
          </div>
          <button className={`ham${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>

        {menuOpen && (
          <div className="mob-menu open">
            {[['#home','Home'],['#about','About Us'],['#fitur','Features'],['#cara-kerja','How It Works'],['#faq','FAQ']].map(([href,label]) => (
              <button key={href} onClick={() => scrollTo(href)} className="mob-lnk" style={{background:'none',border:'none',cursor:'pointer',textAlign:'left'}}>{label}</button>
            ))}
            <div className="mob-btns">
              <button onClick={() => confirmNavigate('/register', 'Daftar Akun', 'Anda akan diarahkan ke halaman pendaftaran akun baru.')} className="btn-daftar full">Daftar</button>
              <button onClick={() => confirmNavigate('/login', 'Masuk ke Akun', 'Anda akan diarahkan ke halaman login.')} className="btn-login full">Login</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-left">
          <div className="hero-text-wrap">
            <h1><span ref={twRef} className="tw-word"></span><span className="tw-cur">|</span><br /><em>Kami Tindaklanjuti</em></h1>
            <p>LaporKu adalah platform digital untuk melaporkan permasalahan fasilitas umum di sekitar Anda secara mudah, cepat, dan transparan.</p>
            <div className="hero-cta">
              <button onClick={() => confirmNavigate('/register', 'Buat Laporan', 'Anda perlu mendaftar terlebih dahulu untuk mulai membuat laporan.')} className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                Buat Laporan Sekarang
              </button>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img src="/assets/city.jpg" alt="Kota Indonesia" />
          <div className="hero-fade"></div>
        </div>
        <div className="feat-strip feat-strip--inhero">
          <div className="full-wrap">
            <div className="strip-grid">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, title: 'Mudah & Cepat', desc: 'Proses pelaporan yang mudah hanya dalam beberapa langkah.' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Aman & Terpercaya', desc: 'Data Anda kami jaga kerahasiaan dan keamanannya.' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Transparan', desc: 'Pantau perkembangan laporan secara real-time.' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: 'Bersama untuk Perubahan', desc: 'Partisipasi Anda membantu membangun lingkungan lebih baik.' },
              ].map((item, i) => (
                <div key={i} className="strip-item">
                  <div className="strip-ic">{item.icon}</div>
                  <div><strong>{item.title}</strong><span>{item.desc}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="full-wrap">
          <div className="about-grid">
            <div className="about-img">
              <div className="about-frame">
                <img
                  src="/assets/about-us.jpeg"
                  alt="Tim LaporKu"
                 style={{border: imgBorder, borderRadius:'16px', outline:'none'}}

                />
                <div className="af-float"></div>
              </div>
            </div>
            <div className="about-txt">
              <span className="tag">Tentang Kami</span>
              <h2>Kami Hadir untuk<br /><span className="c-blue">Suara Warga</span></h2>
              <p>LaporKu hadir dari kepedulian terhadap masalah infrastruktur dan pelayanan publik yang sering terabaikan. Kami percaya setiap warga berhak mendapatkan lingkungan yang layak dan responsif. Melalui LaporKu, masyarakat bisa menyampaikan laporan dengan mudah dan cepat.</p>
              <p>Kami menghubungkan warga dengan pemerintah dan instansi terkait secara transparan dan efisien. Setiap laporan akan diverifikasi dan diteruskan ke pihak yang berwenang. LaporKu hadir agar setiap suara didengar dan setiap masalah fasilitas umum bisa segera ditangani.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section className="features" id="fitur">
        <div className="full-wrap">
          <div className="sec-hd">
            <span className="tag">Fitur Unggulan</span>
            <h2>Semua yang Kamu Butuhkan<br /><span className="c-blue">Ada di Sini</span></h2>
            <p>Dirancang untuk kemudahan warga, kecepatan respons, dan transparansi penuh dari awal hingga akhir.</p>
          </div>
          <div className="feat-row">
            <div className="feat-img"><img src="/assets/lapor-basis-lokasi.png" alt="Lapor Berbasis Lokasi" style={{border: imgBorder, borderRadius:'16px', outline:'none'}} 
            
            /></div>
            <div className="feat-txt">
              <span className="feat-no">01</span>
              <h3>Lapor Berbasis Lokasi</h3>
              <p>Temukan dan laporkan permasalahan fasilitas umum di sekitar Anda. Sistem meminta izin akses lokasi lalu mendeteksi koordinat secara otomatis sehingga laporan langsung diarahkan ke instansi yang berwenang di wilayah tersebut.</p>
              <ul className="feat-list"><li>Deteksi lokasi otomatis via GPS</li><li>Diteruskan ke instansi wilayah terkait</li><li>Input lokasi manual jika diperlukan</li></ul>
            </div>
          </div>
          <div className="feat-row rev">
            <div className="feat-img"><img src="/assets/uplod-bukti.png" alt="Upload Foto & Bukti" style={{border: imgBorder, borderRadius:'16px', outline:'none'}} /></div>
            <div className="feat-txt">
              <span className="feat-no">02</span>
              <h3>Upload Foto Bukti</h3>
              <p>Perkuat laporan Anda dengan melampirkan foto sebagai bukti visual kondisi di lapangan. Foto dapat diambil langsung dari kamera atau dipilih dari galeri perangkat, dengan preview sebelum dikirim.</p>
              <ul className="feat-list"><li>Ambil foto langsung dari kamera</li><li>Pilih dari galeri perangkat</li><li>Preview foto sebelum dikirim</li></ul>
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-img"><img src="/assets/notifikasi.png" alt="Notifikasi Status" style={{border: imgBorder, borderRadius:'16px', outline:'none'}} /></div>
            <div className="feat-txt">
              <span className="feat-no">03</span>
              <h3>Notifikasi Status Real-time</h3>
              <p>Dapatkan notifikasi otomatis setiap kali terjadi perubahan pada laporan Anda — mulai dari status diproses, ada komentar baru dari admin, hingga laporan selesai ditangani. Tidak perlu cek manual.</p>
              <ul className="feat-list"><li>Notifikasi perubahan status laporan</li><li>Info komentar baru dari admin</li><li>Pembaruan aktivitas sistem secara otomatis</li></ul>
            </div>
          </div>
          <div className="feat-row rev">
            <div className="feat-img"><img src="/assets/tracking-laporan.png" alt="Tracking Laporan" style={{border: imgBorder, borderRadius:'16px', outline:'none'}} /></div>
            <div className="feat-txt">
              <span className="feat-no">04</span>
              <h3>Tracking Laporan Transparan</h3>
              <p>Pantau seluruh perjalanan laporan Anda melalui dashboard riwayat laporan. Setiap perubahan status — dari menunggu, diproses, hingga selesai atau ditolak — tercatat lengkap beserta waktunya.</p>
              <ul className="feat-list"><li>Riwayat status laporan lengkap</li><li>Histori perubahan dengan catatan waktu</li><li>Akses laporan kapan saja</li></ul>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="howto" id="cara-kerja">
        <div className="howto-bg"><img src="/assets/city.jpg" alt="" /><div className="howto-ov"></div></div>
        <div className="full-wrap">
          <div className="sec-hd light">
            <span className="tag light">Cara Kerja</span>
            <h2>4 Tahap Utama<br /><span className="c-sky">yang Simpel & Transparan</span></h2>
            <p>Dari melihat masalah hingga masalah terselesaikan — prosesnya cepat dan dapat dipantau secara real-time.</p>
          </div>
          <div className="timeline">
            {[
              { num: '01', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Buat Laporan', desc: 'Isi judul, deskripsi, kategori, dan lokasi kejadian. Sistem mendeteksi lokasi Anda secara otomatis untuk memastikan laporan diarahkan ke instansi yang tepat.', done: false },
              { num: '02', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>, title: 'Upload Foto Bukti', desc: 'Ambil foto langsung dari kamera atau pilih dari galeri perangkat sebagai bukti visual. Foto membantu admin memahami kondisi lapangan sebelum melakukan tindak lanjut.', done: false },
              { num: '03', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Diverifikasi Admin', desc: 'Admin memverifikasi laporan yang masuk dan mengubah status sesuai progres penanganan. Anda dapat berkomunikasi langsung dengan admin melalui fitur komentar.', done: false },
              { num: '04', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Masalah Diselesaikan', desc: 'Anda mendapat notifikasi otomatis saat status laporan berubah. Seluruh riwayat perubahan status tersimpan dan dapat dilihat kapan saja melalui dashboard.', done: true },
            ].map((item, i) => (
              <div key={i} className="tl-item">
                <div className="tl-left">
                  <div className="tl-num">{item.num}</div>
                  {i < 3 && <div className="tl-connector"></div>}
                </div>
                <div className="tl-right">
                  <div className={`tl-ico${item.done ? ' done' : ''}`}>{item.icon}</div>
                  <div className="tl-content"><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="full-wrap">
          <div className="sec-hd">
            <span className="tag">FAQ</span>
            <h2>Pertanyaan yang <span className="c-blue">Sering Ditanyakan</span></h2>
            <p>Tidak menemukan jawaban? Hubungi kami langsung.</p>
          </div>
          <div className="faq-list">
            {faqData.map((item, i) => (
              <div key={i} className={`faq-item${faqOpen === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {item.q}
                  <span className="farr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></span>
                </button>
                <div className="faq-a"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
          <div className="faq-contact">
            <p>Masih punya pertanyaan?</p>
            <div className="fc-links">
              <a href="https://wa.me/6287870165060" target="_blank" rel="noopener noreferrer" className="fcl">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.871 9.871 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href="mailto:ryosatria2105@gmail.com" className="fcl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email Kami
              </a>
              <a href="https://www.instagram.com/laporku_com/" target="_blank" rel="noopener noreferrer" className="fcl">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="cta">
        <div className="cta-bg"><img src="/assets/city.jpg" alt="" /><div className="cta-ov"></div></div>
        <div className="full-wrap">
          <div className="cta-body">
            <h2>Bergabung & Mulai<br /><span>Laporkan Sekarang</span></h2>
            <p>Daftar gratis dan jadilah bagian dari gerakan masyarakat yang peduli terhadap fasilitas umum di sekitarnya.</p>
            <div className="cta-btns">
              <button onClick={() => confirmNavigate('/register', 'Daftar Akun', 'Anda akan diarahkan ke halaman pendaftaran akun baru.')} className="btn-white lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Daftar Sekarang
              </button>
              <button onClick={() => confirmNavigate('/login', 'Masuk ke Akun', 'Anda akan diarahkan ke halaman login.')} className="btn-cta-login lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="full-wrap">
          <div className="footer-grid">
            <div className="fbrand">
              <button onClick={() => scrollTo('#home')} style={{background:'none',border:'none',cursor:'pointer',marginBottom:'14px',padding:0}}>
                <img src={logo} alt="LaporKu" style={{height:'46px', width:'auto', display:'block'}} />
              </button>
              <p>Platform pelaporan masyarakat yang transparan, cepat, dan berdampak nyata untuk Indonesia yang lebih baik.</p>
              <div className="fsoc">
                <a href="https://wa.me/6287870165060" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.871 9.871 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                <a href="https://www.instagram.com/laporku_com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
                <a href="mailto:ryosatria2105@gmail.com" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></a>
              </div>
            </div>
            <div className="fcol"><h5>Navigasi</h5><ul><li><button onClick={() => scrollTo('#home')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Beranda</button></li><li><button onClick={() => scrollTo('#about')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>About Us</button></li><li><button onClick={() => scrollTo('#fitur')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Fitur</button></li><li><button onClick={() => scrollTo('#cara-kerja')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Cara Kerja</button></li><li><button onClick={() => scrollTo('#faq')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>FAQ</button></li></ul></div>
            <div className="fcol"><h5>Layanan</h5><ul><li><button onClick={() => confirmNavigate('/register', 'Buat Laporan', 'Anda perlu mendaftar terlebih dahulu untuk mulai membuat laporan.')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Buat Laporan</button></li><li><button onClick={() => confirmNavigate('/login', 'Cek Status', 'Login terlebih dahulu untuk mengecek status laporan Anda.')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Cek Status</button></li><li><button onClick={() => confirmNavigate('/login', 'Riwayat Laporan', 'Login terlebih dahulu untuk melihat riwayat laporan Anda.')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Riwayat Laporan</button></li><li><button onClick={() => confirmNavigate('/login', 'Dashboard', 'Login terlebih dahulu untuk mengakses dashboard.')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Dashboard</button></li></ul></div>
            <div className="fcol"><h5>Kontak</h5><ul><li><a href="https://wa.me/6287870165060" target="_blank" rel="noopener noreferrer">+62 878-7016-5060</a></li><li><a href="mailto:ryosatria2105@gmail.com">ryosatria2105@gmail.com</a></li><li><a href="https://www.instagram.com/laporku_com/" target="_blank" rel="noopener noreferrer">@laporku_com</a></li><li><button onClick={() => scrollTo('#faq')} style={{background:'none',border:'none',cursor:'pointer',color:'#475569',fontSize:'.875rem'}}>Pusat Bantuan</button></li></ul></div>
          </div>
          <div className="footer-bot">
            <p>© 2025 LaporKu. Seluruh Hak Cipta Dilindungi.</p>
            <p className="dev">Developed by Ryo</p>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  ); 
}