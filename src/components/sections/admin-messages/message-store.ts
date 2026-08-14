import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_MESSAGES,
  type AdminMessage,
  type MessageStatus,
} from "./constants";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface MessageStore {
  messages: AdminMessage[];
  addMessage: (
    data: Pick<AdminMessage, "name" | "email" | "subject" | "content">,
  ) => void;
  setStatus: (id: string, status: MessageStatus) => void;
  deleteMessage: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: SEED_MESSAGES,

      addMessage: (data) => {
        const now = new Date().toISOString();
        const message: AdminMessage = {
          ...data,
          id: createId(),
          status: "NEW",
          createdAt: now,
          updatedAt: now,
        };
        set({ messages: [message, ...get().messages] });
      },

      setStatus: (id, status) => {
        const now = new Date().toISOString();
        set({
          messages: get().messages.map((message) =>
            message.id === id ? { ...message, status, updatedAt: now } : message,
          ),
        });
      },

      deleteMessage: (id) => {
        set({ messages: get().messages.filter((m) => m.id !== id) });
      },

      markAllRead: () => {
        const now = new Date().toISOString();
        set({
          messages: get().messages.map((message) =>
            message.status === "NEW" || message.status === "READ"
              ? { ...message, status: "READ", updatedAt: now }
              : message,
          ),
        });
      },

      reset: () => set({ messages: SEED_MESSAGES }),
    }),
    {
      name: "admin-messages",
    },
  ),
);
