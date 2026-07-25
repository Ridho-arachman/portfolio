📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

1. Project Overview
   Project Name: [Nama Anda] - Web3 Portfolio
   Role: Information Systems Student & Fullstack Developer
   Objective: Membangun personal portfolio yang imersif dengan estetika Web3 untuk memamerkan skill, proyek akademik, dan pengalaman sebagai mahasiswa Sistem Informasi.
   Target Audience: Recruiter IT, Tech Lead, Dosen, dan sesama developer.
2. UI/UX & Design Guidelines
   Theme: Cyberpunk / Web3 / Dark Mode Default.
   Color Palette: Deep space black/dark grey background, neon purple/cyan accents, glassmorphism cards.
   Animations: Scroll-triggered parallax, magnetic buttons, text reveal, smooth page transitions menggunakan Framer Motion.
   Typography: Sans-serif modern (Inter/Geist) untuk body, Monospace (JetBrains Mono) untuk aksen kode/Web3.
3. Tech Stack Mapping
   Framework: Next.js 15/16+ (App Router, RSC).
   Styling: Tailwind CSS v4 (CSS-first config), shadcn/ui.
   Animation: Framer Motion (Parallax, Scroll, Gestures).
   State & URL: Zustand (Global UI state), nuqs (URL search params state).
   Data Fetching: React Query (TanStack Query), Axios.
   Forms & Validation: React Hook Form (RHF), Zod.
   Database & ORM: Supabase (PostgreSQL), Prisma.
   Auth: Better Auth.
   Utilities: use-debounce, react-table (untuk Admin Dashboard / Data Table Proyek).
4. Core Features
   A. Public Facing (Landing Page)
   Hero Section: Full-screen parallax background, animated text, glowing CTA.
   About Me: Konteks mahasiswa Sistem Informasi, tech stack marquee, scroll-triggered animations.
   Projects Showcase: Grid/List view proyek dengan hover effects (glassmorphism). Filter kategori menggunakan nuqs dan use-debounce.
   Experience/Timeline: Vertical timeline dengan animasi fade-in-up.
   Contact Section: Form kontak (RHF + Zod) yang mengirim data ke Supabase/Email.
   B. Admin Dashboard (Protected Route)
   Authentication: Login page menggunakan Better Auth.
   Project Management: CRUD Proyek menggunakan react-table (sorting, pagination, filtering).
   Analytics/Stats: Dashboard sederhana menampilkan jumlah visitor atau pesan masuk.
