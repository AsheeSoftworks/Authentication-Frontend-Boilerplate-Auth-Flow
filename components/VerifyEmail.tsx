"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuthStore from "@/store/auth";

/**
 * Verification State Types
 * 
 * Defines possible states during email verification:
 * - loading: Verification in progress
 * - success: Email successfully verified
 * - error: Verification failed
 * - expired: Verification link has expired
 */
type VerificationState = "loading" | "success" | "error" | "expired";

/**
 * VerifyEmail Component
 * 
 * Handles email verification workflow:
 * 1. Processes verification token from URL
 * 2. Manages verification states (loading, success, error, expired)
 * 3. Provides resend functionality for failed/expired cases
 * 
 * Props:
 * @param {string} token - Verification token from URL parameters
 */
export default function VerifyEmail({ token }: { token: string }) {
  // Tracks current verification status
  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");

  // Stores email address for resend functionality
  const [email, setEmail] = useState(""); 
  
  /**
   * Effect: Retrieves user email from localStorage
   * 
   * On component mount:
   * 1. Checks localStorage for auth data
   * 2. Parses and extracts user email
   * 3. Sets email state or defaults to empty string
   */
  useEffect(() => {
      const data = localStorage.getItem("auth-storage");
        
      if(data) {
        try {
          const value: JWTAuthState = JSON.parse(data) 
          if(value.state.user === null){
            setEmail("");
          } else {
            setEmail(value.state.user.email)
          }
        } catch (error) {
          console.error("Error parsing auth data:", error);
          setEmail("");
        }
      } else {
        setEmail("")
      }
    }, [])

  // Authentication store hooks for verification actions
  const { verifyEmail, clearError, error, resendVerificationEmail } = useAuthStore();

  // Update state to error if authentication store has an error
  if (error){
    setVerificationState("error")
  }

  /**
   * Effect: Handles email verification on component mount
   * 
   * Steps:
   * 1. Clears previous errors
   * 2. Sets loading state
   * 3. Calls verifyEmail API with token
   * 4. Updates state based on result
   * 5. Resets loading state
   */
  useEffect(() => {
    const handleEmailVerification = async () => {
      clearError();
      useAuthStore.setState({ isLoading: true });

      try {
        await verifyEmail(token);
        setVerificationState("success");
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationState("error");
      } finally {
        useAuthStore.setState({ isLoading: false });
      }
    };
    handleEmailVerification();
  }, []);

  /**
   * Handles resending verification email
   * 
   * Steps:
   * 1. Clears previous errors
   * 2. Sets loading state
   * 3. Calls resend API with stored email
   * 4. Resets verification state to loading
   * 5. Handles errors appropriately
   */
  const handleResendVerification = async () => {
    clearError();
    useAuthStore.setState({ isLoading: true });

    try {
      await resendVerificationEmail(email);
      setVerificationState("loading");
    } catch (error) {
      console.error("Resend error:", error);
      setVerificationState("error");
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  };

  /**
   * Renders UI based on verification state
   * 
   * Returns appropriate JSX for each state:
   * - loading: Verification in progress
   * - success: Successful verification
   * - error: Verification failed
   * - expired: Link has expired
   */
  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <>
            <CardHeader className="text-center pb-2">
              {/* Loading spinner */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verifying your email
              </CardTitle>
              <CardDescription className="text-gray-600">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    This should only take a few seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </>
        );

      case "success":
        return (
          <>
            <CardHeader className="text-center pb-2">
              {/* Success indicator */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email verified successfully!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your email address has been confirmed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                {/* Success message */}
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Welcome to AuthFlow!</strong>
                  </p>
                  <p className="text-sm text-green-700">
                    Your account is now fully activated and ready to use.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href="/signin">Continue to Sign In</Link>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        );

      case "error":
        return (
          <>
            <CardHeader className="text-center pb-2">
              {/* Error indicator */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verification failed
              </CardTitle>
              <CardDescription className="text-gray-600">
                We couldn't verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                {/* Error details */}
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Verification Error</strong>
                  </p>
                  <p className="text-sm text-red-700">
                    The verification link may be invalid or corrupted. Please
                    try requesting a new verification email.
                  </p>
                </div>

                {/* Recovery actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send New Verification Email
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/signin">Back to Sign In</Link>
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Need help? Contact our support team
                </p>
              </div>
            </CardContent>
          </>
        );

      case "expired":
        return (
          <>
            <CardHeader className="text-center pb-2">
              {/* Expired link indicator */}
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verification link expired
              </CardTitle>
              <CardDescription className="text-gray-600">
                This verification link is no longer valid
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                {/* Expiration details */}
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Link Expired</strong>
                  </p>
                  <p className="text-sm text-amber-700">
                    For security reasons, verification links expire after 24
                    hours. Please request a new verification email to continue.
                  </p>
                </div>

                {/* Email display */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">Email: {email}</p>
                </div>

                {/* Resend options */}
                <div className="space-y-3">
                  <Button
                    onClick={handleResendVerification}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/signin">Back to Sign In</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back navigation */}
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>

        {/* Verification status card */}
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          {renderContent()}
        </Card>

        {/* Demo environment indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Demo: Simulated verification states
          </div>
        </div>

        {/* Demo state controls */}
        {verificationState !== "loading" && (
          <div className="mt-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <p className="text-xs text-gray-600 mb-2">Demo Controls:</p>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setVerificationState("success")}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Success
                </button>
                <button
                  onClick={() => setVerificationState("error")}
                  className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Error
                </button>
                <button
                  onClick={() => setVerificationState("expired")}
                  className="px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                >
                  Expired
                </button>
                <button
                  onClick={() => setVerificationState("loading")}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Loading
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}