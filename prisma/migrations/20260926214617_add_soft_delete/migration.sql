-- AlterTable
ALTER TABLE "category" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "certificate" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "experience" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "skill" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "category_deletedAt_idx" ON "category"("deletedAt");

-- CreateIndex
CREATE INDEX "certificate_deletedAt_idx" ON "certificate"("deletedAt");

-- CreateIndex
CREATE INDEX "experience_deletedAt_idx" ON "experience"("deletedAt");

-- CreateIndex
CREATE INDEX "message_deletedAt_idx" ON "message"("deletedAt");

-- CreateIndex
CREATE INDEX "message_status_deletedAt_idx" ON "message"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "project_deletedAt_idx" ON "project"("deletedAt");

-- CreateIndex
CREATE INDEX "skill_deletedAt_idx" ON "skill"("deletedAt");
