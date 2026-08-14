-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "logoUrl" TEXT,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "skills" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certificate_isPublished_idx" ON "certificate"("isPublished");

-- CreateIndex
CREATE INDEX "certificate_order_idx" ON "certificate"("order");
