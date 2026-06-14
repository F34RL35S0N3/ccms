import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { mockUsers } from "@/lib/mock-data"

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // 1. Try real database first
        try {
          const user = await db.user.findUnique({
            where: { email }
          });

          if (user && user.password) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (isPasswordMatch) {
              return user;
            }
            // User found in DB but password wrong — don't fall through to mock
            return null;
          }
        } catch (error) {
          // DB offline — fall through to mock login below
          console.warn("Database unreachable, falling back to mock users:", (error as Error).message);
        }

        // 2. Fallback: look up in mockUsers (plain-text password comparison)
        const mockUser = mockUsers.find((u: any) => u.email === email);
        if (mockUser && (mockUser as any).password === password) {
          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          } as any;
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  }
})
