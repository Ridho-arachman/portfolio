import { ContactPageContent } from "./contact-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with me — open to new opportunities, collaborations, and project discussions.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return <ContactPageContent />;
}
