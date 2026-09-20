# Design System — Portfolio Ridho Arachman

Dokumen ini adalah **single source of truth** untuk semua keputusan visual di project ini.
**WAJIB dibaca sebelum menulis/mengubah komponen UI** (termasuk oleh AI agent). Jika ada
konflik antara pedoman di sini dengan kebiasaan lama, ikuti dokumen ini.
**Sebelum mulai, muat SEMUA skill design yang diwajibkan di §0.**

> **Review Gate:** sebelum commit perubahan UI, pastikan tidak ada pelanggaran pada
> bagian **7. Aturan Anti AI-Slop** dan semua resep kanonik di **4. Recipe Komponen**.
> Semua nilai token bersumber dari `src/app/globals.css` — dilarang menambah nilai
> warna/font/radius baru tanpa kebutuhan nyata dan pembahasan.

---

## 0. Mandat Skill Design untuk AI Agent (WAJIB)

**Aturan emas:** setiap kali bekerja pada design/UI web — membuat halaman, komponen,
animasi, redesign, atau sekadar menyentuh styling — agent **WAJIB memuat SEMUA skill
design berikut** dan menerapkan instruksinya **bersamaan (conjunctive)**, bukan memilih
salah satu. Skill-skill ini saling melengkapi pada standar kualitas anti-slop yang sama.
Tanpa pipeline skill ini, pekerjaan UI dianggap belum sah dan wajib diulang sebelum commit.

### 0.1 Skill inti — WAJIB dimuat untuk SEMUA tugas UI
| Skill | Fungsinya dalam pekerjaan ini | Kapan dipakai |
|---|---|---|
| `design-taste-frontend` | Skill anti-slop utama untuk landing page/portfolio/redesign. Audit-first pada redesign, pre-flight check sebelum implementasi. | Selalu |
| `high-end-visual-design` | Standar desain ala agensi high-end: font, spacing, shadow, struktur kartu, animasi yang terasa mahal; memblokir default yang murahan/generik. | Selalu |
| `stitch-design-taste` | Sintesis aturan desain semantik; menghasilkan/menyempurnakan `DESIGN.md`; standar tipografi, kalibrasi warna, motion spring, larangan pola AI. | Selalu (dokumen ini lahir dari skill ini) |
| `gpt-taste` | Elite UX/UI + motion lanjutan (tipografi editorial lebar, bento grid rapat, GSAP ScrollTrigger, hierarchy, micro-motion). | Selalu (layout & motion level lanjut) |
| `design-system` | Generate/audit design system, cek konsistensi visual, review PR yang menyentuh styling. | Selalu (untuk menjaga konsistensi token §2 & recipe §4) |
| `frontend` (builtin) | Router ruleset: design taste + perfection (Playwright/Lighthouse/Core Web Vitals) + ui-ux-db (palet/font) + aksesibilitas/WCAG. | Selalu (UI apa pun) |

### 0.2 Skill spesifik gaya — dimuat HANYA jika brief cocok
- `minimalist-ui` — editorial minimal, monokrom hangat, kontras tipografi, bento flat, tanpa gradient/shadow berat. Cocok bila brief meminta kesan bersih/tenang.
- `industrial-brutalist-ui` — tipografi Swiss + estetika terminal militer; untuk dashboard data-heavy, portfolio, editorial yang terasa "blueprint deklasifikasi".
- `gpt-taste` juga berperan di sini (lihat §0.1) saat motion/GSAP dibutuhkan.

### 0.3 Skill referensi gambar — dipakai saat membuat arahan visual
- `imagegen-frontend-web` — buat **satu gambar referensi horizontal PER section** (bukan gabungan) sebagai acuan komposisi sebelum implementasi.
- `imagegen-frontend-mobile` — konsep screen app mobile (pakai mockup phone premium).
- `brandkit` — brand-guidelines board, logo system, identity deck, visual-world presentation.
- `image-to-code` — untuk tugas "buat UI dari gambar": generate gambar dulu, analisis, lalu implementasi agar sedekat mungkin dengan gambar.

### 0.4 Skill redesign — untuk mengubah project lama
- `redesign-existing-projects` — **audit dulu** tampilan existing, identifikasi pola AI generik yang ada, lalu terapkan standar premium **tanpa merusak fungsionalitas**. Jangan pernah mengubah tampilan tanpa audit-first.
- `design-taste-frontend` (audit-first) selalu diutamakan sebelum menyentuh file lama.

