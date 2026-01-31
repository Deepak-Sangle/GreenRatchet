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
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
        organization={{
          id: user.organization.id,
          name: user.organization.name,
          headquarters: user.organization.headquarters,
          linkedinUrl: user.organization.linkedinUrl,
          employeeCount: user.organization.employeeCount,
          annualRevenue: user.organization.annualRevenue,
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        <Nav
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          }}
          organization={{
            id: user.organization.id,
            name: user.organization.name,
            headquarters: user.organization.headquarters,
            linkedinUrl: user.organization.linkedinUrl,
            employeeCount: user.organization.employeeCount,
            annualRevenue: user.organization.annualRevenue,
          }}
        />
        <main className="flex-1 overflow-y-auto bg-mesh p-8 scrollbar-thin">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
