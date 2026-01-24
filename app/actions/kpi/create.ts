"use server";

import { prisma } from "@/lib/prisma";
import { withServerAction } from "@/lib/server-action-utils";
import { CreateKPIForm, CreateKPIFormSchema } from "@/lib/validations/kpi";
import { revalidatePath } from "next/cache";

export async function createKpiAction(data: CreateKPIForm) {
  return withServerAction(async (user) => {
    const validated = CreateKPIFormSchema.parse(data);

    const kpi = await prisma.kPI.create({
      data: {
        ...validated,
        effectiveFrom: new Date(validated.effectiveFrom),
        effectiveTo: validated.effectiveTo
          ? new Date(validated.effectiveTo)
          : undefined,
        organizationId: user.organizationId,
      },
    });

    revalidatePath("/kpis");
    revalidatePath("/dashboard");
    return kpi;
  }, "create KPI");
}
