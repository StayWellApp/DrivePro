import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          schoolId: user.school_id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
      }

      // Handle impersonation update
      if (trigger === "update" && session?.impersonatedSchoolId) {
        token.impersonatedSchoolId = session.impersonatedSchoolId;
        token.impersonatedRole = "ADMIN"; // When impersonating, act as ADMIN
      } else if (trigger === "update" && session?.stopImpersonating) {
        token.impersonatedSchoolId = null;
        token.impersonatedRole = null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).impersonatedSchoolId = token.impersonatedSchoolId;
        (session.user as any).impersonatedRole = token.impersonatedRole;

        // Use effective school ID and role for the UI
        (session.user as any).activeSchoolId = token.impersonatedSchoolId || token.schoolId;
        (session.user as any).activeRole = token.impersonatedRole || token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
