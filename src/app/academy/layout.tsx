import { ProtectedLayout } from "@/components/auth/ProtectedLayout";

export default async function AcademyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
