-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "media" SET NOT NULL,
ALTER COLUMN "media" SET DATA TYPE TEXT,
ALTER COLUMN "parentMedia" SET NOT NULL,
ALTER COLUMN "parentMedia" SET DATA TYPE TEXT;