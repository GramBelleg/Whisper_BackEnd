-- DropForeignKey
ALTER TABLE "Relates" DROP CONSTRAINT "Relates_relatedById_fkey";

-- DropForeignKey
ALTER TABLE "Relates" DROP CONSTRAINT "Relates_relatingId_fkey";

-- AddForeignKey
ALTER TABLE "Relates" ADD CONSTRAINT "Relates_relatingId_fkey" FOREIGN KEY ("relatingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relates" ADD CONSTRAINT "Relates_relatedById_fkey" FOREIGN KEY ("relatedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