### 0.5 Alur kerja wajib (tidak boleh dilewati)
1. **Muat skill** — sebelum menulis satu baris kode UI, load semua skill di §0.1 (dan §0.2–0.4 sesuai kasus) lalu baca instruksinya dengan konteks tugas ini.
2. **Sesuaikan dengan dokumen ini** — token §2, resep §4, skala §5, motion §6 tetap mengikat; skill tidak boleh menabrak aturan di sini.
3. **Audit-first untuk perubahan existing** — identifikasi pola generik/inkonsistensi yang ada sebelum mengubah apa pun (§7.1 adalah contoh temuan audit yang sudah dikunci).
4. **Buat referensi visual bila perlu** — gunakan §0.3 untuk menyusun komposisi, simpan sebagai acuan, bukan sekadar hiasan.
5. **Verifikasi setelah implementasi** — wajib `visual-qa` (builtin) + Lighthouse mobile & desktop (lihat AGENTS.md §6) sebelum commit.

> Pelanggaran: memodifikasi UI tanpa memuat skill di atas **= revisi wajib sebelum commit**.

---

## 1. Filosofi Visual & Atmosfer

**Gaya:** Glassmorphism elegan di atas kanvas netral (zinc) dengan **satu aksen violet**.
Mode gelap (`#050505`) adalah identitas utama portfolio; mode terang (`#fafafa`) memakai
token yang sama dan tetap dijaga kontrasnya.

| Dimensi | Nilai | Arti |
|---|---|---|
| Density | 5/10 | Balanced — cukup udara, tidak penuh sesak |
| Variance | 4/10 | Terstruktur & konsisten; header section selalu centered |
| Motion | 6/10 | Fluid — reveal berjenjang + mikro-interaksi hover |

**Pilar desain:**
1. **Kaca (glass)** — permukaan `backdrop-blur-xl` dengan border tipis transparan.
2. **Cahaya (glow)** — aksen violet dipakai hemat: teks gradient, CTA utama, titik timeline, halo di belakang heading.
3. **Grid halus** — pola grid 40px dengan `opacity-20` sebagai tekstur latar (paling bawah, `pointer-events-none`).
4. **Konsistensi token** — **TIDAK PERNAH hardcode warna**. Selalu pakai CSS variable dari `globals.css`.

---

## 2. Token Warna (Palet)

Sumber tunggal warna: `src/app/globals.css` (blok `:root`, `.dark`, dan `@theme`).
Jangan membuat token baru tanpa kebutuhan nyata.

### Mode Terang — `:root`
| Token | Nilai | Peran |
|---|---|---|
| `--color-bg-primary` | `#fafafa` | Kanvas utama |
| `--color-bg-secondary` | `#ffffff` | Kartu/kontainer |
| `--color-bg-tertiary` | `#f4f4f5` | Area muted |
| `--color-accent` | `#7c3aed` | CTA, fokus, gradient — kontras AA 5.46:1 di atas `#fafafa` |
| `--color-accent-hover` | `#8b5cf6` | Hover aksen (lebih terang dari base, pola sama seperti dark) |
| `--color-accent-muted` | `rgba(139,92,246,0.1)` | Badge/backdrop aksen |
| `--color-text-primary` | `#09090b` | Teks utama |
| `--color-text-secondary` | `#52525b` | Deskripsi |
| `--color-text-muted` | `#71717a` | Metadata |
| `--color-neon-purple` / `--color-neon-cyan` | `#c084fc` / `#22d3ee` | Dekorasi (hemat, jarang dipakai) |

### Mode Gelap — `.dark` (identitas default)
| Token | Nilai | Peran |
|---|---|---|
| `--color-bg-primary` | `#050505` | Kanvas utama |
| `--color-bg-secondary` | `#0a0a0a` | Kartu/kontainer |
| `--color-bg-tertiary` | `#171717` | Area muted |
| `--color-accent` | `#a78bfa` | CTA, fokus, gradient |
| `--color-accent-hover` | `#c4b5fd` | Hover aksen |
| `--color-accent-muted` | `rgba(167,139,250,0.1)` | Badge/backdrop aksen |
| `--color-text-primary` | `#fafafa` | Teks utama |
| `--color-text-secondary` | `#a3a3a3` | Deskripsi |
| `--color-text-muted` | `#8e8e93` | Metadata — kontras AA 6.25:1 di atas `#050505` |

