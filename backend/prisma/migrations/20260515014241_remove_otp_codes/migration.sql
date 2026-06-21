/*
  Warnings:

  - You are about to drop the `otp_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otp_codes" DROP CONSTRAINT "otp_codes_user_id_fkey";

-- DropTable
DROP TABLE "otp_codes";
