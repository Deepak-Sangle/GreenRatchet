"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateKPIFormSchema,
  CreateLoanFormSchema,
  CreateMarginRatchetFormSchema,
  UpdateKPIStatusSchema,
  type CreateKPIForm,
  type CreateLoanForm,
  type CreateMarginRatchetForm,
  type UpdateKPIStatus,
} from "@/lib/validations/loan";
import { revalidatePath, revalidateTag } from "next/cache";

async function validateUser(requiredRole?: "BORROWER" | "LENDER") {
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

  if (requiredRole && user.role !== requiredRole) {
    return {
      error: `Only ${requiredRole} can perform this action`,
      user: null,
    };
  }

  return { user, error: null };
}

export async function createLoan(data: CreateLoanForm) {
  try {
    const validated = await CreateLoanFormSchema.parseAsync(data);

    const { user, error } = await validateUser("BORROWER");
    if (!user) return { error: error ?? "Unauthorized" };

    if (!user.organizationId) {
      return { error: "Organization required to create loans" };
    }

    const loan = await prisma.loan.create({
      data: {
        ...validated,
        lenderOrg: undefined,
        borrowerOrg: undefined,
        borrowerOrgId: user.organizationId,
        createdByUser: undefined,
        createdByUserId: user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LOAN_CREATED",
        entity: "LOAN",
        entityId: loan.id,
        details: JSON.stringify({ loanName: loan.name }),
        userId: user.id,
        loanId: loan.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/loans");

    return { success: true, loanId: loan.id };
  } catch (error) {
    console.error("Error creating loan:", error);
    return { error: "Failed to create loan" };
  }
}

export async function createKPI(loanId: string, data: CreateKPIForm) {
  try {
    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    // Verify loan belongs to borrower's organization
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan || loan.borrowerOrgId !== user.organizationId) {
      return { error: "Loan not found" };
    }

    const validated = await CreateKPIFormSchema.parseAsync(data);

    // Extract form-specific fields, transform to KPI model structure
    const { effectiveFrom, effectiveTo, ...kpiFields } = validated;

    const kpi = await prisma.kPI.create({
      data: {
        ...kpiFields,
        status: "PROPOSED",
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        loanId,
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
        loanId,
        kpiId: kpi.id,
      },
    });

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/analytics");
    revalidateTag(`loan-${loanId}`);
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
    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    // Verify KPI exists and belongs to borrower's organization
    const existingKPI = await prisma.kPI.findUnique({
      where: { id: kpiId },
      include: { loan: true },
    });

    if (!existingKPI) {
      return { error: "KPI not found" };
    }

    if (existingKPI.loan.borrowerOrgId !== user.organizationId) {
      return { error: "You don't have permission to edit this KPI" };
    }

    const validated = await CreateKPIFormSchema.parseAsync(data);

    // Extract form-specific fields, transform to KPI model structure
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
        loanId: kpi.loanId,
        kpiId: kpi.id,
      },
    });

    revalidatePath(`/loans/${kpi.loanId}`);
    revalidatePath("/analytics");
    revalidateTag(`loan-${kpi.loanId}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error("Error editing KPI:", error);
    return { error: "Failed to edit KPI" };
  }
}

export async function updateKPIStatus(kpiId: string, data: UpdateKPIStatus) {
  try {
    const { user, error } = await validateUser("LENDER");
    if (error || !user) return { error: error || "Unauthorized" };

    const kpi = await prisma.kPI.findUnique({
      where: { id: kpiId },
      include: { loan: true },
    });

    if (!kpi) {
      return { error: "KPI not found" };
    }

    if (kpi.loan.lenderOrgId !== user.organizationId) {
      return { error: "You don't have permission to update this KPI" };
    }

    if (kpi.status !== "PROPOSED") {
      return { error: "KPI has already been reviewed" };
    }

    const validated = await UpdateKPIStatusSchema.parseAsync(data);

    const updatedKPI = await prisma.kPI.update({
      where: { id: kpiId },
      data: { status: validated.status },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action:
          validated.status === "ACCEPTED" ? "KPI_ACCEPTED" : "KPI_REJECTED",
        entity: "KPI",
        entityId: kpi.id,
        details: JSON.stringify({
          kpiName: kpi.name,
          newStatus: validated.status,
        }),
        userId: user.id,
        loanId: kpi.loanId,
        kpiId: kpi.id,
      },
    });

    revalidatePath(`/loans/${kpi.loanId}`);
    revalidatePath("/analytics");
    revalidateTag(`loan-${kpi.loanId}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`analytics-${user.id}`);
    revalidateTag(`audit-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating KPI status:", error);
    return { error: "Failed to update KPI status" };
  }
}

export async function inviteLender(loanId: string, lenderEmail: string) {
  try {
    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    const loan = await prisma.loan.findUnique({
      where: { id: loanId, borrowerOrgId: user.organizationId ?? undefined },
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    // Find lender user
    const lenderUser = await prisma.user.findUnique({
      where: { email: lenderEmail },
      include: { organization: true },
    });

    if (!lenderUser || lenderUser.role !== "LENDER") {
      return { error: "Lender not found" };
    }

    // Update loan with lender
    await prisma.loan.update({
      where: { id: loanId },
      data: { lenderOrgId: lenderUser.organizationId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LENDER_INVITED",
        entity: "LOAN",
        entityId: loan.id,
        details: JSON.stringify({
          lenderEmail,
          lenderOrgName: lenderUser.organization?.name,
        }),
        userId: user.id,
        loanId: loan.id,
      },
    });

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/dashboard");
    revalidatePath("/loans");

    return { success: true };
  } catch (error) {
    console.error("Error inviting lender:", error);
    return { error: "Failed to invite lender" };
  }
}

// Margin Ratchet CRUD operations
export async function createMarginRatchet(
  loanId: string,
  data: CreateMarginRatchetForm,
) {
  try {
    const validated = await CreateMarginRatchetFormSchema.parseAsync(data);

    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    // Verify loan belongs to borrower's organization
    const loan = await prisma.loan.findUnique({
      where: { id: loanId, borrowerOrgId: user.organizationId ?? undefined },
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    // Verify KPI belongs to this loan
    const kpi = await prisma.kPI.findUnique({
      where: { id: validated.kpiId },
    });

    if (!kpi || kpi.loanId !== loanId) {
      return { error: "KPI not found for this loan" };
    }

    const marginRatchet = await prisma.marginRatchet.create({
      data: {
        ...validated,
        loanId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "MARGIN_RATCHET_CREATED",
        entity: "MARGIN_RATCHET",
        entityId: marginRatchet.id,
        details: JSON.stringify({
          kpiId: kpi.id,
          kpiName: kpi.name,
          stepUpBps: marginRatchet.stepUpBps,
          stepDownBps: marginRatchet.stepDownBps,
        }),
        userId: user.id,
        loanId,
        kpiId: kpi.id,
      },
    });

    revalidatePath(`/loans/${loanId}`);

    return { success: true, marginRatchetId: marginRatchet.id };
  } catch (error) {
    console.error("Error creating margin ratchet:", error);
    return { error: "Failed to create margin ratchet" };
  }
}

export async function editMarginRatchet(
  marginRatchetId: string | null | undefined,
  data: CreateMarginRatchetForm,
) {
  try {
    if (!marginRatchetId) {
      return { error: "Margin ratchet not found" };
    }

    const validated = await CreateMarginRatchetFormSchema.parseAsync(data);

    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    // Verify margin ratchet exists and belongs to borrower's organization
    // And also belongs to the same loan
    const existingRatchet = await prisma.marginRatchet.findUnique({
      where: {
        id: marginRatchetId,
        kpiId: validated.kpiId,
        loan: { borrowerOrgId: user.organizationId ?? undefined },
      },
      include: { kpi: { select: { id: true, name: true } } },
    });

    if (!existingRatchet) {
      return { error: "Margin ratchet not found" };
    }

    const marginRatchet = await prisma.marginRatchet.update({
      where: { id: marginRatchetId },
      data: {
        ...validated,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "MARGIN_RATCHET_UPDATED",
        entity: "MARGIN_RATCHET",
        entityId: marginRatchet.id,
        details: JSON.stringify({
          kpiId: existingRatchet.kpi.id,
          kpiName: existingRatchet.kpi.name,
          stepUpBps: marginRatchet.stepUpBps,
          stepDownBps: marginRatchet.stepDownBps,
        }),
        userId: user.id,
        loanId: existingRatchet.loanId,
        kpiId: existingRatchet.kpi.id,
      },
    });

    revalidatePath(`/loans/${existingRatchet.loanId}`);

    return { success: true, marginRatchetId: marginRatchet.id };
  } catch (error) {
    console.error("Error editing margin ratchet:", error);
    return { error: "Failed to edit margin ratchet" };
  }
}

export async function deleteMarginRatchet(marginRatchetId: string) {
  try {
    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    const marginRatchet = await prisma.marginRatchet.findUnique({
      where: {
        id: marginRatchetId,
        loan: { borrowerOrgId: user.organizationId ?? undefined },
      },
      include: { loan: true, kpi: true },
    });

    if (!marginRatchet) {
      return { error: "Margin ratchet not found" };
    }

    await prisma.marginRatchet.delete({
      where: { id: marginRatchetId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "MARGIN_RATCHET_DELETED",
        entity: "MARGIN_RATCHET",
        entityId: marginRatchetId,
        details: JSON.stringify({
          kpiName: marginRatchet.kpi.name,
        }),
        userId: user.id,
        loanId: marginRatchet.loanId,
        kpiId: marginRatchet.kpiId,
      },
    });

    revalidatePath(`/loans/${marginRatchet.loanId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting margin ratchet:", error);
    return { error: "Failed to delete margin ratchet" };
  }
}

export async function deleteKPI(kpiId: string) {
  try {
    const { user, error } = await validateUser("BORROWER");
    if (error || !user) return { error: error || "Unauthorized" };

    const kpi = await prisma.kPI.findUnique({
      where: {
        id: kpiId,
        loan: {
          borrowerOrgId: user.organizationId ?? undefined,
        },
      },
      include: { loan: true },
    });

    if (!kpi) {
      return { error: "KPI not found" };
    }

    // Delete the KPI (cascade will handle marginRatchets and results)
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
        loanId: kpi.loanId,
      },
    });

    revalidatePath(`/loans/${kpi.loanId}`);
    revalidatePath("/analytics");

    return { success: true };
  } catch (error) {
    console.error("Error deleting KPI:", error);
    return { error: "Failed to delete KPI" };
  }
}
