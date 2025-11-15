import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbOperations } from '@resume-builder/lib/db';
import {
  hashPassword,
  verifyPassword,
  generateUserId,
  emailExists,
  validateAuthForm,
} from '@resume-builder/lib/auth';

// Build providers array
const providers = [];

// Add Google provider if credentials are configured
// Note: NextAuth will throw an error if credentials are missing, so we check here
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  );
} else if (process.env.NODE_ENV === 'development') {
  console.warn(
    'Google OAuth credentials not found. Google sign-in will not be available.',
  );
}

// Always add Credentials provider
providers.push(
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
      name: { label: 'Name', type: 'text' },
      mode: { label: 'Mode', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required');
      }

      const mode = credentials.mode || 'signin';
      const email = credentials.email.trim();
      const password = credentials.password;
      const name = credentials.name?.trim();

      // Validate form data
      const validation = validateAuthForm(
        email,
        password,
        mode as 'signin' | 'signup',
        name,
      );
      if (!validation.valid) {
        throw new Error(validation.errors[0].message);
      }

      if (mode === 'signup') {
        // Check if user already exists
        if (emailExists(email)) {
          throw new Error('An account with this email already exists');
        }

        // Create new user
        const hashedPassword = await hashPassword(password);
        const userId = generateUserId();

        const user = dbOperations.createUser({
          id: userId,
          email,
          password: hashedPassword,
          name: name || null,
        });

        console.log('[NextAuth Credentials] User created:', {
          userId: user.id,
          email: user.email,
          name: user.name,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        };
      } else {
        // Sign in existing user
        const user = dbOperations.findUserByEmail(email);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user.password) {
          throw new Error(
            'This account was created with Google. Please sign in with Google.',
          );
        }

        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        console.log('[NextAuth Credentials] User signed in:', {
          userId: user.id,
          email: user.email,
          name: user.name,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        };
      }
    },
  }),
);

const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/auth',
    error: '/auth',
    signOut: '/auth',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Handle Google OAuth sign in
        if (account?.provider === 'google') {
          // Google profile has different structure
          const googleProfile = profile as any;
          const email = googleProfile?.email || user.email;
          if (!email) {
            console.error('No email provided by Google');
            return false;
          }

          // Check if user exists
          let dbUser = dbOperations.findUserByEmail(email);

          if (!dbUser) {
            // Create new user without password
            const userId = generateUserId();
            console.log('[NextAuth Google] Creating new user:', {
              userId,
              email,
              name: googleProfile?.name || user.name,
            });
            dbUser = dbOperations.createUser({
              id: userId,
              email,
              password: null, // Google users don't have passwords
              name: googleProfile?.name || user.name || null,
              image: googleProfile?.picture || user.image || null,
            });
            console.log('[NextAuth Google] User created:', {
              userId: dbUser.id,
              email: dbUser.email,
            });
          } else {
            console.log('[NextAuth Google] Existing user found:', {
              userId: dbUser.id,
              email: dbUser.email,
            });
            // Update existing user info if needed
            dbOperations.updateUser(dbUser.id, {
              name:
                googleProfile?.name || user.name || dbUser.name || undefined,
              image:
                googleProfile?.picture ||
                user.image ||
                dbUser.image ||
                undefined,
            });
          }

          // Update user object with database ID
          user.id = dbUser.id;
          console.log('[NextAuth Google] User ID set in token:', {
            userId: user.id,
            email: user.email,
          });
        }
      } catch (error) {
        console.error('Error during Google sign in:', error);
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // When user logs in for the first time
      if (user) {
        console.log('[NextAuth JWT] Setting token for user:', {
          userId: user.id,
          email: user.email,
          name: user.name,
          provider: account?.provider || 'credentials',
        });
        token.id = user.id;
        token.email = user.email || undefined;
        token.name = user.name || undefined;
        token.picture = user.image || undefined;
        token.provider = account?.provider || 'credentials';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const dbUser = dbOperations.findUserById(token.id as string);

        // If user doesn't exist in database, invalidate the session
        // This handles cases where the database was reset (e.g., on Vercel)
        if (!dbUser) {
          console.log(
            '[NextAuth Session] User not found in database, invalidating session:',
            {
              userId: token.id,
              email: token.email,
            },
          );
          // Return null to invalidate the session
          // Type assertion needed because NextAuth types don't officially support null
          return null as any;
        }

        // User exists, populate session with database data
        session.user.id = dbUser.id;
        session.user.email = dbUser.email;
        session.user.name = dbUser.name || undefined;
        session.user.image = dbUser.image || undefined;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
