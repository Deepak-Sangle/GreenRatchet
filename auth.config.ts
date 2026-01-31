import { type NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
  providers: [], // Providers added in auth.ts (server-side only)
} satisfies NextAuthConfig;
