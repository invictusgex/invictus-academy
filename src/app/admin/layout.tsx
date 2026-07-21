import { AdminProtectedLayout } from "@/components/auth/AdminProtectedLayout";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProtectedLayout>
      <AdminShell>{children}</AdminShell>
    </AdminProtectedLayout>
  );
}
