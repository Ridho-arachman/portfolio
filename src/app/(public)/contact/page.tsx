import { ContactSection } from "@/components/sections/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Ridho.dev",
  description:
    "Get in touch with me — open to new opportunities, collaborations, and project discussions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-32 bg-bg-primary overflow-x-hidden">
      <ContactSection />
    </main>
  );
}
