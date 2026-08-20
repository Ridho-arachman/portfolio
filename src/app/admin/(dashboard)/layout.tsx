import { AdminSidebar } from "@/components/sections/admin-dashboard";
import { AdminMobileSidebar } from "@/components/sections/admin-dashboard/admin-mobile-sidebar";
import { AdminSidebarProvider } from "@/components/sections/admin-dashboard/admin-sidebar-context";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminSidebarProvider>
      <div className="relative flex min-h-screen overflow-x-clip bg-bg-primary">
        <div className="fixed top-[-10%] right-[-10%] w-150 h-150 bg-accent/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[-10%] w-125 h-125 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

        <AdminSidebar />
        <AdminMobileSidebar />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