### Token bersama (dua mode)
- **Glass:** `--color-glass-bg` (70% putih / 3% putih), `--color-glass-border` (8% hitam/putih), `--color-glass-hover`.
- **Grid:** `--color-grid-line` — `rgba(139,92,246,0.08)` (light) / `rgba(167,139,250,0.05)` (dark).
- **Semantic shadcn** (`--primary`, `--card`, `--popover`, `--ring`, `--chart-1..5`, dll.) dimapping ke palet di atas — jangan diubah terpisah.

### Aturan warna
- ⚠️ **Violet standar `#a855f7` / kelas `purple-*` / `bg-gray-900` DILARANG** — semua permukaan sudah punya token (`accent*`, `bg-*`). Lihat §7.1.
- Satu aksen saja. Jangan menambah warna aksen kedua "biar menarik".
- Border default semua elemen = `--color-glass-border` (sudah diset global via `* { border-color }`).

---

## 3. Tipografi

### Font stack (dari globals.css — tanpa custom web font)
- **Sans (UI & body):** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`
- **Mono (code, metadata, angka admin, statistik):** `"JetBrains Mono", "Fira Code"`

### Skala (wajib ditiru)
| Konteks | Kelas | Catatan |
|---|---|---|
| Hero halaman (`page-hero`) | `text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]` | Span aksen memakai `text-gradient-elegant` + halo glow di belakang |
| Hero beranda | `text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.9]` | CTA di bawah |
| Judul section (H2) | `text-3xl md:text-5xl font-bold mb-4` | Satu kata/span memakai `text-gradient-elegant` |
| Judul detail (H1) | `text-4xl md:text-6xl font-bold text-text-primary mb-4 leading-tight` | — |
| Sub-judul detail (H2) | `text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6` | — |
| Judul kartu (H3) | `text-xl font-bold text-text-primary group-hover:text-accent` | — |
| Badge eyebrow | `text-xs font-semibold tracking-wider uppercase` | Kombinasi `rounded-full border-accent/30 text-accent` |
| Body kartu | `text-sm text-text-secondary leading-relaxed` | — |
| Deskripsi section | `text-lg` di dalam `max-w-2xl mx-auto` | — |
| Sub-heading hero | `text-lg md:text-2xl` | — |

### Aturan tipografi
- Berat maksimum **`font-bold` (700)**. `font-extrabold` / `font-black` tidak pernah dipakai di codebase → jangan mulai memakainya.
- Heading besar selalu `tracking-tight`/`tracking-tighter` dan `leading-[0.9]`.
- Body tidak lebih kecil dari `text-sm`; metadata boleh `text-xs`.
- Gradient teks **hanya** lewat utility `text-gradient-elegant` (135deg, text-primary → accent). Tidak boleh gradient warna-warni / neon penuh.
- Angka/statistik admin: `font-mono` + `tabular-nums`.

---

## 4. Recipe Komponen Kanonik

### 4.1 Header Section (semua section publik)
Pola dasar identik di semua section publik — tiru persis:
```tsx
<div className="text-center mb-16 md:mb-24 animate-fade-in-up">
  <h2 className="text-3xl md:text-5xl font-bold mb-4">
    Judul <span className="text-gradient-elegant">Aksen</span>
  </h2>
  <p className="text-text-secondary max-w-2xl mx-auto text-lg">Deskripsi singkat.</p>
</div>
```
- **Badge eyebrow = OPSIONAL**, maksimal **1 per 3 section** dalam satu halaman (jangan setiap section).
  Jika dipakai: `Badge variant="outline" className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"` di atas H2.
- Kondisi saat ini: hero beranda memakai badge status "Available for hire" (bukan eyebrow); **Projects** & **Contact** boleh eyebrow; Experience & Certificates sengaja TANPA badge agar tidak jenuh.

