"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateKPIFormSchema, type CreateKPIForm } from "@/lib/validations/kpi";
import { revalidatePath, revalidateTag } from "next/cache";

async function validateUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user) {
    return { error: "User not found", user: null };
  }

  return { user, error: null };
}

export async function createKPI(data: CreateKPIForm) {
  try {
    const { user, error } = await validateUser();
    if (error || !user) return { error: error || "Unauthorized" };

    if (!user.organizationId) {
      return { error: "Organization required" };
    }

    const validated = await CreateKPIFormSchema.parseAsync(data);

    // Extract form-specific fields, transform to KPI model structure
    const { effectiveFrom, effectiveTo, ...kpiFields } = validated;

    console.log("validated", validated);
    const kpi = await prisma.kPI.create({
      data: {
        ...kpiFields,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        organizationId: user.organizationId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "KPI_CREATED",
        entity: "KPI",
        entityId: kpi.id,
        details: JSON.stringify({ kpiName: kpi.name }),
        userId: user.id,
        organizationId: user.organizationId,
        kpiId: kpi.id,
      },
    });

    revalidatePath("/kpis");
    revalidatePath("/analytics");
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error("Error creating KPI:", error);
    return { error: "Failed to create KPI" };
  }
}

export async function editKPI(kpiId: string, data: CreateKPIForm) {
  try {
    const { user, error } = await validateUser();
    if (error || !user) return { error: error || "Unauthorized" };

    // Verify KPI exists and belongs to user's organization
    const existingKPI = await prisma.kPI.findUnique({
      where: { id: kpiId },
    });

    if (!existingKPI) {
      return { error: "KPI not found" };
    }

    if (existingKPI.organizationId !== user.organizationId) {
      return { error: "You don't have permission to edit this KPI" };
    }

    const validated = await CreateKPIFormSchema.parseAsync(data);

    // Extract form-specific fields
    const { effectiveFrom, effectiveTo, ...kpiFields } = validated;

    const kpi = await prisma.kPI.update({
      where: { id: kpiId },
      data: {
        ...kpiFields,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "KPI_UPDATED",
        entity: "KPI",
        entityId: kpi.id,
        details: JSON.stringify({ kpiName: kpi.name }),
        userId: user.id,
        organizationId: user.organizationId,
        kpiId: kpi.id,
      },
    });

    revalidatePath("/kpis");
    revalidatePath("/analytics");
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error("Error editing KPI:", error);
    return { error: "Failed to edit KPI" };
  }
}

export async function deleteKPI(kpiId: string) {
  try {
    const { user, error } = await validateUser();
    if (error || !user) return { error: error || "Unauthorized" };

    const kpi = await prisma.kPI.findUnique({
      where: {
        id: kpiId,
        organizationId: user.organizationId ?? undefined,
      },
    });

    if (!kpi) {
      return { error: "KPI not found" };
    }

    // Delete the KPI
    await prisma.kPI.delete({
      where: { id: kpiId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "KPI_DELETED",
        entity: "KPI",
        entityId: kpiId,
        details: JSON.stringify({
          kpiName: kpi.name,
        }),
        userId: user.id,
        organizationId: user.organizationId,
      },
    });

    revalidatePath("/kpis");
    revalidatePath("/analytics");

    return { success: true };
  } catch (error) {
    console.error("Error deleting KPI:", error);
    return { error: "Failed to delete KPI" };
  }
}
