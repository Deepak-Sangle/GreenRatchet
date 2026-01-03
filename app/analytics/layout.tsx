import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/dashboard/header";
import { Nav } from "@/components/dashboard/nav";

export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user || !user.organization) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen flex-col">
      <Header
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        organizationName={user.organization.name}
      />
      <div className="flex flex-1 overflow-hidden">
        <Nav role={user.role} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