### 4.2 Kartu Kaca (Glass Cards)
- **Primitive:** `GlassCard` (`src/components/ui/glass-card.tsx`) — `"relative rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl transition-all duration-300 ease-out"` dengan variant `hover` (`hover:-translate-y-2 hover:shadow-2xl hover:border-accent/40 hover:bg-glass-hover`) dan `accent`. Sudah ada built-in motion reveal (`opacity: 0, y: 20`, `viewport margin: "-50px"`).
- **Kartu publik (list):**
  `"relative h-full rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.1)] transition-all duration-300"`
  + saat berbasis shadcn `Card`, wajib override `style={{ borderWidth: 0, boxShadow: "none" }}`.
- **Kartu hero:** `rounded-3xl` **hanya** untuk kartu hero/proyek unggulan (`project-card.tsx:20`).
- **Kartu admin panel:**
  `"overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl"`
  dengan header `border-b border-glass-border px-5 py-4`, list `divide-y divide-glass-border/60`, footer `border-t border-glass-border p-4`.
- **Chip teknologi (marquee/floating):** `"p-4 rounded-2xl bg-glass-bg border border-glass-border backdrop-blur-xl"`.
- **Pill badge di atas gambar:** `"rounded-full bg-bg-primary/80 backdrop-blur-md border-glass-border text-xs font-semibold text-accent"`.

### 4.3 Tombol / CTA
- **Public CTA primer:** `buttonVariants({ variant: "default", size: "lg" })` + `"group rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"` — wajib `min-h-[48px] min-w-[48px]` (touch target).
- **CTA hero (raw `Link`):** `"rounded-full bg-accent text-bg-primary font-semibold px-6 py-3 sm:px-8 sm:py-4 min-h-[48px] min-w-[48px]"`.
- **Sekunder:** `"rounded-full border border-white/8 px-8 py-4 ... hover:border-accent/50 hover:text-accent"`.
- **Ghost link dalam kartu:** `variant="ghost" className="h-auto p-0 ... hover:text-accent hover:bg-transparent"`.
- **Tombol aksen admin:** `"rounded-full bg-accent px-4 py-2 text-xs font-semibold text-bg-primary hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"`.
- Glow tombol hanya memakai nilai yang sudah ditetapkan (`30px`/`24px`, opacity `0.4`) — jangan diperbesar/diganti warna lain.
- **Satu intent CTA = satu label di seluruh situs.** Intent "contact" = `Let's Talk` (nav, mobile nav, hero). Intent "projects" = `View Projects`. Jangan variasikan (`Contact Me`, `Get In Touch`, `View All Projects`). Submit form boleh beda (`Send Message`) karena itu kontrol aksi, bukan CTA navigasi.
- **CTA navbar pakai token, bukan `bg-black`:** aktif = `bg-accent text-bg-primary`; non-aktif = `bg-text-primary text-bg-primary border border-text-primary hover:opacity-85`.

### 4.4 Form & Input
- Input/textarea (`input.tsx`, `textarea.tsx`): `"rounded-lg border border-glass-border bg-bg-secondary"` (+ fokus ring aksen via shadcn).
- Form kartu: `"relative rounded-2xl border border-glass-border bg-glass-bg/60 backdrop-blur-xl p-6 md:p-8 overflow-hidden"`.
- Label di atas input, pesan error di bawah. Tanpa floating label.

---

## 5. Radius, Spacing & Layout

### Skala radius (tiered — bukan seragam)
| Tier | Nilai | Peran |
|---|---|---|
| `rounded-md` | 0.5rem | Thumbnail, preview tiles |
| `rounded-xl` | 1rem | Input, `GlassCard`, kontainer kecil |
| `rounded-2xl` | — (default Tailwind) | Kartu standar (mayoritas) |
| `rounded-3xl` | — (default Tailwind) | **Hanya** kartu hero |
| `rounded-full` | 9999px | Pill, badge, tombol CTA |

### Ritme spacing
- Wrapper section: `"relative overflow-hidden"` + `py-20 md:py-32` (bagian utama) atau `pb-14` / `pb-24` (varian).
- Container: `"container relative z-10 mx-auto px-4"` — identik di semua section.
- Lebar konten: detail `max-w-5xl`, hero `max-w-4xl`, deskripsi `max-w-2xl`, form admin `max-w-3xl`.
- Header section: `mb-16 md:mb-24`.
- Grid kartu: `gap-8`; kolom 2 (about): `gap-12 md:gap-16`; CTA hero: `gap-6`.
- Halaman detail: `"container mx-auto px-4 max-w-5xl py-16 md:py-24"`.
- Footer `py-12`; navbar `h-20`.

