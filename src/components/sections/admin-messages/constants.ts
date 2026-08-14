export const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export const MESSAGE_STATUS_META: Record<
  MessageStatus,
  { label: string; badgeClass: string }
> = {
  NEW: {
    label: "New",
    badgeClass: "bg-accent-muted text-accent",
  },
  READ: {
    label: "Read",
    badgeClass: "bg-sky-500/10 text-sky-400",
  },
  REPLIED: {
    label: "Replied",
    badgeClass: "bg-emerald-500/10 text-emerald-400",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "bg-white/5 text-text-muted",
  },
};

export const ADMIN_MESSAGES = {
  title: "Messages",
  subtitle: "Manage your inbox and visitor messages.",
  searchPlaceholder: "Search messages...",
  allLabel: "All",
  emptyTitle: "No messages found",
  emptyNote: "Try a different filter or search.",
  emptyInboxTitle: "Inbox is empty",
  emptyInboxNote: "New messages from the contact form will appear here.",
  markAllReadLabel: "Mark all read",
  markAllReadConfirmLabel: "Mark all?",
  resetLabel: "Reset data",
  resetConfirmLabel: "Reset all?",
  deleteLabel: "Delete",
  deleteConfirmLabel: "Sure?",
  markReadLabel: "Mark read",
  markUnreadLabel: "Mark unread",
  markRepliedLabel: "Mark replied",
  archiveLabel: "Archive",
  unarchiveLabel: "Unarchive",
  mockNote: "Mockup — data disimpan di localStorage, integrasi backend menyusul.",
} as const;

const MESSAGES: Array<
  Omit<AdminMessage, "id" | "updatedAt"> & { id: string }
> = [
  {
    id: "msg-1",
    name: "Andi Pratama",
    email: "andi.pratama@gmail.com",
    subject: "Web Developer Opportunity",
    content:
      "Halo Ridho, saya melihat portfolio kamu dan sangat tertarik dengan pengalamanmu sebagai frontend developer. Perusahaan kami sedang mencari React/Next.js developer untuk proyek internal. Apakah kamu tersedia untuk diskusi awal minggu ini?",
    status: "NEW",
    createdAt: "2026-08-14T08:30:00.000Z",
  },
  {
    id: "msg-2",
    name: "Sarah Wijaya",
    email: "sarah.wijaya@startup.co.id",
    subject: "Freelance Landing Page",
    content:
      "Hi Ridho! Kami butuh landing page untuk produk baru startup kami. Estimasi budget sudah kami siapkan, kira-kira timeline pengerjaannya berapa lama ya? Boleh minta rate card kamu?",
    status: "NEW",
    createdAt: "2026-08-14T06:15:00.000Z",
  },
  {
    id: "msg-3",
    name: "Budi Santoso",
    email: "budi.santoso@university.ac.id",
    subject: "Undangan Workshop Web Development",
    content:
      "Kami mengundang kamu menjadi pembicara workshop Next.js untuk mahasiswa semester akhir. Durasi 3 jam, diselenggarakan bulan depan. Apakah kamu bersedia? Kami bisa menyesuaikan jadwal.",
    status: "READ",
    createdAt: "2026-08-13T11:40:00.000Z",
  },
  {
    id: "msg-4",
    name: "Maya Kusuma",
    email: "maya.kusuma@designstudio.id",
    subject: "Kolaborasi UI/UX + Frontend",
    content:
      "Halo, saya UI/UX designer dan sedang mencari frontend developer untuk kolaborasi proyek agency. Sudah melihat project portfolio kamu di bagian experience, keren! Mau ngobrol lebih lanjut?",
    status: "READ",
    createdAt: "2026-08-12T14:05:00.000Z",
  },
  {
    id: "msg-5",
    name: "Rizky Firmansyah",
    email: "rizky.firmansyah@gmail.com",
    subject: "Recruiter — Tech Company",
    content:
      "Saya recruiter dari perusahaan teknologi besar. Kami membuka posisi Frontend Engineer dan profilmu sangat cocok. Bisa share CV dan ketersediaan waktumu untuk interview? Terima kasih!",
    status: "REPLIED",
    createdAt: "2026-08-11T09:20:00.000Z",
  },
  {
    id: "msg-6",
    name: "Dewi Lestari",
    email: "dewi.lestari@agency.co",
    subject: "Request Portfolio Review",
    content:
      "Hi! Tim kami sedang membangun ulang website agency dan ingin masukan dari developer berpengalaman. Boleh minta feedback singkat tentang struktur portfolio kamu? Terima kasih banyak.",
    status: "REPLIED",
    createdAt: "2026-08-10T16:45:00.000Z",
  },
  {
    id: "msg-7",
    name: "Fajar Nugroho",
    email: "fajar.nugroho@me.com",
    subject: "Mentoring & Bootcamp",
    content:
      "Saya mahasiswa yang ingin belajar web development. Saya melihat perjalanan kamu dari freelance sampai kepengurusan himpunan, sangat inspiratif! Apakah kamu menerima sesi mentoring 1-on-1?",
    status: "ARCHIVED",
    createdAt: "2026-08-08T10:00:00.000Z",
  },
  {
    id: "msg-8",
    name: "Intan Permata",
    email: "intan.permata@company.com",
    subject: "Partnership & Guest Post",
    content:
      "Kami menawarkan kerja sama sponsorship konten untuk blog/portfolio kamu. Mohon info tarif dan traffic bulanan halaman portfolio. Terima kasih.",
    status: "ARCHIVED",
    createdAt: "2026-08-06T07:55:00.000Z",
  },
];

export const SEED_MESSAGES: AdminMessage[] = MESSAGES.map((message) => ({
  ...message,
  updatedAt: message.createdAt,
}));
