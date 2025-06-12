import ResetPassword from "@/components/ResetPassword";

/**
 * Password Reset Page
 * 
 * This page handles the password reset workflow by:
 * 1. Extracting the reset token from URL parameters
 * 2. Passing the token to the ResetPassword component
 * 
 * This server-side rendered page serves as a container
 * for the client-side password reset logic.
 * 
 * @param params - Object containing route parameters
 * @param params.token - Password reset token extracted from the URL
 * 
 * Security Note: The token is passed to the client component to
 * complete the reset process, but actual password change
 * operations are handled through authenticated API calls.
 */
export default async function page({
  params,
}: {
  params: { token: string };
}) {
  // Destructure token from route parameters
  const { token } = await params;
  
  // Render password reset component with token
  return <ResetPassword token={token} />;
}