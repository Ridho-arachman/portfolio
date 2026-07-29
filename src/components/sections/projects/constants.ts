import { type MotionValue, type Variants } from "framer-motion";

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
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
    title: "Web3 Portfolio Platform",
    description:
      "Immersive portfolio experience with heavy parallax, 3D tilt effects, and seamless dark/light mode transitions.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    tags: ["Next.js", "Framer Motion", "Tailwind v4"],
    link: "/projects/web3-portfolio",
  },
  {
    id: 2,
    title: "SaaS Admin Dashboard",
    description:
      "Comprehensive analytics dashboard featuring real-time data visualization, role-based access, and advanced data tables.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    tags: ["React", "Prisma", "Supabase"],
    link: "/projects/saas-dashboard",
  },
  {
    id: 3,
    title: "E-Commerce API Gateway",
    description:
      "High-performance, scalable backend architecture with automated CI/CD pipelines and comprehensive test coverage.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    link: "/projects/ecommerce-api",
  },
];

export const REPLAY_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;
