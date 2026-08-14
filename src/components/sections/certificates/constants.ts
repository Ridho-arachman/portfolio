import type { MotionValue } from "framer-motion";

export interface CertificateListData {
  id: number;
  slug: string;
  title: string;
  issuer: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate: string;
  period: string;
  thumbnail: string;
  skills: string[];
  summary: string[];
}

export interface CertificateCardProps {
  cert: CertificateListData;
  index?: number; // Ditambahkan untuk animasi staggered (bertahap)
}

export interface CertificatesBackgroundProps {
  bgY1: MotionValue<number>;
  bgY2: MotionValue<number>;
}

export const CERTIFICATES_VIEWPORT = {
  once: false,
  amount: 0.2,
  margin: "0px 0px -100px 0px",
} as const;

export const CERTIFICATES_LIST: CertificateListData[] = [
  {
    id: 1,
    slug: "aws-certified-cloud-practitioner",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    credentialId: "AWS-CP-8F3K2Q1X",
    credentialUrl: "https://www.credly.com/",
    issueDate: "March 2024",
    period: "Issued Mar 2024 · No Expiration",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    skills: ["Cloud Computing", "AWS", "IT Fundamentals", "Architecture"],
    summary: [
      "Memahami konsep cloud computing, model layanan (IaaS, PaaS, SaaS), dan model pricing AWS.",
      "Menguasai layanan inti AWS: EC2, S3, RDS, IAM, VPC, dan Lambda.",
      "Mampu menjelaskan prinsip arsitektur cloud yang aman, hemat biaya, dan berkinerja tinggi.",
    ],
  },
  {
    id: 2,
    slug: "meta-front-end-developer",
    title: "Meta Front-End Developer Professional Certificate",
    issuer: "Meta · Coursera",
    credentialId: "META-FE-2024-8842",
    credentialUrl: "https://www.coursera.org/",
    issueDate: "January 2024",
    period: "Issued Jan 2024 · No Expiration",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    skills: ["React", "JavaScript", "UI/UX", "Responsive Design"],
    summary: [
      "Membangun aplikasi front-end interaktif dengan React dan JavaScript modern.",
      "Menerapkan prinsip aksesibilitas, performance, dan testing pada aplikasi web.",
      "Mendesain UI yang responsif dan user-friendly menggunakan best practices UX.",
    ],
  },
  {
    id: 3,
    slug: "hackerrank-sql-intermediate",
    title: "SQL (Intermediate)",
    issuer: "HackerRank",
    credentialId: "HR-SQL-I-2210",
    credentialUrl: "https://www.hackerrank.com/certificates",
    issueDate: "November 2023",
    period: "Issued Nov 2023 · No Expiration",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    skills: ["SQL", "PostgreSQL", "Data Query"],
    summary: [
      "Menyusun query SQL kompleks: JOIN, subquery, window function, dan aggregate.",
      "Mengoptimalkan query untuk performa dan efisiensi database.",
      "Menganalisis data multi-tabel menggunakan skema database relasional.",
    ],
  },
  {
    id: 4,
    slug: "google-ux-design",
    title: "Google UX Design Professional Certificate",
    issuer: "Google · Coursera",
    credentialId: "GOOGLE-UX-2023-5517",
    credentialUrl: "https://www.coursera.org/",
    issueDate: "September 2023",
    period: "Issued Sep 2023 · No Expiration",
    thumbnail:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop",
    skills: ["UX Research", "Figma", "Wireframing", "Prototyping"],
    summary: [
      "Menjalankan riset pengguna dan membuat empathy maps serta user personas.",
      "Mendesain wireframe, mockup, dan prototype interaktif menggunakan Figma.",
      "Melakukan usability testing dan iterasi desain berdasarkan feedback pengguna.",
    ],
  },
  {
    id: 5,
    slug: "dicoding-web-programming",
    title: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding Indonesia",
    credentialId: "DIC-WEB-2023-1193",
    credentialUrl: "https://www.dicoding.com/certificates",
    issueDate: "August 2023",
    period: "Issued Aug 2023 · No Expiration",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    skills: ["HTML", "CSS", "JavaScript", "Web Fundamentals"],
    summary: [
      "Membangun halaman web semantik menggunakan HTML5 dan CSS modern.",
      "Menerapkan JavaScript untuk interaktivitas dan manipulasi DOM.",
      "Mengikuti standar web accessibility dan responsive design.",
    ],
  },
];
