#!/bin/bash

# ==============================================================================
# SCRIPT SETUP GITHUB ISSUES, LABELS, & MILESTONES (Final Windows-Safe Version)
# Portfolio Web3 - Information Systems Student
# ==============================================================================

set -e

echo "🚀 Memulai setup GitHub Issues, Labels, dan Milestones..."

# Cek apakah GitHub CLI sudah login
if ! gh auth status &>/dev/null; then
    echo "❌ Error: Anda belum login ke GitHub CLI. Jalankan 'gh auth login' terlebih dahulu."
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📂 Repository target: $REPO"

# ------------------------------------------------------------------------------
# 1. CREATE LABELS
# ------------------------------------------------------------------------------
echo "🏷️  Membuat Labels..."
gh label create "epic" --color "0075ca" --description "Epic / Large feature" 2>/dev/null || true
gh label create "frontend" --color "1d76db" --description "Frontend related" 2>/dev/null || true
gh label create "backend" --color "0e8a16" --description "Backend / API related" 2>/dev/null || true
gh label create "ui/ux" --color "fbca04" --description "UI/UX and Design" 2>/dev/null || true
gh label create "database" --color "5319e7" --description "Database / ORM" 2>/dev/null || true
gh label create "auth" --color "b60205" --description "Authentication" 2>/dev/null || true
gh label create "setup" --color "ededed" --description "Project setup / config" 2>/dev/null || true
gh label create "enhancement" --color "a2eeef" --description "New feature or improvement" 2>/dev/null || true
gh label create "bug" --color "d73a4a" --description "Something isn't working" 2>/dev/null || true

# ------------------------------------------------------------------------------
# 2. CREATE MILESTONES
# ------------------------------------------------------------------------------
echo "🎯 Membuat Milestones..."
gh api repos/"$REPO"/milestones -f title="M1: Project Setup & Architecture" -f state="open" 2>/dev/null || true
gh api repos/"$REPO"/milestones -f title="M2: Core UI & Web3 Aesthetics" -f state="open" 2>/dev/null || true
gh api repos/"$REPO"/milestones -f title="M3: Projects & Interactive Features" -f state="open" 2>/dev/null || true
gh api repos/"$REPO"/milestones -f title="M4: Admin Dashboard" -f state="open" 2>/dev/null || true
gh api repos/"$REPO"/milestones -f title="M5: Optimization & Deployment" -f state="open" 2>/dev/null || true

# ------------------------------------------------------------------------------
# 3. CREATE ISSUES
# ------------------------------------------------------------------------------
echo "📝 Membuat Issues..."

# Helper function untuk membuat issue (100% Windows-Safe)
create_issue() {
    local title="$1"
    local labels="$2"
    local milestone_title="$3"
    local body="$4"
    
    # 1. Tulis body ke file sementara (mktemp) untuk menghindari bug parsing command-line Windows
    local temp_body=$(mktemp)
    echo "$body" > "$temp_body"
    
    # 2. FIX UTAMA: Gunakan TITLE milestone, bukan NUMBER!
    # GitHub CLI memiliki "footgun" di mana flag --milestone mengharapkan string NAME, bukan angka ID.
    echo "   ➕ Creating: $title (Milestone: $milestone_title)"
    gh issue create --title "$title" --label "$labels" --milestone "$milestone_title" --body-file "$temp_body"
    
    # 3. Bersihkan file sementara
    rm -f "$temp_body"
}

# --- MILESTONE 1 ---
create_issue \
"[Setup] Initial Next.js 15/16, Tailwind v4, and shadcn/ui configuration" \
"setup,frontend" \
"M1: Project Setup & Architecture" \
"$(cat <<'EOF'
Inisialisasi repository dan konfigurasi dasar.

