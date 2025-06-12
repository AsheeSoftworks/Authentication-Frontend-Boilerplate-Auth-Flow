"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Check, CheckCircle, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import useAuthStore from "@/store/auth";
import { Alert, AlertDescription } from "./ui/alert";

export default function ResetPassword({token}: { token: string }) {

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerSchema = z
    .object({
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const [formData, setFormData] = useState<RegisterFormData>({
    password: "",
    confirm_password: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

    const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const { passwordReset, isLoading, error, clearError, googleLogin } =
    useAuthStore();

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

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    useAuthStore.setState({ isLoading: true });

    // Proceed with valid data
    const { confirm_password, password } = formData;
    console.log("Start 1");

    try {
      console.log("Next 1");
      console.log(confirm_password, password);
      await passwordReset(password, confirm_password, token);

      setIsSubmitted(true);

    } catch (error: any) {
      console.error("Sign up error:", error);

      if (error.code === "VALIDATION_ERROR") {
        // Handle validation errors from server
        setFormErrors((prev) => ({
          ...prev,
          [error.field || "general"]: error.message,
        }));
      }
    } finally{
      useAuthStore.setState({ isLoading: false });
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  const isPasswordStrong = passwordRequirements.every((req) => req.met);


   const getErrorMessage = (field: keyof RegisterFormData) => {
    return formErrors[field];
  }; 

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Password reset successful
              </CardTitle>
              <CardDescription className="text-gray-600">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    You can now sign in with your new password. For security
                    reasons, you'll need to sign in again on all your devices.
                  </p>
                </div>

                <Button
                  asChild
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/signin">Sign In Now</Link>
                </Button>

                <p className="text-xs text-gray-500">
                  This reset link has been used and is no longer valid
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Demo: Password reset simulation complete
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

        {/* Reset Password Card */}
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset your password
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Security Notice:</strong> This reset link will expire in
                10 minutes and can only be used once.
              </p>
            </div>

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
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="password">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {getErrorMessage("password") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("password")}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    Password requirements:
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            req.met ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          {req.met && (
                            <Check className="h-2.5 w-2.5 text-green-600" />
                          )}
                        </div>
                        <span
                          className={
                            req.met ? "text-green-600" : "text-gray-500"
                          }
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {getErrorMessage("confirm_password") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("confirm_password")}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={ !isPasswordStrong || isLoading }
              >
                {isLoading && <Loader2
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />}
                Update Password
              </Button>
            </form>

            {/* Security Tips */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                Security Tips:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a unique password you haven't used before</li>
                <li>• Consider using a password manager</li>
                <li>• Enable two-factor authentication when available</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            This is a demo - no actual password changes
          </div>
        </div>
      </div>
    </div>
  );
}
