import type { Metadata } from "next";

import { AdminLayoutClient } from "@/app/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
