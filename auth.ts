import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { SignInSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = await SignInSchema.parseAsync(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          throw new Error("Invalid credentials");
        }

        // Update last login timestamp after successful authentication
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
});
