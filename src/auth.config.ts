import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname === '/' ;

      if (isOnAuth) {
        if(isLoggedIn) return Response.redirect(new URL('/feed', nextUrl));
        return true
      } else {
        if (!isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;