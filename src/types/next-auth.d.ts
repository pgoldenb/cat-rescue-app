import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      isAdmin: boolean
      status: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    isAdmin: boolean
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin: boolean
    status: string
  }
}
