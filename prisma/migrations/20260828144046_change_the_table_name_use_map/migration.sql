/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Experience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Visit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_categoryId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Experience";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "Visit";

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "technologies" TEXT[],
    "gallery" TEXT[],
    "role" TEXT,
    "year" TEXT,
    "highlights" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconName" TEXT,
    "category" "SkillCategory" NOT NULL,
    "proficiency" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "logoUrl" TEXT,
    "thumbnail" TEXT,
    "type" "ExperienceType" NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT[],
    "gallery" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_slug_idx" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- CreateIndex
CREATE INDEX "project_slug_idx" ON "project"("slug");

-- CreateIndex
CREATE INDEX "project_isPublished_idx" ON "project"("isPublished");

-- CreateIndex
CREATE INDEX "project_categoryId_idx" ON "project"("categoryId");

-- CreateIndex
CREATE INDEX "project_order_idx" ON "project"("order");

-- CreateIndex
CREATE INDEX "message_status_idx" ON "message"("status");

-- CreateIndex
CREATE INDEX "message_createdAt_idx" ON "message"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- CreateIndex
CREATE INDEX "skill_category_idx" ON "skill"("category");

-- CreateIndex
CREATE INDEX "skill_order_idx" ON "skill"("order");

-- CreateIndex
CREATE UNIQUE INDEX "experience_slug_key" ON "experience"("slug");

-- CreateIndex
CREATE INDEX "experience_slug_idx" ON "experience"("slug");

-- CreateIndex
CREATE INDEX "experience_type_idx" ON "experience"("type");

-- CreateIndex
CREATE INDEX "experience_order_idx" ON "experience"("order");

-- CreateIndex
CREATE INDEX "experience_isPublished_idx" ON "experience"("isPublished");

-- CreateIndex
CREATE INDEX "visit_createdAt_idx" ON "visit"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "visit_countryCode_idx" ON "visit"("countryCode");

-- CreateIndex
CREATE INDEX "visit_path_idx" ON "visit"("path");

-- CreateIndex
CREATE INDEX "visit_sessionId_idx" ON "visit"("sessionId");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
