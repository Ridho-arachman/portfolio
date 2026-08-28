-- RenameSkillIconUrlToIconName
-- Rename column iconUrl to iconName in Skill table to store react-icons component names instead of URLs.
ALTER TABLE "Skill" RENAME COLUMN "iconUrl" TO "iconName";
