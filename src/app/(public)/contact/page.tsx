import { ContactSection } from "@/components/sections/contact";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with me — open to new opportunities, collaborations, and project discussions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-32 bg-bg-primary overflow-x-hidden">
      <ContactSection />
    </main>
  );
}