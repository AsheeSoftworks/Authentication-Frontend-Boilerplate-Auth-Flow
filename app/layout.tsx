import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Initialize Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] });

/**
 * Application Metadata
 * 
 * Defines metadata that will be used for:
 * - Search engine optimization (SEO)
 * - Social media sharing cards
 * - Browser tab titles
 * 
 * These values are automatically injected into the <head> of all pages
 */
export const metadata: Metadata = {
  title: 'AuthFlow - Modern Authentication Boilerplate',
  description: 'A beautiful, production-ready authentication boilerplate built with Next.js',
};

/**
 * Root Layout Component
 * 
 * Serves as the top-level layout wrapper for the entire application:
 * 1. Applies global CSS styles
 * 2. Sets up Google OAuth authentication context
 * 3. Provides consistent layout structure
 * 4. Applies font family to all pages
 * 
 * Features:
 * - Environment-aware Google Client ID handling
 * - Responsive gradient background
 * - Font optimization with Next.js font system
 * 
 * @param children - Child components to render within the layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Retrieve Google Client ID from environment variables
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Handle missing Client ID in development/production
  if (!clientId) {
    console.warn('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    // Fallback without Google OAuth provider
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {children}
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global gradient background */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Google OAuth Context Provider */}
          <GoogleOAuthProvider clientId={clientId}>
            {children}
          </GoogleOAuthProvider>
        </div>
      </body>
    </html>
  );
}