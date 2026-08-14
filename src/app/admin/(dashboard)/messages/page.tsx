import type { Metadata } from "next";
import { MessagesInbox } from "@/components/sections/admin-messages";

export const metadata: Metadata = {
  title: "Messages",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminMessagesPage() {
  return <MessagesInbox />;
}
