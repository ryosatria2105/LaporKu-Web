// =============================================================
// FACTORY METHOD PATTERN  (Creational — refactoring.guru)
// -------------------------------------------------------------
// Referensi: https://github.com/rednafi/flask-factory
//
// Analoginya seperti Flask blueprint factory:
//   create_app() mendaftarkan api_a dan api_b sebagai modul terpisah.
//   Di sini, LaporanCreator memutuskan produk mana yang dibuat
//   berdasarkan kondisi data laporan.
//
// Struktur:
//   AbstractLaporanCreator  ← Abstract Creator (interface)
//     ├── ImageLaporanCreator    ← Concrete Creator A  (ada gambar)
//     ├── SimpleLaporanCreator   ← Concrete Creator B  (tanpa gambar)
//     └── StandardLaporanCreator ← Concrete Creator C  (default)
//
//   Setiap creator menghasilkan komponen React (Product)
//   yang sudah siap menerima props standar.
// =============================================================

import LaporanCard       from '../components/laporan/LaporanCard';
import LaporanCardImage  from '../components/laporan/LaporanCardImage';
import LaporanCardSimple from '../components/laporan/LaporanCardSimple';

// ─────────────────────────────────────────────────────────────
// Abstract Creator
// Mendefinisikan kontrak: setiap creator wajib punya createCard()
// ─────────────────────────────────────────────────────────────
class AbstractLaporanCreator {
  /**
   * Factory Method — subclass wajib override ini.
   * @returns {React.Component} Komponen kartu laporan
   */
  createCard() {
    throw new Error('createCard() harus diimplementasikan oleh subclass');
  }

  /**
   * Template method — logika umum yang pakai factory method.
   * Mirip cara Flask's create_app() pakai register_blueprint().
   * @param {Object} laporan - Data laporan
   * @returns {React.Component}
   */
  getCardComponent(laporan) {
    const CardComponent = this.createCard();
    return CardComponent;
  }

  /** Metadata tipe — untuk logging/debug */
  getType() {
    throw new Error('getType() harus diimplementasikan oleh subclass');
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator A — untuk laporan dengan foto/gambar
// Seperti api_a blueprint di Flask yang handle endpoint A
// ─────────────────────────────────────────────────────────────
class ImageLaporanCreator extends AbstractLaporanCreator {
  createCard() {
    return LaporanCardImage;
  }
  getType() {
    return 'image';
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator B — untuk laporan ringkas tanpa foto
// Seperti api_b blueprint di Flask yang handle endpoint B
// ─────────────────────────────────────────────────────────────
class SimpleLaporanCreator extends AbstractLaporanCreator {
  createCard() {
    return LaporanCardSimple;
  }
  getType() {
    return 'simple';
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator C — kartu standar dengan foto thumbnail kiri
// ─────────────────────────────────────────────────────────────
class StandardLaporanCreator extends AbstractLaporanCreator {
  createCard() {
    return LaporanCard;
  }
  getType() {
    return 'standard';
  }
}

// ─────────────────────────────────────────────────────────────
// LaporanFactory — entry point (seperti create_app() di Flask)
// Memutuskan creator mana yang dipakai berdasarkan data laporan.
// Komponen pemanggil tidak perlu tahu ada tiga jenis card.
// ─────────────────────────────────────────────────────────────
function hasGambar(laporan) {
  if (!laporan?.gambar) return false;
  try {
    const parsed = JSON.parse(laporan.gambar);
    return Array.isArray(parsed) ? parsed.length > 0 : true;
  } catch {
    return true; // string gambar biasa
  }
}

const LaporanFactory = {
  /** Tipe yang tersedia (konstanta publik) */
  TYPES: {
    IMAGE:    'image',
    STANDARD: 'standard',
    SIMPLE:   'simple',
  },

  /**
   * Buat creator yang sesuai berdasarkan data laporan.
   * @param {Object} laporan
   * @returns {AbstractLaporanCreator}
   */
  getCreator(laporan) {
    if (hasGambar(laporan)) {
      return new ImageLaporanCreator();
    }
    if (!laporan?.kategori) {
      return new SimpleLaporanCreator();
    }
    return new StandardLaporanCreator();
  },

  /**
   * Shortcut utama — langsung kembalikan komponen siap pakai.
   * Ini yang dipakai di DashboardUserPage: LaporanFactory.create(r)
   * @param {Object} laporan
   * @returns {React.Component}
   */
  create(laporan) {
    const creator = this.getCreator(laporan);
    return creator.getCardComponent(laporan);
  },

  /**
   * Kembalikan tipe string dari data laporan.
   * Berguna untuk debugging / logging.
   * @param {Object} laporan
   * @returns {string}
   */
  getType(laporan) {
    return this.getCreator(laporan).getType();
  },
};

export default LaporanFactory;
