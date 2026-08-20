"use client";

import { AdminTopbar } from "./admin-topbar";

export function AdminTopbarWrapper() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <AdminTopbar today={today} />;
}