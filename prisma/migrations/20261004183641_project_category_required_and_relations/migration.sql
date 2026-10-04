-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_categoryId_fkey";

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateTable
CREATE TABLE "_ProjectExperiences" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectExperiences_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProjectCertificates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectCertificates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExperienceCertificates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExperienceCertificates_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectExperiences_B_index" ON "_ProjectExperiences"("B");

-- CreateIndex
CREATE INDEX "_ProjectCertificates_B_index" ON "_ProjectCertificates"("B");

-- CreateIndex
CREATE INDEX "_ExperienceCertificates_B_index" ON "_ExperienceCertificates"("B");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectExperiences" ADD CONSTRAINT "_ProjectExperiences_A_fkey" FOREIGN KEY ("A") REFERENCES "experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectExperiences" ADD CONSTRAINT "_ProjectExperiences_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCertificates" ADD CONSTRAINT "_ProjectCertificates_A_fkey" FOREIGN KEY ("A") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCertificates" ADD CONSTRAINT "_ProjectCertificates_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperienceCertificates" ADD CONSTRAINT "_ExperienceCertificates_A_fkey" FOREIGN KEY ("A") REFERENCES "certificate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperienceCertificates" ADD CONSTRAINT "_ExperienceCertificates_B_fkey" FOREIGN KEY ("B") REFERENCES "experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
