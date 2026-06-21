-- AlterTable
ALTER TABLE "visitor_logs" ADD COLUMN     "browser_name" VARCHAR(50),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "isp_name" VARCHAR(100),
ADD COLUMN     "language" VARCHAR(20),
ADD COLUMN     "last_seen_at" TIMESTAMP(6),
ADD COLUMN     "os_name" VARCHAR(50),
ADD COLUMN     "visitor_key" VARCHAR(64);

-- CreateIndex
CREATE INDEX "idx_visitor_key" ON "visitor_logs"("visitor_key");
