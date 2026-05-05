import { redirect } from "next/navigation";
import { getUser } from "@/lib/services/auth.service";
import { PageTransition } from "@/components/page-transition";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/auth");
  return <PageTransition>{children}</PageTransition>;
}
