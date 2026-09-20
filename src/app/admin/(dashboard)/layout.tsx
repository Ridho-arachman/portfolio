import type { Metadata } from "next";
import { AdminSidebar } from "@/components/sections/admin-dashboard";
import { AdminMobileSidebar } from "@/components/sections/admin-dashboard/admin-mobile-sidebar";
import { AdminSidebarProvider } from "@/components/sections/admin-dashboard/admin-sidebar-context";
import { AdminTopbarWrapper } from "@/components/sections/admin-dashboard/admin-topbar-wrapper";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import { NuqsAdapterProvider } from "@/components/providers/nuqs-adapter-provider";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminSidebarProvider>
      <AdminMobileSidebar />
      <AdminTopbarWrapper />
      <NuqsAdapterProvider>
        <QueryClientProviderWrapper>
          <div className="relative flex min-h-screen overflow-x-clip bg-bg-primary">
            <div className="fixed top-[-10%] right-[-10%] w-150 h-150 bg-accent/5 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-125 h-125 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

            <AdminSidebar />

            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
              {children}
            </div>
          </div>
        </QueryClientProviderWrapper>
      </NuqsAdapterProvider>
    </AdminSidebarProvider>
  );
}
