"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Shield,
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

export default function VerifyEmailSignup() {
  const [resendCount, setResendCount] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("auth-storage");

    if (data) {
      const value: JWTAuthState = JSON.parse(data);
      if (value.state.user === null) {
        setEmail("");
      } else {
        setEmail(value.state.user.email);
      }
    } else {
      setEmail("");
    }
  }, []);

  const { clearError, resendVerificationEmail, isLoading } = useAuthStore();

  const handleResendVerification = async () => {
    clearError();
    useAuthStore.setState({ isLoading: true });

    try {
      setResendCount((prev) => prev + 1);
      await resendVerificationEmail(email);
    } catch (error) {
      console.error(error);
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Sign In */}
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>

        {/* Email Verification Notice Card */}
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Display */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-100">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">
                    Verification email sent to:
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-lg">{email}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Next Steps
                    </h4>
                    <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                      <li>
                        Check your email inbox for our verification message
                      </li>
                      <li>Click the verification link in the email</li>
                      <li>Return here to complete your account setup</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">
                      Security Notice
                    </h4>
                    <p className="text-sm text-amber-800">
                      The verification link will expire in{" "}
                      <strong>24 hours</strong> for your security. If you don't
                      verify within this time, you'll need to sign up again.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Email sent just now</span>
              </div>
            </div>

            {/* Resend Email Section */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email? Check your spam folder or request a
                  new one.
                </p>

                <Button
                  onClick={handleResendVerification}
                  disabled={isLoading || resendCount >= 5}
                  variant="outline"
                  className="w-full h-11"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                {resendCount > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Verification email resent successfully ({resendCount} time
                    {resendCount > 1 ? "s" : ""})
                  </p>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Make sure to check your spam/junk folder</p>
                <p>• Add our email to your contacts to avoid filtering</p>
                <p>• The verification link only works once</p>
                <p>• Contact support if you continue having issues</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/verify-email">I've Verified My Email</Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/signin">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Demo: No actual email sent
          </div>
        </div>
      </div>
    </div>
  );
}