**Checklist:**
- [ ] `npx create-next-app@latest` dengan App Router, TypeScript, Tailwind, ESLint.
- [ ] Setup Tailwind CSS v4 (gunakan konfigurasi CSS-first yang baru).
- [ ] Install dan inisialisasi `shadcn/ui`.
- [ ] Setup absolute imports (`@/`).
- [ ] Setup folder structure (App router: `(public)`, `(admin)`, `_components`, `_lib`, `_hooks`).
EOF
)"

create_issue \
"[Setup] Database, Prisma ORM, and Supabase Integration" \
"setup,backend,database" \
"M1: Project Setup & Architecture" \
"$(cat <<'EOF'
Menghubungkan Supabase dengan Prisma.

**Checklist:**
- [ ] Buat project Supabase dan dapatkan Connection String.
- [ ] Install Prisma dan inisialisasi schema (`prisma/schema.prisma`).
- [ ] Definisikan model dasar: `User`, `Project`, `Message`, `Category`.
- [ ] Generate Prisma Client.
- [ ] Buat utility function untuk Prisma singleton di `_lib/prisma.ts`.
EOF
)"

create_issue \
"[Setup] Authentication with Better Auth" \
"setup,auth,backend" \
"M1: Project Setup & Architecture" \
"$(cat <<'EOF'
Setup sistem autentikasi menggunakan Better Auth.

**Checklist:**
- [ ] Install `better-auth` dan dependensinya.
- [ ] Konfigurasi Better Auth dengan Supabase/Postgres adapter.
- [ ] Setup Auth API routes di Next.js App Router (`/api/auth/[...all]`).
- [ ] Buat Auth context/provider jika diperlukan (atau gunakan server-side auth checks).
EOF
)"

# --- MILESTONE 2 ---
create_issue \
"[UI/UX] Global Layout, Theme, and Web3 Design System" \
"ui/ux,frontend" \
"M2: Core UI & Web3 Aesthetics" \
"$(cat <<'EOF'
Membangun fondasi visual Web3.

**Checklist:**
- [ ] Setup global CSS variables untuk warna Web3 (Neon cyan, purple, dark bg).
- [ ] Buat komponen `GlassCard` (Glassmorphism effect).
- [ ] Setup custom scrollbar dan cursor (opsional, untuk efek Web3).
- [ ] Buat Layout utama dengan Navbar (floating, blur background) dan Footer.
EOF
)"

create_issue \
"[Frontend] Hero Section with Heavy Parallax & Framer Motion" \
"frontend,ui/ux" \
"M2: Core UI & Web3 Aesthetics" \
"$(cat <<'EOF'
Halaman utama dengan efek parallax yang memukau.

**Checklist:**
- [ ] Implementasi `framer-motion` untuk text reveal (stagger children).
- [ ] Buat efek Parallax scroll pada background elements (menggunakan `useScroll` dan `useTransform`).
- [ ] Tambahkan glowing/magnetic effect pada tombol CTA.
- [ ] Pastikan responsif di mobile (kurangi efek parallax berat di mobile untuk performa).
EOF
)"

create_issue \
"[Frontend] About Me & Tech Stack Marquee" \
"frontend,ui/ux" \
"M2: Core UI & Web3 Aesthetics" \
"$(cat <<'EOF'
Seksi tentang profil mahasiswa SI.

**Checklist:**
- [ ] Layout dua kolom: Foto/Avatar 3D atau Glassmorphism card & Text.
- [ ] Buat komponen `TechStackMarquee` (infinite scroll logos menggunakan Framer Motion).
- [ ] Animasi *fade-in-up* saat section masuk viewport (`whileInView`).
EOF
)"

# --- MILESTONE 3 ---
create_issue \
"[Frontend] Projects Showcase with Filtering (nuqs & use-debounce)" \
"frontend,enhancement" \
"M3: Projects & Interactive Features" \
"$(cat <<'EOF'
Menampilkan daftar proyek dengan filtering URL-based.

**Checklist:**
- [ ] Fetch data projects menggunakan React Query + Axios/Prisma.
- [ ] Implementasi `nuqs` untuk state kategori filter di URL (misal: `?category=web`).
- [ ] Gunakan `use-debounce` untuk search bar input.
- [ ] Animasi layout transition (AnimatePresence) saat grid proyek di-filter.
EOF
)"

