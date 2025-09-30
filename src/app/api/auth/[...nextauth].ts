
import NextAuth, { type NextAuthOptions, type Session, type User, SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-users-client";
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
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          // Use direct database connection to match registration approach
          const { getCloudConnection } = await import("@/lib/mongodb-cloud");
          const conn = await getCloudConnection();
          
          // Find user directly in database
          const user = await conn.db.collection('users').findOne({ 
            email: credentials.email.toLowerCase() 
          });
          
          console.log('AUTH DEBUG: user found:', user ? { 
            email: user.email, 
            role: user.role, 
            hasPassword: !!user.password 
          } : null);
          
          if (!user) {
            console.log('AUTH DEBUG: No user found for email', credentials.email);
            return null;
          }
          
          // Check password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('AUTH DEBUG: password valid?', isValid);
          
          if (!isValid) {
            console.log('AUTH DEBUG: Invalid password for', credentials.email);
            return null;
          }
          
          // Only allow admin, sponsor, manager, visitor, or waiting_list
          if (!['admin', 'sponsor', 'manager', 'visitor', 'waiting_list'].includes(user.role)) {
            console.log('AUTH DEBUG: Role not allowed:', user.role);
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('AUTH ERROR:', error);
          return null;
        }
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
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // If the URL is already absolute and on the same domain, allow it
      if (new URL(url).origin === baseUrl) return url;
      
      // Default to dashboard for authenticated users
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
