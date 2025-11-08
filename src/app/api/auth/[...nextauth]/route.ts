import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbOperations } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  generateUserId,
  emailExists,
  validateAuthForm,
} from '@/lib/auth';

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

export const authOptions: NextAuthOptions = {
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
            dbUser = dbOperations.createUser({
              id: userId,
              email,
              password: null, // Google users don't have passwords
              name: googleProfile?.name || user.name || null,
              image: googleProfile?.picture || user.image || null,
            });
          } else {
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
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.email = dbUser.email;
          session.user.name = dbUser.name || undefined;
          session.user.image = dbUser.image || undefined;
        } else {
          // Fallback to token data if user not found in DB
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }
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
