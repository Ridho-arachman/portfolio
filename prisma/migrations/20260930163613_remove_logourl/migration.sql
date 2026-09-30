-- Drop the unused `logoUrl` columns from the experience and certificate tables.
-- The public site renders thumbnail/gallery only (experience-card and
-- certificate-card never read logoUrl), and the admin forms no longer
-- submit it, so the columns are dead data.
ALTER TABLE "experience" DROP COLUMN "logoUrl";
ALTER TABLE "certificate" DROP COLUMN "logoUrl";
