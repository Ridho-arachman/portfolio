-- Remove CERTIFICATION from ExperienceType (certificates live on their own page)
-- Any legacy rows are mapped to EDUCATION so the type recreation never fails.

UPDATE "experience" SET "type" = 'EDUCATION' WHERE "type"::text = 'CERTIFICATION';

CREATE TYPE "ExperienceType_new" AS ENUM ('WORK', 'INTERNSHIP', 'ORGANIZATION', 'FREELANCE', 'EDUCATION');

ALTER TABLE "experience" ALTER COLUMN "type" TYPE "ExperienceType_new" USING "type"::text::"ExperienceType_new";

ALTER TYPE "ExperienceType" RENAME TO "ExperienceType_old";

ALTER TYPE "ExperienceType_new" RENAME TO "ExperienceType";

DROP TYPE "ExperienceType_old";
