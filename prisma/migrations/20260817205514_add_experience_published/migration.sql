-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Experience_isPublished_idx" ON "Experience"("isPublished");
