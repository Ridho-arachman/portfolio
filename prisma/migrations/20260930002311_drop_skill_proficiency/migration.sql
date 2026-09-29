-- Drop the unused `proficiency` column from the skill table.
-- The public About page renders skill chips (icon + name only) and never
-- showed a percentage, so no data was displayed anywhere on the public site.
ALTER TABLE "skill" DROP COLUMN "proficiency";
