
import NextAuth, { type NextAuthOptions, type Session, type User, SessionStrategy } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
// import clientPromise from "@/lib/mongodb-users-client";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
  // Temporarily disable MongoDB adapter due to Atlas DNS issues
  // adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Explicitly define the callback URL
      // This ensures consistency between local and production environments
      // Note: NextAuth doesn't allow explicit callbackUrl in provider config
      // Make sure this matches the URL configured in Google Developer Console
      // Properly handle profile parsing to avoid errors
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Role will be assigned in JWT callback
        };
      }
    }),
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
          
          // Allow all valid roles including pending (for profile completion)
          if (!['admin', 'sponsor', 'manager', 'visitor', 'waiting_list', 'pending'].includes(user.role)) {
            console.log('AUTH DEBUG: Role not allowed:', user.role);
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || null, // Include user's image if available
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Cookie configuration to ensure consistency between OAuth and regular login
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token` 
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug mode in development
  callbacks: {
    async jwt({ token, user, account, trigger }: { token: JWT; user?: User; account?: any; trigger?: string }) {
      console.log(`JWT callback: trigger=${trigger}, user=${user ? 'exists' : 'null'}, token.role=${token.role || 'undefined'}, email=${token.email || 'unknown'}`);
      
      // For OAuth logins, ensure we properly process the account information
      if (account?.provider === 'google') {
        console.log(`JWT: Processing Google OAuth login for ${token.email}. Current token role: ${token.role || 'undefined'}`);
      }
      
      // Always fetch the latest role from database for every token refresh
      // This ensures role changes take effect immediately
      if (token && token.email) {
        try {
          // Connect to database to get the current role
          const { getCloudConnection } = await import("@/lib/mongodb-cloud");
          const conn = await getCloudConnection();
          
          // Fetch user from database
          const dbUser = await conn.db.collection('users').findOne({ email: token.email.toLowerCase() });
          
          // If found, update the role in the token
          if (dbUser?.role) {
            // Only log if role is changing
            if (token.role !== dbUser.role) {
              console.log(`JWT: Updating role from ${token.role || 'undefined'} to ${dbUser.role}`);
              // Ensure the role is updated in the token and properly typed
              token.role = dbUser.role;
            } else {
              // Ensure role is consistently set even if it's not changing
              token.role = dbUser.role;
              console.log(`JWT: Confirmed role as ${dbUser.role}`);
            }
          }
          
          // Log the full user record for debugging
          console.log(`JWT: Database user record: ${JSON.stringify({
            _id: dbUser?._id ? dbUser._id.toString() : null,
            email: dbUser?.email,
            role: dbUser?.role,
            googleAuthenticated: dbUser?.googleAuthenticated || false
          })}`);
        } catch (error) {
          console.error('Error fetching latest role in JWT callback:', error);
        }
      }
      
      // For sign-in (both credentials and OAuth)
      if (trigger === 'signIn' || trigger === 'signUp') {
        // Preserve user image from credentials or OAuth if available
        if (user && user.image) {
          token.picture = user.image;
          console.log(`JWT: Preserved user profile image from ${account?.provider || 'credentials'} provider`);
        }
        
        // If user object exists and has a role, use that role (credentials provider)
        if (user && 'role' in user) {
          console.log(`JWT: User from credentials with role ${(user as User & { role?: string }).role}`);
          token.role = (user as User & { role?: string }).role;
        }
        
        // For all sign-ins (especially OAuth), always fetch the latest role from database
        if (user?.email) {
          try {
            // Connect to database
            const { getCloudConnection } = await import("@/lib/mongodb-cloud");
            const conn = await getCloudConnection();
            
            // Fetch user from database to get role
            const dbUser = await conn.db.collection('users').findOne({ email: user.email.toLowerCase() });
            
            if (dbUser?.role) {
              token.role = dbUser.role;
              console.log(`JWT: Set role from database to ${dbUser.role}`);
            } else if (!token.role) {
              // Only set default if no role is found at all
              token.role = 'waiting_list';
              console.log('JWT: Set default waiting_list role');
            }
          } catch (error) {
            console.error('Error fetching user role for JWT token:', error);
            // Only set fallback if no role exists yet
            if (!token.role) {
              token.role = 'waiting_list';
              console.log('JWT: Set fallback waiting_list role due to error');
            }
          }
        }
      }
      
      // Ensure role is always defined
      if (!token.role) {
        token.role = 'waiting_list';
        console.log('JWT: Set waiting_list role as final fallback');
      }
      
      console.log(`JWT returning token with role: ${token.role}`);
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Always copy the role from token to session
      if (token && session.user) {
        console.log(`Session: Setting user role to ${token.role || 'undefined'}`);
        
        // For existing sessions, check if we need to update the role from database
        // This ensures users who complete their profile get role updates without needing to sign in again
        if (session.user.email) {
          console.log(`Session: Checking latest role in database for ${session.user.email}`);
          try {
            // Connect to database to get the latest role
            const { getCloudConnection } = await import("@/lib/mongodb-cloud");
            const conn = await getCloudConnection();
            
            // Find user in database to get their current role
            const dbUser = await conn.db.collection('users').findOne({ 
              email: session.user.email.toLowerCase() 
            });
            
            // Also check if they have a record in the responses collection which confirms profile completion
            const hasCompletedProfile = await conn.db.collection('responses').findOne({
              userEmail: session.user.email.toLowerCase()
            });
            
            // Log the database user record for debugging
            console.log(`Session: Database user record for ${session.user.email}: ${JSON.stringify({
              _id: dbUser?._id ? dbUser._id.toString() : null,
              email: dbUser?.email,
              role: dbUser?.role,
              googleAuthenticated: dbUser?.googleAuthenticated || false
            })}`);
            
            // If found and role differs from token, update the token's role
            if (dbUser && dbUser.role) {
              // If token role is pending but DB role is different, we need to update
              if (token.role === 'pending' && dbUser.role !== 'pending') {
                console.log(`Session: Updating role from database - from ${token.role || 'undefined'} to ${dbUser.role}`);
                token.role = dbUser.role;
              } 
              // If DB role is pending but token isn't, enforce pending role
              else if (dbUser.role === 'pending' && token.role !== 'pending') {
                console.log(`Session: Enforcing pending role from database`);
                token.role = 'pending';
              }
              // If roles simply don't match, use the DB role as source of truth
              else if (dbUser.role !== token.role) {
                console.log(`Session: Syncing role from database - from ${token.role || 'undefined'} to ${dbUser.role}`);
                token.role = dbUser.role;
              } else {
                console.log(`Session: Role in database matches token: ${dbUser.role}`);
              }
              
              // Always ensure the role is set from the database for OAuth users
              if (dbUser.googleAuthenticated) {
                console.log(`Session: Ensuring OAuth user ${session.user.email} has correct role: ${dbUser.role}`);
                token.role = dbUser.role;
              }
            }
            
            // Special handling for users who should be waiting_list
            // If they have completed the profile (have a responses record) but still have pending role,
            // fix their role in the database and update the token
            if (hasCompletedProfile && dbUser && dbUser.role === 'pending') {
              console.log(`Session: User ${session.user.email} has completed profile but still has pending role. Fixing to waiting_list`);
              
              // Update the user record to have waiting_list role
              await conn.db.collection('users').updateOne(
                { email: session.user.email.toLowerCase() },
                { $set: { role: 'waiting_list', roleFixedAt: new Date(), updatedAt: new Date() } }
              );
              
              // Update token with correct role
              token.role = 'waiting_list';
              console.log(`Session: Fixed role for ${session.user.email} to waiting_list`);
            }
          } catch (error) {
            console.error('Error fetching latest role for session:', error);
            // Continue with existing token role if there's an error
          }
        }
        
        // Force cast to add role property
        (session.user as User & { role: string }).role = token.role as string;
        
        // Ensure profile image is preserved from token to session
        if (token.picture && typeof token.picture === 'string') {
          session.user.image = token.picture;
        }
        
        // Print session for debugging
        console.log('Session data:', {
          name: session.user.name,
          email: session.user.email,
          role: (session.user as User & { role?: string }).role,
          hasImage: !!session.user.image
        });
      }
      return session;
    },
    async redirect({ url, baseUrl, token }: { url: string; baseUrl: string; token?: JWT }) {
      console.log(`Redirect callback called with URL: ${url}, role: ${token?.role || 'unknown'}`);
      
      // For OAuth callback URLs, ALWAYS use the dedicated redirect page
      // This allows the session to fully initialize before determining the redirect
      if (url.includes('/api/auth/callback/google')) {
        console.log('Redirect: Processing Google OAuth callback - using dedicated redirect page');
        return `${baseUrl}/auth/oauth-redirect?from=google`;
      }
      
      // If token has no role yet (still being processed), use oauth-redirect page
      // This prevents premature redirects before JWT callback completes
      if (!token?.role || token.role === 'unknown') {
        console.log('Redirect: Token role not yet set, deferring to oauth-redirect page');
        return `${baseUrl}/auth/oauth-redirect?from=google`;
      }
      
      // Now we have a valid token with a role, handle redirects
      console.log(`Redirect: Processing role-based redirect for ${token.role}`);
      
      // If the user is trying to access complete-profile page specifically, allow it
      if (url.includes('/auth/complete-profile')) {
        return `${baseUrl}/auth/complete-profile`;
      }
      
      // For pending users, ALWAYS redirect to complete-profile page to finish registration
      if (token.role === 'pending') {
        console.log('Redirect: User has pending role, FORCING redirect to complete profile');
        return `${baseUrl}/auth/complete-profile?forced=true&from=signin&token=${encodeURIComponent(JSON.stringify({ role: 'pending', email: token.email }))}`;
      }
      
      // For waiting_list users, redirect to comingsoon
      if (token.role === 'waiting_list') {
        console.log('Redirect: User has waiting_list role, redirecting to comingsoon');
        return `${baseUrl}/comingsoon`;
      }
      
      // For authenticated users with specific roles, redirect to their proper dashboard
      switch(token.role) {
        case 'admin':
          console.log('Redirect: Admin user, redirecting to admin dashboard');
          return `${baseUrl}/adminDashboard`;
        case 'manager':
          console.log('Redirect: Manager user, redirecting to manager dashboard');
          return `${baseUrl}/managerDashboard`;
        case 'sponsor':
          console.log('Redirect: Sponsor user, redirecting to sponsor dashboard');
          return `${baseUrl}/sponsorDashboard`;
        case 'visitor':
          console.log('Redirect: Visitor user, redirecting to visitor dashboard');
          return `${baseUrl}/visitorDashboard`;
        default:
          console.log(`Redirect: Unknown role ${token.role}, using default dashboard`);
          return `${baseUrl}/dashboard`;
      }
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Only handle OAuth accounts (Google, etc.)
      if (account?.provider === 'google') {
        try {
          // Safety check
          if (!user?.email) {
            console.error('SignIn: Google OAuth failed - no email provided');
            return false;
          }
          
          console.log(`SignIn: Processing OAuth sign-in for ${user.email}`);
          
          // Connect to database
          const { getCloudConnection } = await import("@/lib/mongodb-cloud");
          const conn = await getCloudConnection();
          
          // Check if user exists
          const existingUser = await conn.db.collection('users').findOne({ 
            email: user.email.toLowerCase()
          });
          
          // Always fetch fresh data for session to get the latest role
          
          if (!existingUser) {
            console.log(`SignIn: New user ${user.email} - creating temporary account with pending role`);
            
            // Create a new user with this email, with pending role to force multistep registration
            await conn.db.collection('users').insertOne({
              name: user.name,
              email: user.email?.toLowerCase(),
              image: user.image,
              role: 'pending', // Temporary role until registration is completed
              registrationCompleted: false, // Mark as incomplete to require questionnaire
              googleAuthenticated: true, // Mark as authenticated with Google
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            // Set temporary role in user object
            // @ts-expect-error - adding role to user object
            user.role = 'pending';
            
            console.log('SignIn: New Google user created with pending role, will redirect to complete-profile');
            
            // Create a token payload to help middleware understand this is a pending user from OAuth
            const tokenData = { 
              role: 'pending', 
              provider: 'google', 
              name: user.name, 
              email: user.email, 
              timestamp: Date.now() 
            };
            
            // Redirect to complete profile page - force to multistep registration with token
            return `/auth/complete-profile?forced=true&from=oauth_signup&token=${encodeURIComponent(JSON.stringify(tokenData))}`;
            
          } else if (!existingUser.registrationCompleted || existingUser.role === 'pending') {
            console.log(`SignIn: Existing user ${user.email} needs to complete profile`);
            
            // Add role to user object (will be used in JWT token)
            // @ts-expect-error - adding role to user object
            user.role = 'pending'; // Always set to pending if registration not completed
            
            // Update the user's profile image if available, but don't mark registration as completed
            await conn.db.collection('users').updateOne(
              { email: user.email?.toLowerCase() },
              { $set: { 
                role: 'pending', // Ensure the role is set to pending
                image: user.image, // Update profile image from Google
                needsProfileCompletion: true, // Add a clear flag for profile completion
                updatedAt: new Date() 
              }}
            );
            
            console.log(`SignIn: Updated ${user.email} to force pending role and directly routing to profile completion`);
            
            // Create a token payload to help middleware understand this is a pending user from OAuth
            const tokenData = { 
              role: 'pending', 
              provider: 'google', 
              name: user.name, 
              email: user.email, 
              timestamp: Date.now() 
            };
            
            // Force direct redirect with token parameter to help middleware identify this as an OAuth flow
            return `/auth/complete-profile?forced=true&from=oauth&token=${encodeURIComponent(JSON.stringify(tokenData))}`;
          }
          
          console.log(`SignIn: User ${user.email} has role ${existingUser.role || 'unknown'}`);
          
          // Update user's profile image on each sign-in if it has changed
          if (user.image && user.image !== existingUser.image) {
            await conn.db.collection('users').updateOne(
              { email: user.email?.toLowerCase() },
              { $set: { 
                image: user.image, 
                updatedAt: new Date() 
              }}
            );
            console.log(`SignIn: Updated ${user.email}'s profile image`);
          }
          
          // Add role to user object (will be used in JWT token)
          // @ts-expect-error - adding role to user object
          user.role = existingUser.role || 'waiting_list';
          
          // For waiting_list users who have completed registration, ensure they go to comingsoon
          if (existingUser.role === 'waiting_list') {
            console.log('SignIn: User has waiting_list role, will be redirected to comingsoon by redirect callback');
            // The redirect callback will handle sending them to comingsoon
          }
          
          // Let the NextAuth flow continue
          return true;
        } catch (error) {
          console.error("Error in OAuth sign in:", error);
          
          // Handle MongoDB connection issues more gracefully
          if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ESERVFAIL') {
            console.log("MongoDB connection error during sign-in - attempting to create a temporary session");
            
            // Create a temporary session with pending role that will work until next page refresh
            // This allows the user to proceed without DB connection temporarily
            // @ts-expect-error - adding role to user object
            user.role = 'pending';
            
            // Return true to allow sign-in with temporary session
            // The redirect callback will handle sending to complete-profile
            return true;
          }
          
          return '/auth/error?error=DatabaseError';
        }
      }
      
      // For non-OAuth providers, always allow sign in
      return true;
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
