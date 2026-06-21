-- CreateTable laporan
CREATE TABLE "laporan" (
    "id"          TEXT         NOT NULL,
    "judul"       TEXT         NOT NULL,
    "kategori"    TEXT         NOT NULL,
    "keterangan"  TEXT         NOT NULL,
    "nama"        TEXT         NOT NULL,
    "nohp"        TEXT,
    "lokasi"      TEXT,
    "gambar"      TEXT,
    "tanggal"     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at"  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id"     INTEGER      NOT NULL,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "laporan"
    ADD CONSTRAINT "laporan_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "users"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;