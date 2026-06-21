-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" VARCHAR(30) NOT NULL DEFAULT 'info',
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "laporan_id" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
