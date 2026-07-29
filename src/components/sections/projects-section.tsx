"use client";

import {
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

// --- MOCK DATA (Ganti dengan data dari Prisma nanti) ---
const featuredProjects = [
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

// --- SUB-COMPONENT: 3D Tilt Project Card ---
function ProjectCard({
  project,
  index,
}: {
  project: (typeof featuredProjects)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 20, stiffness: 150 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [6, -6]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-6, 6]),
    springConfig,
  );

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="group relative"
    >
      {/* Glow Effect behind card */}
      <div className="absolute -inset-0.5 bg-linear-to-br from-accent/30 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Main Card */}
      <div className="relative h-full rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-accent/30">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            style={{ transform: "translateZ(20px)" }}
          />
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-4"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-accent-muted text-accent border border-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-text-secondary leading-relaxed">
            {project.description}
          </p>

          <Link
            href={project.link}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary group-hover:text-accent transition-colors mt-2"
          >
            View Case Study
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </m.div>
  );
}

// --- MAIN SECTION ---
export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax Background Elements
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section ref={sectionRef} className="relative  overflow-hidden pb-14">
      {/* Parallax Background Blobs */}
      <m.div
        style={{ y: bgY1 }}
        className="absolute top-0 right-0 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
      />

      {/* PERBAIKAN: Pastikan string className ini dalam SATU BARIS tanpa Enter di tengah */}
      <m.div
        style={{ y: bgY2 }}
        className="absolute bottom-0 left-0 w-150 h-150 bg-white/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
            Selected Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Featured <span className="text-gradient-elegant">Projects</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A glimpse into my recent work, showcasing scalable architecture and
            immersive user experiences.
          </p>
        </m.div>

        {/* Projects Grid (Cascading Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View All CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"
          >
            View All Projects
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </m.div>
      </div>
    </section>
  );
}
