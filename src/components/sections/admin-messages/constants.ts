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
  deleteLabel: "Delete",
  deleteConfirmLabel: "Ya, Hapus",
  deleteConfirmTitle: "Hapus Message?",
  deleteConfirmDescription: "Message akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
  markReadLabel: "Mark read",
  markRepliedLabel: "Mark replied",
  archiveLabel: "Archive",
  unarchiveLabel: "Unarchive",
  errorTitle: "Failed to load messages",
  errorNote: "Something went wrong while fetching messages.",
  retryLabel: "Retry",
} as const;
