import { auth } from "@/auth";
import { Header } from "@/components/dashboard/header";
import { Nav } from "@/components/dashboard/nav";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
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
    <div className="flex h-screen flex-col bg-background">
      <Header
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        organizationName={user.organization.name}
      />
      <div className="flex flex-1 overflow-hidden">
        <Nav role={user.role} />
        <main className="flex-1 overflow-y-auto bg-mesh p-8 scrollbar-thin">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
