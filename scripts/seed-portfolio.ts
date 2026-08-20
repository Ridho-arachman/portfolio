import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.category.deleteMany();

  // 1. Create Categories
  const webDevCategory = await prisma.category.create({
    data: {
      name: "Web Development",
      slug: "web-dev",
      description: "Full-stack web development projects",
      order: 1,
    },
  });

  const mobileCategory = await prisma.category.create({
    data: {
      name: "Mobile Development",
      slug: "mobile-dev",
      description: "Mobile application projects",
      order: 2,
    },
  });

  // 2. Create Projects
  await prisma.project.createMany({
    data: [
      {
        slug: "portfolio-website",
        title: "Portfolio Website",
        description:
          "A modern portfolio website built with Next.js, featuring smooth animations, dark mode, and responsive design. Includes a blog, project showcase, and contact form.",
        thumbnail:
          "https://picsum.photos/seed/portfolio-web/600/400",
        liveUrl: "https://example.com",
        repoUrl: "https://github.com/example/portfolio",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
        gallery: [
          "https://picsum.photos/seed/portfolio-g1/800/600",
          "https://picsum.photos/seed/portfolio-g2/800/600",
          "https://picsum.photos/seed/portfolio-g3/800/600",
        ],
        role: "Full Stack Developer",
        year: "2024",
        highlights: ["Responsive design", "Dark mode", "SEO optimized"],
        isPublished: true,
        order: 1,
        categoryId: webDevCategory.id,
      },
      {
        slug: "e-commerce-platform",
        title: "E-Commerce Platform",
        description:
          "Full-featured e-commerce platform with product catalog, shopping cart, payment integration, and admin dashboard.",
        thumbnail:
          "https://picsum.photos/seed/e-commerce/600/400",
        liveUrl: "https://example.com/shop",
        repoUrl: "https://github.com/example/ecommerce",
        technologies: ["Next.js", "Prisma", "PostgreSQL", "Stripe"],
        gallery: [
          "https://picsum.photos/seed/ecom-g1/800/600",
          "https://picsum.photos/seed/ecom-g2/800/600",
          "https://picsum.photos/seed/ecom-g3/800/600",
          "https://picsum.photos/seed/ecom-g4/800/600",
        ],
        role: "Backend Developer",
        year: "2024",
        highlights: [
          "Payment integration",
          "Real-time inventory",
          "Admin dashboard",
        ],
        isPublished: true,
        order: 2,
        categoryId: webDevCategory.id,
      },
      {
        slug: "task-management-app",
        title: "Task Management App",
        description:
          "Collaborative task management application with real-time updates, drag-and-drop interface, and team workspaces.",
        thumbnail:
          "https://picsum.photos/seed/task-app/600/400",
        liveUrl: "https://example.com/tasks",
        repoUrl: "https://github.com/example/taskapp",
        technologies: ["React", "Node.js", "Socket.io", "MongoDB"],
        gallery: [
          "https://picsum.photos/seed/task-g1/800/600",
          "https://picsum.photos/seed/task-g2/800/600",
        ],
        role: "Full Stack Developer",
        year: "2023",
        highlights: [
          "Real-time collaboration",
          "Drag-and-drop",
          "Team workspaces",
        ],
        isPublished: true,
        order: 3,
        categoryId: webDevCategory.id,
      },
    ],
  });

  // 3. Create Experiences
  await prisma.experience.createMany({
    data: [
      {
        slug: "senior-frontend-developer",
        title: "Senior Frontend Developer",
        company: "Tech Company",
        type: "WORK",
        location: "Jakarta, Indonesia",
        thumbnail: "https://picsum.photos/seed/senior-fe/600/400",
        startDate: new Date("2023-01-01"),
        isCurrent: true,
        description: [
          "Led frontend architecture migration from legacy codebase to Next.js",
          "Implemented design system used across 5 products",
          "Mentored 3 junior developers",
        ],
        gallery: [
          "https://picsum.photos/seed/senior-g1/800/600",
          "https://picsum.photos/seed/senior-g2/800/600",
        ],
        order: 1,
      },
      {
        slug: "full-stack-developer",
        title: "Full Stack Developer",
        company: "Startup Inc",
        type: "WORK",
        location: "Remote",
        thumbnail: "https://picsum.photos/seed/fullstack/600/400",
        startDate: new Date("2021-06-01"),
        endDate: new Date("2022-12-31"),
        isCurrent: false,
        description: [
          "Built and maintained microservices architecture",
          "Developed real-time features using WebSocket",
          "Reduced API response time by 40%",
        ],
        gallery: [
          "https://picsum.photos/seed/fullstack-g1/800/600",
        ],
        order: 2,
      },
      {
        slug: "frontend-developer-intern",
        title: "Frontend Developer Intern",
        company: "Digital Agency",
        type: "WORK",
        location: "Bandung, Indonesia",
        thumbnail: "https://picsum.photos/seed/fe-intern/600/400",
        startDate: new Date("2020-01-01"),
        endDate: new Date("2020-06-30"),
        isCurrent: false,
        description: [
          "Developed responsive websites for 10+ clients",
          "Learned modern React patterns and best practices",
        ],
        gallery: [],
        order: 3,
      },
    ],
  });

  // 4. Create Certificates
  await prisma.certificate.createMany({
    data: [
      {
        slug: "aws-solutions-architect",
        title: "AWS Solutions Architect Associate",
        issuer: "Amazon Web Services",
        thumbnail: "https://picsum.photos/seed/aws-cert/600/400",
        credentialId: "AWS-SAA-2024",
        credentialUrl: "https://aws.amazon.com/certification",
        issueDate: new Date("2024-03-01"),
        skills: ["AWS", "Cloud Architecture", "Serverless"],
        summary: [
          "Cloud architecture best practices",
          "Cost optimization",
          "Security patterns",
        ],
        gallery: [
          "https://picsum.photos/seed/aws-g1/800/600",
          "https://picsum.photos/seed/aws-g2/800/600",
        ],
        isPublished: true,
        order: 1,
      },
      {
        slug: "google-cloud-professional",
        title: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        thumbnail: "https://picsum.photos/seed/gcp-cert/600/400",
        credentialId: "GCP-PD-2023",
        credentialUrl: "https://cloud.google.com/certification",
        issueDate: new Date("2023-09-01"),
        skills: ["GCP", "Kubernetes", "Cloud Functions"],
        summary: ["GCP services and architecture", "Container orchestration"],
        gallery: [
          "https://picsum.photos/seed/gcp-g1/800/600",
        ],
        isPublished: true,
        order: 2,
      },
      {
        slug: "meta-react-developer",
        title: "Meta React Developer Certificate",
        issuer: "Meta",
        thumbnail: "https://picsum.photos/seed/meta-cert/600/400",
        credentialId: "META-RD-2023",
        credentialUrl:
          "https://www.coursera.org/professional-certificates/meta-react-developer",
        issueDate: new Date("2023-05-01"),
        skills: ["React", "React Router", "React Hooks"],
        summary: [
          "Advanced React patterns",
          "State management",
          "Testing",
        ],
        gallery: [
          "https://picsum.photos/seed/meta-g1/800/600",
          "https://picsum.photos/seed/meta-g2/800/600",
          "https://picsum.photos/seed/meta-g3/800/600",
        ],
        isPublished: true,
        order: 3,
      },
    ],
  });

  // 5. Create Skills
  await prisma.skill.createMany({
    data: [
      { name: "React", category: "FRONTEND", proficiency: 90, order: 1 },
      { name: "Next.js", category: "FRONTEND", proficiency: 85, order: 2 },
      { name: "TypeScript", category: "FRONTEND", proficiency: 85, order: 3 },
      {
        name: "Tailwind CSS",
        category: "FRONTEND",
        proficiency: 90,
        order: 4,
      },
      { name: "Node.js", category: "BACKEND", proficiency: 80, order: 1 },
      { name: "Python", category: "BACKEND", proficiency: 70, order: 2 },
      {
        name: "PostgreSQL",
        category: "DATABASE",
        proficiency: 75,
        order: 1,
      },
      { name: "MongoDB", category: "DATABASE", proficiency: 70, order: 2 },
      { name: "Docker", category: "DEVOPS_TOOLS", proficiency: 70, order: 1 },
      { name: "Git", category: "DEVOPS_TOOLS", proficiency: 85, order: 2 },
      { name: "AWS", category: "DEVOPS_TOOLS", proficiency: 65, order: 3 },
    ],
  });

  // 6. Create mobile category projects (empty for now)
  // Add mobile projects here as needed

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
