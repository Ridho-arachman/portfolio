# 🤖 AI Coding Agent Guidelines

Dokumen ini berisi standar kerja & aturan wajib bagi AI Agent di repository ini.

---

## 1. Project Context & Environment

- **Environment:** Windows + Nginx + Node.js 24 (dev dan CI) + Supabase (PostgreSQL).
- **Project Type:** Web Application — Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4.
  - Data & auth: Prisma 7 (PostgreSQL via `@prisma/adapter-pg`) + better-auth + nuqs + axios + @tanstack/react-query + @tanstack/react-table + use-debounce + react-hook-form + zod.
  - UI: shadcn/ui + @base-ui/react, motion, lucide-react, react-icons, recharts, zustand, next-themes, class-variance-authority, clsx, tailwind-merge.
  - Map: leaflet + react-leaflet + topojson-client + world-atlas.
  - Infra: deploy ke **Vercel** lewat Vercel Git integration (otomatis saat push ke `main`). Docker (dev/prod) + Nginx + ngrok tersedia untuk workflow lokal/container, **tapi tidak ada job deploy VPS di `.github/workflows/ci.yml`** — jangan menulis docs yang mengesatkan.
- `src/generated/prisma` adalah hasil generate Prisma — jangan diedit manual.
- `.env*` di-gitignore; `DATABASE_URL` dll cukup di `.env` / secrets CI, tidak pernah di kode.

---

## 2. Code Quality & Security

