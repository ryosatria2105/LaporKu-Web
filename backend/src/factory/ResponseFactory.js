// =============================================================
// FACTORY METHOD PATTERN — Response Factory  (Backend)
// -------------------------------------------------------------
// Referensi: https://github.com/rednafi/flask-factory
//
// Flask's create_app() menstandarkan cara app dibuat.
// Di sini, ResponseFactory menstandarkan format response API.
//
// Setiap controller tidak perlu tulis { success, data, message }
// manual — cukup pakai ResponseFactory.success() / .error().
//
// Analoginya:
//   create_app()         → ResponseFactory
//   register_blueprint() → .success() / .error() / .paginated()
// =============================================================

// ─────────────────────────────────────────────────────────────
// Abstract Response Creator
// ─────────────────────────────────────────────────────────────
class AbstractResponseCreator {
  /**
   * Factory Method — subclass wajib override.
   * @param {*} payload
   * @returns {Object} response body
   */
  createResponse(payload) {
    throw new Error('createResponse() harus diimplementasikan');
  }

  /**
   * Template method — kirim response via Express res.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {*} payload
   */
  send(res, statusCode, payload) {
    return res.status(statusCode).json(this.createResponse(payload));
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator A — response sukses dengan data
// ─────────────────────────────────────────────────────────────
class SuccessResponseCreator extends AbstractResponseCreator {
  createResponse({ message = 'Berhasil', data = null } = {}) {
    return {
      success: true,
      message,
      ...(data !== null && { data }),
      timestamp: new Date().toISOString(),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator B — response error
// ─────────────────────────────────────────────────────────────
class ErrorResponseCreator extends AbstractResponseCreator {
  createResponse({ message = 'Terjadi kesalahan', errors = null } = {}) {
    return {
      success: false,
      message,
      ...(errors !== null && { errors }),
      timestamp: new Date().toISOString(),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Creator C — response data dengan pagination
// ─────────────────────────────────────────────────────────────
class PaginatedResponseCreator extends AbstractResponseCreator {
  createResponse({ message = 'Berhasil', data = [], meta = {} } = {}) {
    return {
      success: true,
      message,
      data,
      meta: {
        total:    meta.total    ?? data.length,
        page:     meta.page     ?? 1,
        perPage:  meta.perPage  ?? data.length,
        lastPage: meta.lastPage ?? 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// ResponseFactory — entry point (seperti create_app() di Flask)
// ─────────────────────────────────────────────────────────────
const ResponseFactory = {
  /**
   * Kirim response sukses.
   * @param {import('express').Response} res
   * @param {*} data
   * @param {string} message
   * @param {number} status HTTP status code
   */
  success(res, data = null, message = 'Berhasil', status = 200) {
    const creator = new SuccessResponseCreator();
    return creator.send(res, status, { message, data });
  },

  /**
   * Kirim response error.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {number} status HTTP status code
   * @param {*} errors
   */
  error(res, message = 'Terjadi kesalahan', status = 500, errors = null) {
    const creator = new ErrorResponseCreator();
    return creator.send(res, status, { message, errors });
  },

  /**
   * Kirim response dengan pagination.
   * @param {import('express').Response} res
   * @param {Array} data
   * @param {Object} meta
   * @param {string} message
   */
  paginated(res, data = [], meta = {}, message = 'Berhasil') {
    const creator = new PaginatedResponseCreator();
    return creator.send(res, 200, { message, data, meta });
  },
};

export default ResponseFactory;
