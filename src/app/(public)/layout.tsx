import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </>
  );
}
