import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type UserWithOrg = {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    employeeCount: number | null;
    annualRevenue: number | null;
  } | null;
};

/**
 * Common auth and user validation for server actions
 */
export async function validateUserSession(): Promise<
  { success: true; user: UserWithOrg } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          employeeCount: true,
          annualRevenue: true,
        },
      },
    },
  });

  if (!user?.organizationId) {
    return { error: "No organization found" };
  }

  return { 
    success: true, 
    user: {
      id: user.id,
      organizationId: user.organizationId,
      organization: user.organization,
    }
  };
}

/**
 * Get active cloud connections for an organization
 */
export async function getActiveCloudConnections(organizationId: string) {
  const cloudConnections = await prisma.cloudConnection.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: { id: true },
  });

  if (cloudConnections.length === 0) {
    return { error: "No active cloud connections found" };
  }

  return { success: true as const, connectionIds: cloudConnections.map((c) => c.id) };
}

/**
 * Standard error handler for server actions
 */
export function handleServerActionError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error);
  return {
    error: error instanceof Error ? error.message : `Failed to ${context}`,
  };
}

/**
 * Wrapper for server actions with common patterns
 */
export async function withServerAction<T>(
  action: (user: UserWithOrg) => Promise<T>,
  context: string
): Promise<{ success: true; data: T } | { error: string }> {
  try {
    const userResult = await validateUserSession();
    if ("error" in userResult) {
      return { error: userResult.error };
    }

    const data = await action(userResult.user);
    return { success: true, data };
  } catch (error) {
    return handleServerActionError(error, context);
  }
}