### Layout (wajib)
- Mobile-first: semua multi-kolom collapse ke 1 kolom di bawah `md`. **Tidak boleh ada horizontal scroll.**
- Full-height section pakai `min-h-[100dvh]`, **bukan** `h-screen`.
- Jangan pakai `calc()` untuk persentase layout — pakai grid (`grid-cols-*`) / `max-w-*`.
- Elemen tidak boleh saling tumpuk (overlap) kecuali halo glow dekoratif yang `-z-10`/`pointer-events-none`.

---

## 6. Motion & Interaksi

### CSS animation (server-safe, untuk reveal & dekorasi)
- `animate-fade-in-up` + delay berjenjang `delay-100/200/300/400/500` (utility di globals.css).
- Stagger berbasis index: `style={{ animationDelay: `${index * 150}ms`, animationFillMode: "both" }}`.
- Tersedia: `animate-float`, `animate-float-delayed`, `animate-float-gentle`, `animate-parallax-y`, `animate-marquee`, `animate-slide-down`, `animate-scale-in`, `animate-bounce-in`, `animate-timeline-progress`, `animate-mouse-parallax`.

### framer-motion (Client Components saja)
- **Standar import motion (dua peran):**
  - Komponen JSX: `import * as m from "motion/react-m"` (`m.div`, `m.button`, dst.).
  - Hook (`useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`) & `AnimatePresence`: dari `"framer-motion"`.
  - `framer-motion` ≡ `motion/react` (package sama, v12+). Type-only import seperti `type Variants` / `type HTMLMotionProps` sah dari salah satu (tidak ada biaya runtime). `LazyMotion`/`domAnimation` dipakai di test.
  - Yang dilarang: memakai hook lewat namespace `m.*` (mis. `m.useMotionValue`) — `motion/react-m` tidak mengekspornya → error TypeScript.
- **Reveal standar:** `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`.
- **Stagger container:** `staggerChildren: 0.08, delayChildren: 0.1`; item: `hidden: { opacity: 0, y: 20 } visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }` (pola `cardVariants` di `core-values/constants.ts`).
- **Replay on scroll:** `REPLAY_VIEWPORT = { once: false, amount: 0.2 }` (hanya bila interaksi membutuhkan).
- **Tilt 3D** (kartu login): `useMotionValue/useSpring/useTransform` dengan `springConfig = { damping: 25, stiffness: 180, mass: 0.6 }`.

### Aturan motion
- Animasi hanya lewat `transform` dan `opacity`. **Jangan** animasi `top`/`left`/`width`/`height`.
- `viewport={{ once: true }}` = default. Loop tak terbatas hanya untuk elemen dekoratif (blob latar, marquee, ring) dengan `repeat: Infinity, ease: "linear"`.
- Komponen dengan animasi berat/CPU-intensive harus diisolasi sebagai Client Component.
- **Reduced motion (WAJIB):** semua animasi harus aman untuk `prefers-reduced-motion`. Gate global sudah ada di `globals.css` (section 8); untuk animasi JS (parallax, tilt 3D, float, marquee, ping) wajib tambah `useReducedMotion()` dari `framer-motion` dan zero-kan transform/input saat aktif. Contoh sudah diterapkan: `useAboutHeroAnimations`, `AdminLoginCard`.

---

## 7. Aturan Anti AI-Slop (DILARANG)

Bagian ini dibuat khusus agar kode baru — termasuk yang ditulis AI agent — tidak
merusak identitas visual project. **Pelanggaran mana pun = wajib direvisi sebelum commit.**

