"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuthStore from "@/store/auth";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitEmail, setSubmitEmail] = useState("")

  const registerSchema = z.object({
    email: z.string().email("Please enter a valid email"),
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const {
    requestPasswordReset,
    isLoading,
    error,
    clearError,
    resendVerificationEmail,
  } = useAuthStore();

    const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Clear errors when user starts typing
    useEffect(() => {
      if (error) {
        const timer = setTimeout(() => {
          clearError();
        }, 5000); // Auto-clear error after 5 seconds
  
        return () => clearTimeout(timer);
      }
    }, [error, clearError]);
  
    // Validate form in real-time after first submit attempt
    useEffect(() => {
      if (submitAttempted) {
        validateForm();
      }
    }, [formData, submitAttempted]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
        fieldErrors[field] = err.message;
      });
      setFormErrors(fieldErrors);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const result = registerSchema.safeParse(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    // Proceed with valid data
    const { email } = formData;
    setSubmitEmail(email);

    console.log("Start 1");

    try {
      console.log("Next 1");
      console.log(email);
      await requestPasswordReset(email);

      useAuthStore.setState({ isLoading: false });
      if (!useAuthStore.getState().error) {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Handle specific error cases
      if (error.code === "VALIDATION_ERROR") {
        // Handle validation errors from server
        setFormErrors((prev) => ({
          ...prev,
          [error.field || "general"]: error.message,
        }));
      }
    } finally {
      useAuthStore.setState({ isLoading: true });
    }
  };

  const handleResendVerificationEmail = () => {
    try {
      useAuthStore.setState({ isLoading: true });
      resendVerificationEmail(submitEmail);
      useAuthStore.setState({ isLoading: false });
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Handle specific error cases
      if (error.code === "VALIDATION_ERROR") {
        // Handle validation errors from server
        setFormErrors((prev) => ({
          ...prev,
          [error.field || "general"]: error.message,
        }));
      }
    } finally {
      useAuthStore.setState({ isLoading: true });
    }
  };

  const getErrorMessage = (field: keyof RegisterFormData) => {
    return formErrors[field];
  };

  if (isSubmitted) {
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

          {/* Success Card */}
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check your email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We've sent password reset instructions to
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900">{formData.email}</p>
                </div>

                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      try another email address
                    </button>
                  </p>

                  <div className="pt-4 border-t">
                    <p className="mb-3">
                      The reset link will expire in 15 minutes for security.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleResendVerificationEmail();
                      }}
                    >
                      {isLoading ? (
                        <Loader2
                          className={`h-4 w-4 mr-2 ${
                            isLoading ? "animate-spin" : ""
                          }`}
                        />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Resend Email
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Demo: No actual email sent
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Forgot Password Card */}
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              No worries! Enter your email and we'll send you reset
              instructions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <p>{error.message}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                  {getErrorMessage("email") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("email")}
                  </p>
                )}
                </div>
                <p className="text-xs text-gray-500">
                  Enter the email address associated with your account
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!formData.email || isLoading}
              >
                {isLoading ? (
                  <Loader2
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Reset Link
              </Button>
            </form>

            {/* Additional Help */}
            <div className="space-y-4 text-center text-sm">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Need help?</h4>
                <p className="text-blue-700 text-xs leading-relaxed">
                  If you're still having trouble accessing your account, please
                  contact our support team.
                </p>
              </div>

              <div className="text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/signin"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            This is a demo - no actual emails sent
          </div>
        </div>
      </div>
    </div>
  );
}
