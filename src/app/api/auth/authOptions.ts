import { type NextAuthOptions, type Session, type User, SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Authorize called with:', credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }
        const user = await UserModel.findOne({ email: credentials.email }).select("+password +role");
        console.log('User found:', user);
        if (!user) {
          console.log('No user found for email:', credentials.email);
          return null;
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log('Password valid:', isValid);
        if (!isValid) {
          console.log('Invalid password for user:', credentials.email);
          return null;
        }
        // Only allow admin or visitor
        if (!['admin', 'visitor'].includes(user.role)) {
          console.log('User role not allowed:', user.role);
          return null;
        }
        console.log('User authorized:', user.email, user.role);
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user && 'role' in user) {
        token.role = (user as User & { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user && 'role' in token) {
        (session.user as User & { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
