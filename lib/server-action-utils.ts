import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type UserWithOrg = {
  id: string;
  organizationId: string;
  role: string;
  organization: {
    id: string;
    employeeCount: number | null;
    annualRevenue: number | null;
  } | null;
};

/**
 * Get authenticated user with organization
 */
export async function getAuthenticatedUser(): Promise<
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
      role: true,
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
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    },
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

  return {
    success: true as const,
    connectionIds: cloudConnections.map((c) => c.id),
  };
}

/**
 * Standard error handler for server actions
 */
export function handleServerActionError(error: unknown, context: string) {
  console.error(`Error in ${context}:`, error);

  // Handle Zod validation errors
  if (error && typeof error === "object" && "errors" in error) {
    const zodError = error as { errors: Array<{ message: string }> };
    return {
      error: zodError.errors[0]?.message ?? `Validation failed in ${context}`,
    };
  }

  return {
    error: error instanceof Error ? error.message : `Failed to ${context}`,
  };
}

/**
 * Wrapper for server actions with automatic caching (5 minutes default)
 * unstable_cache automatically creates cache keys from function implementation and arguments
 */
export async function withServerAction<T>(
  action: (user: UserWithOrg) => Promise<T>,
  context: string,
): Promise<{ success: true; data: T } | { error: string }> {
  try {
    const userResult = await getAuthenticatedUser();
    if ("error" in userResult) {
      return { error: userResult.error };
    }

    const user = userResult.user;

    // Wrap action with caching - unstable_cache handles cache keys automatically
    const cachedAction = unstable_cache(
      async () => action(user),
      [context, user.organizationId],
      {
        revalidate: 300, // 5 minutes
        tags: [`org:${user.organizationId}`, `action:${context}`],
      },
    );

    const data = await cachedAction();
    return { success: true, data };
  } catch (error) {
    return handleServerActionError(error, context);
  }
}
