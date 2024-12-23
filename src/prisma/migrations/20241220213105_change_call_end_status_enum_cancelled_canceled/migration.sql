/*
  Warnings:

  - The values [CANCELLED] on the enum `CallEndStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CallEndStatus_new" AS ENUM ('MISSED', 'CANCELED', 'JOINED');
ALTER TYPE "CallEndStatus" RENAME TO "CallEndStatus_old";
ALTER TYPE "CallEndStatus_new" RENAME TO "CallEndStatus";
DROP TYPE "CallEndStatus_old";
COMMIT;
