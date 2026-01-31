"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteAvatar, uploadAvatar } from "@/lib/services/storage";
import { revalidatePath } from "next/cache";

export async function updateAvatarAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        error: "Unauthorized",
      };
    }

    const file = formData.get("avatar") as File;

    if (!file) {
      return {
        error: "No file provided",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        error: "File must be an image",
      };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return {
        error: "File size must be less than 2MB",
      };
    }

    // Get current user to get organization info and existing avatar
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatarUrl: true, organizationId: true },
    });

    // Upload new avatar
    const avatarUrl = await uploadAvatar(session.user.id, file);

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    // Delete old avatar if it exists
    if (user?.avatarUrl) {
      try {
        await deleteAvatar(user.avatarUrl);
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
        // Continue anyway - new avatar is already uploaded
      }
    }

    // Revalidate the shared dashboard layout (covers all authenticated pages)
    revalidatePath("/", "layout");

    return {
      success: true,
      avatarUrl,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}
