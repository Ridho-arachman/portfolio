import { ContactSection } from "@/components/sections/contact";
import { Metadata } from "next";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const metadata: Metadata = {
  title: `Contact | ${env.NEXT_PUBLIC_SITE_NAME}`,
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