create_issue \
"[Backend] API Routes for Public Projects & Messages" \
"backend,database" \
"M3: Projects & Interactive Features" \
"$(cat <<'EOF'
Membuat endpoint untuk data publik.

**Checklist:**
- [ ] `GET /api/projects`: Fetch published projects.
- [ ] `GET /api/projects/[slug]`: Fetch detail project.
- [ ] `POST /api/messages`: Endpoint untuk contact form.
- [ ] Validasi input menggunakan Zod di server-side.
EOF
)"

create_issue \
"[Frontend] Contact Form with RHF, Zod, and React Query" \
"frontend,backend" \
"M3: Projects & Interactive Features" \
"$(cat <<'EOF'
Form kontak yang interaktif dan valid.

**Checklist:**
- [ ] Setup React Hook Form dengan Zod resolver.
- [ ] Buat custom UI inputs (shadcn) dengan style Web3 (glowing focus state).
- [ ] Submit form menggunakan React Query `useMutation`.
- [ ] Tampilkan loading state, success toast, dan error handling.
EOF
)"

# --- MILESTONE 4 ---
create_issue \
"[Admin] Dashboard Layout & Auth Middleware" \
"backend,auth,frontend" \
"M4: Admin Dashboard" \
"$(cat <<'EOF'
Membuat area admin yang aman.

**Checklist:**
- [ ] Buat Middleware Next.js untuk protect route `/admin/*`.
- [ ] Redirect ke login jika belum autentikasi via Better Auth.
- [ ] Buat Sidebar dan Topbar untuk Admin Dashboard.
EOF
)"

create_issue \
"[Admin] Project Management with React Table" \
"frontend,enhancement" \
"M4: Admin Dashboard" \
"$(cat <<'EOF'
Tabel manajemen proyek yang advanced.

**Checklist:**
- [ ] Setup TanStack Table (`react-table`).
- [ ] Implementasi fitur: Sorting, Pagination, dan Global Search.
- [ ] Gunakan Zustand untuk menyimpan state UI tabel (misal: page size, active column filters).
- [ ] Buat Modal/Sheet (shadcn) untuk Create/Edit Project (menggunakan RHF).
- [ ] Implementasi Delete confirmation dialog.
EOF
)"

# --- MILESTONE 5 ---
create_issue \
"[Performance] Image Optimization, SEO, and Animations Tuning" \
"enhancement,frontend" \
"M5: Optimization & Deployment" \
"$(cat <<'EOF'
Memastikan web cepat dan SEO friendly.

**Checklist:**
- [ ] Gunakan `next/image` untuk semua gambar, pastikan format WebP/AVIF.
- [ ] Kurangi *Cumulative Layout Shift* (CLS) dan *Largest Contentful Paint* (LCP).
- [ ] Matikan/reduce Framer Motion animations untuk user yang prefer `reduced-motion`.
- [ ] Setup Metadata API Next.js untuk SEO (OpenGraph, Twitter Cards, JSON-LD).
EOF
)"

create_issue \
"[Deployment] Vercel Setup and Final QA" \
"setup,bug" \
"M5: Optimization & Deployment" \
"$(cat <<'EOF'
Deploy dan Quality Assurance.

**Checklist:**
- [ ] Push code ke GitHub.
- [ ] Connect repo ke Vercel.
- [ ] Setup Environment Variables di Vercel (Supabase URL, Prisma, Better Auth Secret).
- [ ] QA: Test semua form, link, dan animasi di Mobile & Desktop.
- [ ] QA: Test Auth flow (Login/Logout) di Admin panel.
- [ ] Final merge ke `main` branch.
EOF
)"

echo "✅ Selesai! Semua Issues, Labels, dan Milestones berhasil dibuat."
echo "🔗 Silakan buka repository Anda di browser untuk melihat hasilnya."