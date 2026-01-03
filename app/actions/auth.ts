"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function signUpAction(data: SignUpInput) {
  try {
    const validated = await signUpSchema.parseAsync(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: validated.organizationName,
        type: validated.role,
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        organizationId: organization.id,
      },
    });

    // Sign in the user
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    return { error: "An error occurred during sign up" };
  }
}

export async function signInAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      // Get the actual error message from cause if available
      const cause = error.cause;
      const message = cause?.err?.message;

      switch (error.type) {
        case "CredentialsSignin":
          return { error: message || "Invalid credentials" };
        case "CallbackRouteError":
          return { error: message || "Authentication failed" };
        default:
          return { error: message || "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/signin" });
}