### 7.1 Warna hardcoded / token drift — PELANGGARAN SERIUS
- ❌ `bg-purple-500`, `border-purple-500/30`, `bg-purple-500/20 text-purple-400`, `bg-gray-900/60`, `drop-shadow-[0_0_35px_rgba(168,85,247,...)]`, atau nilai hex mentah (`#a855f7`, `#ffffff` untuk surface non-kartu).
- ✅ Selalu pakai token: `bg-accent`, `bg-accent-hover`, `border-accent/30`, `text-accent`, `bg-bg-primary`, `bg-glass-*`, `text-text-*`.
- *Diketahui:* file lama yang masih melanggar: `about/avatar-badge.tsx`, `about-avatar.tsx` — jika menyentuh file tersebut, perbaiki sekalian.
- *Sudah diperbaiki 2026-09-20:* `navbar.tsx`, `navbar-scroll-effect.tsx`, `navbar-logo.tsx`, `desktop-nav.tsx`, `mobile-nav-client.tsx`, `footer-social.tsx` — semua surface pakai `bg-bg-secondary`/`bg-bg-primary`, hardcoded `#000000` & `rgb(255 255 255)` dihapus.

### 7.2 Larangan umum (tanda khas AI generik)
- ❌ Emoji dekoratif di UI. *(Pengecualian: fallback bendera `🌐` yang fungsional di peta admin.)*
- ❌ Teks filler: "Lorem ipsum", "Scroll to explore", "Swipe down", panah/bouncing chevron.
- ❌ Copywriting klise AI: "Elevate", "Seamless", "Unleash", "Next-Gen", "Empowering", "Unlock".
- ❌ Angka palsu bulat: "99.99%", "50M+", "10/10 rating".
- ❌ Nama placeholder generik: "John Doe", "Acme Corp", "Nexus", "My App".
- ❌ `rounded-2xl` seragam di semua elemen — wajib skala tiered (§5).
- ❌ Kartu-dalam-kartu (Card di dalam Card) dan tumpukan wrapper `relative h-full` berlapis tanpa alasan (maks 1 lapis).
- ❌ Gradient text berlebihan — `text-gradient-elegant` hanya untuk **satu** kata/span aksen per heading.
- ❌ Neon/outer glow berlebihan — glow hanya nilai yang sudah ditetapkan di §4.3.
- ❌ Font-weight di atas 700.
- ❌ Baris "3 kartu identik" untuk section fitur baru — gunakan grid asimetris/zig-zag bila menambah section.
- ❌ Warna aksen kedua / palet baru yang tidak ada di §2.

### 7.3 Kebersihan & konsistensi
- ❌ Memakai hook/`AnimatePresence` lewat namespace `m.*` (mis. `m.useMotionValue`, `m.AnimatePresence`) — `motion/react-m` HANYA untuk komponen JSX; hook dari `framer-motion`/`motion/react` (lihat §6).
- ❌ `bg-white dark:bg-gray-950` untuk surface — gunakan `bg-bg-primary` / `bg-bg-secondary`.
- ❌ Inline style `backgroundColor` (mis. `rgb(255 255 255)` di navbar) — inline style menang atas class `dark:*` dan mematikan dark mode; pakai class token.
- ❌ Utility mati `text-glow-accent` (globals.css:220) — jangan dipakai di fitur baru; idealnya dihapus jika memang tak terpakai.
- ❌ `<Card>` shadcn mentah di permukaan publik tanpa override kaca (`borderWidth: 0, boxShadow: "none"`).
- ❌ Menambah utility class baru di globals.css bila padanan sudah ada (cek §6).

### 7.4 Checklist sebelum commit (perubahan UI)
- [ ] Semua warna memakai token dari §2 (tidak ada hex/purple-*/gray-* hardcoded).
- [ ] Header section memakai pola kanonik §4.1.
- [ ] Kartu memakai recipe §4.2; radius sesuai skala §5.
- [ ] CTA memakai recipe §4.3 + touch target ≥ 48px.
- [ ] Import motion konsisten; animasi hanya transform/opacity.
- [ ] Tidak ada emoji dekoratif, teks filler, atau copywriting klise.
- [ ] Mobile-tested: tidak ada horizontal scroll; konten collapse 1 kolom.
- [ ] Lighthouse (mobile & desktop) sesuai Quality Gate di AGENTS.md sebelum commit.

---

*Terakhir diperbarui: 2026-09-20. Bersumber dari audit aktual codebase (`src/app/globals.css`, `src/components/**`) — jika ada pola baru yang menang di codebase, perbarui dokumen ini dulu sebelum menormalisasikannya.*