- Tulis kode yang modular, mudah dibaca, dan aman dari kerentanan umum (SQL Injection & XSS).
- Gunakan Prisma Adapter/parameterized query dan better-auth untuk otentikasi; hindari raw SQL dinamis dan jangan pernah menaruh kredensial di kode.
- Terapkan prinsip **DRY (Don't Repeat Yourself)**: ekstrak logic yang berulang menjadi utility function, custom hook, atau shared component. Hindari duplikasi kode antar komponen/route. Gunakan composition alih-alih copy-paste.
- Konsisten dengan pattern yang sudah ada — sebelum menulis kode baru, cek apakah fungsi/hook/component serupa sudah ada di codebase.
- **Wajib setiap perubahan** (murah, detik-detik, menangkap kelas bug yang paling sering): `npm run lint` → `npx tsc --noEmit`.
  `npm run build` tidak wajib lokal — build produksi dipegang CI, dan satu build lokal di worktree ini bisa memakan menit.
- Setelah mengubah `prisma/schema.prisma`, jalankan `npx prisma generate`.
- Test suite dan Lighthouse **tidak wajib lokal** — lihat §6 dan §7. Keduanya tetap berjalan di CI pada setiap push, jadi tidak ada pemeriksaan yang hilang, hanya ditunda.

---

## 3. Git Workflow, Review Gate & CI/CD Trigger (WAJIB)

0. **Review Gate (WAJIB):** Sebelum melakukan `git commit` dan `git push`, kamu **WAJIB bertanya terlebih dahulu** kepada user dan menunggu persetujuan eksplisit untuk review. Dilarang commit atau push tanpa izin.
1. **Granular Commit:** Lakukan `git commit` untuk setiap 1 tugas/fitur kecil yang selesai dikerjakan. Gunakan format konvensi pesan commit (contoh: `feat: ...` atau `fix: ...`).
2. **Auto Push:** Setelah komit berhasil, user sudah menyetujui hasil review, dan dipastikan bebas error, kamu **WAJIB** menjalankan perintah:
   `git push origin main`

   > ⚠️ **Catatan Penting:** `git push origin main` memicu dua hal: (a) pipeline `.github/workflows/ci.yml` (3 job test — Lint/Typecheck/Build/Unit&Docker, Integration, E2E), dan (b) deploy ke Vercel lewat Vercel Git integration. Tidak ada deploy ke VPS.
   >
   > **Penting — schema database:** setelah mengubah `prisma/schema.prisma`, kamu **wajib** membuat file migration, commit, lalu menerapkannya manual:
   > `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script -o prisma/migrations/<timestamp>_<nama>/migration.sql`
   > `npx prisma migrate deploy`
   >
   > Build Vercel hanya menjalankan `prisma generate`; `ci.yml` hanya `db push` ke database test. **Jangan pernah** menambah `prisma migrate deploy` ke `vercel.json` — sudah dicoba dan build-nya **hang** tanpa batas: `DATABASE_URL` production menunjuk ke PgBouncer pooler, sedangkan `migrate deploy` butuh koneksi direct untuk mengambil advisory lock. Akibatnya deploy production berhenti. Terapkan migrasi dari mesin yang bisa mengakses database secara langsung.
   >
   > `npx prisma migrate dev` juga tidak bisa dipakai: pooler yang sama tidak mendukung shadow database.
   >
   > 🚨 **URUTAN WAJIB — migrasi dulu, baru push.** Ini sudah menyebabkan seluruh situs balas 500 di production:
   > 1. `npx prisma migrate diff ... -o prisma/migrations/<timestamp>_<nama>/migration.sql`
   > 2. `npx prisma generate`
   > 3. **`npx prisma migrate deploy`** ← harus SUDAH selesai **sebelum** `git push`
   > 4. baru `git push origin main`
   >
   > Kenapa urutannya penting: build Vercel menjalankan `prisma generate`, dan client yang di-generate akan **memilih kolom baru itu** pada setiap `findMany` yang tidak menyebut `select`. Kalau kamu push sebelum `migrate deploy`, production langsung `The column "X" does not exist in the current database` (P2022) dan **seluruh route publik balas 500** — bukan hanya halaman yang fitur barunya. Jadi migrate dulu, baru push. Kalau sudah terlanjur push, jalankan `migrate deploy` segera; deploy berikutnya akan-Off dengan sendirinya.

---

## 4. Restrictions (Yang Dilarang)

- ❌ Dilarang melakukan `git push` jika kodingan masih bermasalah/error.
- ❌ Dilarang menjalankan perintah terminal berskala destruktif (`rm -rf /`, `DROP DATABASE`, dll) tanpa persetujuan.
- ❌ Dilarang mengubah struktur folder utama aplikasi tanpa instruksi spesifik.

---

## 5. Anti-Looping & Disiplin Eksekusi (WAJIB)

Aturan ini lahir dari insiden nyata: agent memanggil perintah `grep` yang sama berulang-ulang tanpa henti karena tidak membaca hasil dengan benar. Perilaku ini **dilarang keras**.

- ❌ **Dilarang mengulang perintah yang sama** (grep, curl, read, build, dll) lebih dari **2 kali** dengan hasil yang sama/kosong. Jika 2 percobaan tidak membuahkan hasil baru, **STOP** dan ganti pendekatan.
- ✅ **Setiap perintah harus dibaca hasilnya sebelum lanjut.** Jika output kosong/terpotong/gagal, jangan ulangi perintah identik — diagnosa dulu penyebabnya (mis. output disimpan ke file, encoding beda, tool tidak tersedia).
- ✅ **Batas maksimal 3 iterasi per sub-masalah.** Bila setelah 3 percobaan belum selesai:
  1. Hentikan semua percobaan.
  2. Dokumentasikan apa yang sudah dicoba dan mengapa gagal.
  3. Laporkan ke user atau ganti strategi (tool lain, pendekatan lain), jangan mengulang hal yang sama.
- ✅ **Bedakan antara "belum berhasil" dan "tidak akan berhasil".** Jika hambatan adalah artefak lingkungan (mis. Lighthouse localhost memaksa HTTPS, tool tidak ada di Windows), hentikan investigasi dan jelaskan sebagai keterbatasan, bukan terus mencoba.
- ✅ **Verifikasi hasil sebelum mengklaim sukses.** Baca output, bandingkan dengan ekspektasi, baru simpulkan. Jangan menembak perintah beruntun tanpa memeriksa hasil.

---

## 6. Performance & Lighthouse Quality Gate

Kualitas web tetap dijaga, tapi audit Lighthouse **tidak wajib** untuk setiap perubahan. Kalau dijalankan, standarnya tetap tinggi — jangan menurunkan ambang, hanya boleh jarangarla.

### Ambang batas minimal
| Kategori | Target |
|---|---|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 100 |

### Kapan Lighthouse dijalankan
- **Tidak wajib untuk setiap perubahan UI.** Audit ini memakan beberapa menit per device dan temuannya sering bukan regresi.
- Jalankan saat: halaman publik benar-benar berubah tampilannya, ada complaint soal kecepatan, atau sebelum rilis/merge besar.
- Kalau tidak dijalankan, tulis apa pun di laporan — jangan mengklaim sudah lolos.
- Kalau Audit skipped, **tetap perbaiki** yang jelas-jelas rusak dan murah: target sentuh < 48px, kontras yang gagal, gambar tanpa dimensi.
- **Penting:** CI tidak menjalankan Lighthouse, jadi yang dilewati di sini memang tidak terperiksa otomatis. Yang terperiksa otomatis oleh CI hanya Lint, typecheck, build, unit, integration, dan E2E.

### Cara menjalankan (baseline wajib, agar hasil komparabel)
- Gunakan **Lighthouse versi terbaru** dengan throttling default (simulate), jangan `--preset=desktop`.
- Audit terhadap **production build** (`npm run build` → jalankan server standalone), bukan `next dev`.
- Uji **mobile** (412×823 dsf 1.75) dan **desktop** (1350×940 dsf 1).
- Simpan hasil sebagai JSON, bandingkan antar-commit, jangan hapus artefak pembanding sebelum analisa selesai.

### Aturan perbaikan
- ✅ Perbaiki temuan **score 0** pada `color-contrast`, `target-size`, `image-size-responsive`, `errors-in-console` bila itu berasal dari kode aplikasi.
- ✅ Kontras & touch target: pastikan nilai eksplisit (bukan bergantung pada CSS variable yang tidak ter-resolve di semua konteks); touch target minimal 48×48px.
- ✅ Gambar: gunakan `next/image` dengan dimensi sesuai agar `image-size-responsive` lulus.
- ⚠️ **Artefak lingkungan tidak dihitung sebagai bug kode.** Contoh: Lighthouse terhadap hostname lokal memaksa HTTPS → `ERR_SSL_PROTOCOL_ERROR`. Pada kasus ini, dokumentasikan sebagai keterbatasan lingkungan (akan hilang di produksi dengan SSL valid), jangan buang waktu memperbaikinya di kode.
- ✅ Catat skor Lighthouse terakhir di deskripsi commit atau laporan tugas agar regresi terdeteksi.

### Baseline terukur (28 Sep 2026, `/en`, mobile 412×823)

Rata-rata dari beberapa run; satu run tidak bisa dipakai menyimpulkan apa pun (lihat catatan noise di bawah).

| Kategori | Skor | Status |
|---|---|---|
| Performance | **68** (64–70) | ❌ masih di bawah ambang 95 |
| Accessibility | 100 | ✅ |
| Best Practices | 100 | ✅ |
| SEO | 100 | ✅ |

- **Variasi antar-run ±3 poin / ±200ms TBT.** Run berturut-turut pada kode yang sama pernah memberi 63, 69, 64, 70 Performance. Audit **minimal 3×** sebelum menyimpulkan, lalu bandingkan rata-ratanya dan cek apakah rentang sebelum/sesudah overlap. Changes TBT yang Claims tapi hanya terlihat di satu run kemungkinan besar noise.
- Penyebab Performance masih di bawah ambang: **baseline React/Next**. Chunk terbesar ~229 KiB = `react-dom` + implementasi `framer-motion`, dan `react-dom` adalah React itu sendiri — tidak bisa dikecilkan tanpa mengurangi kode aplikasi di atasnya.
- `leaflet` dan `recharts` hanya masuk ke `/admin`. Audit menunjukkan nol byte pihak ketiga, jadi gambar bukan penyebabnya.
- Yang sudah baik dan jangan dibongkar: section below-fold sudah `dynamic(..., { ssr: false })`, `optimizePackageImports` dan `removeConsole` aktif, `force-dynamic` di semua 9 halaman publik, home page adalah server component, dan `browserslist` sudah dipin ke browser modern.
- **Animasi hanya boleh diimpor dari `motion/react`.** `framer-motion` tidak dideklarasi di `package.json` — ia hanya resolve karena `motion` menariknya sebagai dependensi, jadi mengimpornya langsung adalah phantom dependency yang bisa pecak saat `motion` berubah. Memperbaiki 3 file ini menurunkan TBT dari 1769ms ke ~1000ms.
- `motion/react` di halaman publik hanya dipakai 3 file: `hero/hero-content.tsx`, `ui/glass-card.tsx`, `ui/theme-toggle-floating.tsx`. Yang pertama memang butuh. Menghilangkan motion dari `hero-content` akan mengeluarkan library itu dari bundle awal, tapi itu keputusan desain, bukan perbaikan teknis.
- `forced-reflow-insight` sering melaporkan 0 tanpa subitem: penyebabnya ada di chunk vendor yang sudah minify dan tidak bisa dilacak dari laporan. Jangan mengejar ini tanpa reproduksi lokal.
- ⚠️ Di Windows, `lighthouse` sering gagal `EPERM` saat `chrome-launcher` menghapus temp profile. Itu artefak file-lock, bukan kegagalan audit — bersihkan `%LOCALAPPDATA%\Temp\lighthouse.*`, tunggu, lalu ulangi. Jangan sampai 3x; setelah itu dokumentasikan sebagai keterbatasan.
- ⚠️ `SEO 92` hampir selalu berarti `robots.txt timed out` saat audit, bukan bug. Fetch `robots.txt` langsung sebelum memperbaiki apa pun.


---

## 7. Testing Requirements

Test **layak ditulis** bila ada logika yang mudah salah diam-diam. Tidak wajib untuk setiap perubahan:

| Tipe | Kapan worth-it | Tool | Penamaan file |
|---|---|---|---|
| **Unit test** | Logika yang mudah salah diam-diam: parsing, validasi, perhitungan, state machine, boundary | Vitest | `*.test.ts` / `*.test.tsx` |
| **Integration test** | API route yang menyentuh DB, auth flow, cache invalidation, modul yang saling memanggil | Vitest | `*.integration.test.ts` |
| **E2E test** | User flow yang rusak fatal kalau gagal: login, submit form, alur trash/restore | Playwright | `e2e/*.spec.ts` |

- **Test tidak wajib untuk setiap perubahan.** Menulis test yang tidak menangkap bug apa pun lebih buruk daripada tidak menulis test — ia hanya menambah rasa aman palsu.
- Menjalankan test lokal juga opsional. **CI tetap menjalankan ketiganya di setiap push**, jadi test yang ditulis tidak akan menggantung tanpa dijalankan. Yang hilang hanya umpan balik cepat di laptop.
- Kalau memang menulis test: **wajib lulus** sebelum di-push. Kalau gagal, perbaiki atau hapus — jangan commit test merah.
- Kalau sebuah test diam-diam jadi tidak menguji apa pun (misal assertion-nya membaca fixture yang salah), itu lebih berbahaya daripada tidak ada test. Kalau tidak yakin sebuah test benar-benar menguji apa yang diklaim, periksa.
- Test **tidak wajib** untuk: perubahan styling/CSS murni, perubahan copy/teks, pembaruan dependency, config, dan dokumentasi.
- Kalau sebuah test gagal saat dijalankan, itu informasi yang berharga — jangan dihapus supaya hijau.

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
