"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateKPIFormSchema,
  CreateLoanSchema,
  CreateMarginRatchetFormSchema,
  UpdateKPIStatusSchema,
  type CreateKPIForm,
  type CreateLoanForm,
  type CreateMarginRatchetForm,
  type UpdateKPIStatus,
} from "@/lib/validations/loan";
import { revalidatePath } from "next/cache";

export async function createLoan(data: CreateLoanForm) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can create loans" };
    }

    const validated = await CreateLoanSchema.parseAsync(data);

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
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can create KPIs" };
    }

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

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error("Error creating KPI:", error);
    return { error: "Failed to create KPI" };
  }
}

export async function updateKPIStatus(kpiId: string, data: UpdateKPIStatus) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "LENDER") {
      return { error: "Only lenders can accept/reject KPIs" };
    }

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

    return { success: true };
  } catch (error) {
    console.error("Error updating KPI status:", error);
    return { error: "Failed to update KPI status" };
  }
}

export async function inviteLender(loanId: string, lenderEmail: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can invite lenders" };
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan || loan.borrowerOrgId !== user.organizationId) {
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

    return { success: true };
  } catch (error) {
    console.error("Error inviting lender:", error);
    return { error: "Failed to invite lender" };
  }
}

// Margin Ratchet CRUD operations
export async function createMarginRatchet(
  loanId: string,
  data: CreateMarginRatchetForm
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can create margin ratchets" };
    }

    // Verify loan belongs to borrower's organization
    const loan = await prisma.loan.findUnique({
      where: { id: loanId, borrowerOrgId: user.organizationId ?? undefined },
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    const validated = await CreateMarginRatchetFormSchema.parseAsync(data);

    // Verify KPI belongs to this loan
    const kpi = await prisma.kPI.findUnique({
      where: { id: validated.kpiId },
    });

    if (!kpi || kpi.loanId !== loanId) {
      return { error: "KPI not found for this loan" };
    }

    // Transform form dates to Date objects, spread the rest directly
    const { observationStart, observationEnd, ...restFields } = validated;
    const marginRatchet = await prisma.marginRatchet.create({
      data: {
        ...restFields,
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

export async function deleteMarginRatchet(marginRatchetId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER") {
      return { error: "Only borrowers can delete margin ratchets" };
    }

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
