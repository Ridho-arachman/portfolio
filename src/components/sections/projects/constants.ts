import { type MotionValue, type Variants } from "framer-motion";

export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  role?: string;
  year?: string;
  gallery?: string[];
  highlights?: string[];
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}

export interface ProjectsBackgroundProps {
  bgY1: MotionValue<number>;
  bgY2: MotionValue<number>;
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const FEATURED_PROJECTS: Project[] = [
  {
    id: 1,
    slug: "web3-portfolio",
    title: "Web3 Portfolio Platform",
    description:
      "Immersive portfolio experience with heavy parallax, 3D tilt effects, and seamless dark/light mode transitions.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    tags: ["Next.js", "Framer Motion", "Tailwind v4"],
    link: "/projects/web3-portfolio",
    role: "Frontend Developer",
    year: "2024",
    gallery: [
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    ],
    highlights: [
      "Membangun pengalaman portofolio imersif dengan animasi paralaks dan efek 3D tilt.",
      "Menerapkan sistem dark/light mode yang mulus menggunakan next-themes.",
      "Mengoptimalkan performa hingga 95+ pada Lighthouse melalui code splitting dan image optimization.",
      "Arsitektur komponen modular dengan shadcn/ui dan konvensi facade/barrel.",
    ],
  },
  {
    id: 2,
    slug: "saas-dashboard",
    title: "SaaS Admin Dashboard",
    description:
      "Comprehensive analytics dashboard featuring real-time data visualization, role-based access, and advanced data tables.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    tags: ["React", "Prisma", "Supabase"],
    link: "/projects/saas-dashboard",
    role: "Fullstack Developer",
    year: "2023",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop",
    ],
    highlights: [
      "Membangun dashboard analitik real-time dengan visualisasi data interaktif.",
      "Mengimplementasikan role-based access control menggunakan Better Auth.",
      "Model data PostgreSQL dengan Prisma dan query terparameterisasi yang aman.",
      "Data table canggih dengan filter, sorting, dan pagination.",
    ],
  },
  {
    id: 3,
    slug: "ecommerce-api",
    title: "E-Commerce API Gateway",
    description:
      "High-performance, scalable backend architecture with automated CI/CD pipelines and comprehensive test coverage.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    link: "/projects/ecommerce-api",
    role: "Backend Developer",
    year: "2023",
    gallery: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop",
    ],
    highlights: [
      "Merancang arsitektur API gateway yang scalable dan berkinerja tinggi.",
      "Pipeline CI/CD otomatis dengan Docker dan GitHub Actions.",
      "Test coverage komprehensif untuk menjaga kualitas kode.",
      "Desain database PostgreSQL yang optimal dengan indeks dan constraint.",
    ],
  },
];

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;