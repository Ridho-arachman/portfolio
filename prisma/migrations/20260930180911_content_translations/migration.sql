-- Override copy per locale untuk konten editorial.
-- Kolom base (title, description, summary) berisi DEFAULT_LOCALE ("en");
-- kolom ini hanya memuat override, jadi kolom lama tidak perlu di-backfill.
-- Resolver: src/lib/localized-content.ts (JSON rusak di DB jatuh ke base, bukan 500).
ALTER TABLE "project" ADD COLUMN "translations" JSONB;
ALTER TABLE "experience" ADD COLUMN "translations" JSONB;
ALTER TABLE "certificate" ADD COLUMN "translations" JSONB;
