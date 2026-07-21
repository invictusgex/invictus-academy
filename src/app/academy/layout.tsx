import { ProtectedLayout } from "@/components/auth/ProtectedLayout";
import { getAcademyProgram } from "@/lib/academy";

export default async function AcademyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const course = await getAcademyProgram();

  return <ProtectedLayout course={course}>{children}</ProtectedLayout>;
}
