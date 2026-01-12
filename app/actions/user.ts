"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  UpdateOrganizationSchema,
  UpdateUserSchema,
  type UpdateOrganizationForm,
  type UpdateUserForm,
} from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

/**
 * Updates user profile name
 */
export async function updateUserAction(
  data: UpdateUserForm
): Promise<{ success: true } | { error: string }> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return { error: "User not found" };

    // 3. Validate with Zod
    const validated = await UpdateUserSchema.parseAsync(data);

    // 4. Database operation
    await prisma.user.update({
      where: { id: user.id },
      data: { name: validated.name },
    });

    // 6. Revalidate paths
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Updates organization details
 */
export async function updateOrganizationAction(
  data: UpdateOrganizationForm
): Promise<{ success: true } | { error: string }> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 2. Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user || !user.organization) {
      return { error: "Organization not found" };
    }

    // 3. Validate with Zod
    const validated = await UpdateOrganizationSchema.parseAsync(data);

    // 4. Database operation
    await prisma.organization.update({
      where: { id: user.organization.id },
      data: {
        name: validated.name,
        headquarters: validated.headquarters || null,
        linkedinUrl: validated.linkedinUrl || null,
        employeeCount: validated.employeeCount,
        annualRevenue: validated.annualRevenue,
      },
    });

    // 6. Revalidate paths
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update organization",
    };
  }
}

/**
 * Deletes user account
 */
export async function deleteUserAction(): Promise<
  { success: true } | { error: string }
> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return { error: "User not found" };

    // 4. Database operation - delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
}
