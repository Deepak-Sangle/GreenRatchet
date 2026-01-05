"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ConnectAWSSchema,
  ConnectGCPSchema,
  type ConnectAWSInput,
  type ConnectGCPInput,
} from "@/lib/validations/cloud";
import { revalidatePath, revalidateTag } from "next/cache";

export async function connectAWS(data: ConnectAWSInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can connect cloud providers" };
    }

    const validated = await ConnectAWSSchema.parseAsync(data);

    // TODO: Validate AWS role ARN by attempting AssumeRole
    // For hackathon: accept any valid ARN format

    const connection = await prisma.cloudConnection.create({
      data: {
        provider: "AWS",
        roleArn: validated.roleArn,
        externalId: validated.externalId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_CREATED",
        entity: "CLOUD_CONNECTION",
        entityId: connection.id,
        details: JSON.stringify({ provider: "AWS" }),
        userId: user.id,
        cloudConnectionId: connection.id,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error connecting AWS:", error);
    return { error: "Failed to connect AWS account" };
  }
}

export async function connectGCP(data: ConnectGCPInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "BORROWER" || !user.organizationId) {
      return { error: "Only borrowers can connect cloud providers" };
    }

    const validated = await ConnectGCPSchema.parseAsync(data);

    // TODO: Validate GCP service account key by making a test API call
    // For hackathon: accept any JSON

    const connection = await prisma.cloudConnection.create({
      data: {
        provider: "GCP",
        projectId: validated.projectId,
        serviceAccountKey: validated.serviceAccountKey,
        organizationId: user.organizationId,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_CREATED",
        entity: "CLOUD_CONNECTION",
        entityId: connection.id,
        details: JSON.stringify({
          provider: "GCP",
          projectId: validated.projectId,
        }),
        userId: user.id,
        cloudConnectionId: connection.id,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error connecting GCP:", error);
    return { error: "Failed to connect GCP project" };
  }
}

export async function disconnectCloud(connectionId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { error: "Unauthorized" };
    }

    const connection = await prisma.cloudConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.organizationId !== user.organizationId) {
      return { error: "Connection not found" };
    }

    await prisma.cloudConnection.update({
      where: { id: connectionId },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CLOUD_CONNECTION_DISCONNECTED",
        entity: "CLOUD_CONNECTION",
        entityId: connectionId,
        details: JSON.stringify({ provider: connection.provider }),
        userId: user.id,
        cloudConnectionId: connectionId,
      },
    });

    revalidatePath("/cloud");
    revalidatePath("/dashboard");
    revalidateTag(`cloud-${user.id}`);
    revalidateTag(`org-${user.organizationId}`);
    revalidateTag(`dashboard-${user.id}`);

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting cloud:", error);
    return { error: "Failed to disconnect cloud provider" };
  }
}
