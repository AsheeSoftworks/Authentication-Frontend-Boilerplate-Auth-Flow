import VerifyEmail from "@/components/VerifyEmail";

/**
 * Email Verification Page
 * 
 * This page handles the email verification workflow by:
 * 1. Extracting the verification token from URL parameters
 * 2. Passing the token to the VerifyEmail component
 * 
 * This is a server-side rendered page that acts as a wrapper
 * for the client-side verification logic.
 * 
 * @param params - Object containing route parameters
 * @param params.token - Verification token extracted from the URL
 * 
 * Note: The token is passed to the client component to complete
 * the verification process on the client side.
 */
export default async function page({
  params,
}: {
  params: { token: string };
}) {
  // Destructure token from route parameters
  const { token } = await params;
  
  // Render verification component with token
  return <VerifyEmail token={token} />;
}