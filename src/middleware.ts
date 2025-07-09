import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true
        }
        
        // Require token for all other pages
        if (!token) {
          return false
        }
        
        // Check if user is approved
        if (token.status !== 'APPROVED') {
          return false
        }
        
        // Admin-only routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token.isAdmin === true
        }
        
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/((?!api/auth|auth/signin|auth/register|_next/static|_next/image|favicon.ico).*)']
}
