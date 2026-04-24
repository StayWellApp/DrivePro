import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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
          include: {
            student: true,
            school: {
              include: {
                country: true,
              },
            },
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        // In the student app, we might allow other roles if they are testing/accessing student view
        // but primarily it's for STUDENTS.
        // For unified login feel, we can allow any and handle redirect in UI.

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          studentId: user.student?.id,
          schoolId: user.school_id,
          countryCode: user.school?.country?.isoCode || "CZ",
          currency: user.school?.country?.currency || "CZK",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.studentId = (user as any).studentId;
        token.schoolId = (user as any).schoolId;
        token.countryCode = (user as any).countryCode;
        token.currency = (user as any).currency;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).studentId = token.studentId;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).countryCode = token.countryCode;
        (session.user as any).currency = token.currency;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
