# 🤖 AI Coding Agent Guidelines

Dokumen ini berisi standar kerja & aturan wajib bagi AI Agent di repository ini.

---

## 1. Project Context & Environment

- **Environment:** Windows + Nginx + Node.js (dev lokal 24, CI 20) + Supabase (PostgreSQL).
- **Project Type:** Web Application — Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4.
  - Data & auth: Prisma 7 (PostgreSQL via `@prisma/adapter-pg`) + better-auth + nuqs + axios + @tanstack/react-query + @tanstack/react-table + use-debounce + react-hook-form + zod.
  - UI: shadcn/ui + @base-ui/react, motion, lucide-react, react-icons, recharts, zustand, next-themes, class-variance-authority, clsx, tailwind-merge.
  - Map: leaflet + react-leaflet + topojson-client + world-atlas.
  - Infra: Docker (dev/prod) + Nginx + ngrok; deploy via GitHub Actions → VPS.
- `src/generated/prisma` adalah hasil generate Prisma — jangan diedit manual.
- `.env*` di-gitignore; `DATABASE_URL` dll cukup di `.env` / secrets CI, tidak pernah di kode.

---

## 2. Code Quality & Security

- Tulis kode yang modular, mudah dibaca, dan aman dari kerentanan umum (SQL Injection & XSS).
- Gunakan Prisma Adapter/parameterized query dan better-auth untuk otentikasi; hindari raw SQL dinamis dan jangan pernah menaruh kredensial di kode.
- Terapkan prinsip **DRY (Don't Repeat Yourself)**: ekstrak logic yang berulang menjadi utility function, custom hook, atau shared component. Hindari duplikasi kode antar komponen/route. Gunakan composition alih-alih copy-paste.
- Konsisten dengan pattern yang sudah ada — sebelum menulis kode baru, cek apakah fungsi/hook/component serupa sudah ada di codebase.
- Sebelum menyelesaikan tugas, validasi sesuai pipeline CI:
  `npm run lint` (ESLint) → `npx tsc --noEmit` (type checking) → `npm run build` (Next.js build).
- Setelah mengubah `prisma/schema.prisma`, jalankan `npx prisma generate`.
- Proyek menggunakan **Vitest** (unit & integration) + **Playwright** (E2E). Jalankan sebelum commit:
  `npm run test:unit` → `npm run test:integration` → `npm run test:e2e`.

---

## 3. Git Workflow, Review Gate & CI/CD Trigger (WAJIB)

0. **Review Gate (WAJIB):** Sebelum melakukan `git commit` dan `git push`, kamu **WAJIB bertanya terlebih dahulu** kepada user dan menunggu persetujuan eksplisit untuk review. Dilarang commit atau push tanpa izin.
1. **Granular Commit:** Lakukan `git commit` untuk setiap 1 tugas/fitur kecil yang selesai dikerjakan. Gunakan format konvensi pesan commit (contoh: `feat: ...` atau `fix: ...`).
2. **Auto Push:** Setelah komit berhasil, user sudah menyetujui hasil review, dan dipastikan bebas error, kamu **WAJIB** menjalankan perintah:
   `git push origin main`

   > ⚠️ **Catatan Penting:** Perintah `git push` ini adalah pemicu (_trigger_) otomatis untuk pipeline CI/CD (GitHub Actions) agar perubahan ter-deploy langsung ke VPS.

---

## 4. Restrictions (Yang Dilarang)

- ❌ Dilarang melakukan `git push` jika kodingan masih bermasalah/error.
- ❌ Dilarang menjalankan perintah terminal berskala destruktif (`rm -rf /`, `DROP DATABASE`, dll) tanpa persetujuan.
- ❌ Dilarang mengubah struktur folder utama aplikasi tanpa instruksi spesifik.

---

## 5. Testing Requirements

Setiap fitur baru atau perubahan behavior **WAJIB** disertai test yang sesuai:

| Tipe | Kapan wajib | Tool | Penamaan file |
|---|---|---|---|
| **Unit test** | Fungsi utilitas, helper, komponen UI isolasi, validasi logika | Vitest | `*.test.ts` / `*.test.tsx` |
| **Integration test** | API routes, interaksi DB, auth flow, modul yang saling memanggil | Vitest | `*.integration.test.ts` |
| **E2E test** | User flow kritis: login, signup, form submit, navigasi admin | Playwright | `e2e/*.spec.ts` |

- Jika fitur **tidak memerlukan** test tertentu (misal: pure CSS/style change, config-only), boleh skip dengan justifikasi singkat.
- Test harus **pass** sebelum commit (termasuk di CI).
- Jalankan pipeline test lengkap: `npm run test:unit` → `npm run test:integration` → `npm run test:e2e`.

---

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
