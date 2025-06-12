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

/**
 * ResetPassword Component
 * 
 * Handles the password reset workflow:
 * 1. Validates password reset token
 * 2. Collects new password with confirmation
 * 3. Enforces password strength requirements
 * 4. Submits new password to authentication API
 * 5. Provides success feedback upon completion
 * 
 * Props:
 * @param {string} token - Password reset token from URL
 */
export default function ResetPassword({token}: { token: string }) {
  // State for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Zod schema for password validation:
   * - Minimum 6 characters
   * - Confirm password must match password
   */
  const registerSchema = z
    .object({
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords don't match",
      path: ["confirm_password"],
    });

  // Type inference for form data
  type RegisterFormData = z.infer<typeof registerSchema>;

  // Form state management
  const [formData, setFormData] = useState<RegisterFormData>({
    password: "",
    confirm_password: "",
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  // Tracks form submission attempts
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Authentication store hooks
  const { passwordReset, isLoading, error, clearError } = useAuthStore();

  /**
   * Effect: Auto-clear error messages after 5 seconds
   * Improves UX by clearing errors without user interaction
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // Auto-clear error after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  /**
   * Effect: Real-time form validation
   * Validates form when data changes after initial submission attempt
   */
  useEffect(() => {
    if (submitAttempted) {
      validateForm();
    }
  }, [formData, submitAttempted]);

  /**
   * Handles input field changes
   * - Updates form state
   * - Clears field-specific errors on input
   * 
   * @param field - Field name to update
   * @param value - New field value
   */
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validates form against Zod schema
   * - Sets error messages for invalid fields
   * - Returns boolean indicating validation success
   */
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

  /**
   * Handles form submission
   * - Validates form
   * - Calls password reset API
   * - Manages loading states
   * - Transitions to success state on success
   * 
   * @param e - Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitAttempted(true);
    
    // Validate form before submission
    if (!validateForm()) return;

    useAuthStore.setState({ isLoading: true });
    const { confirm_password, password } = formData;

    try {
      // Initiate password reset request
      await passwordReset(password, confirm_password, token);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Password reset error:", error);

      // Handle specific error cases
      if (error.code === "VALIDATION_ERROR") {
        setFormErrors((prev) => ({
          ...prev,
          [error.field || "general"]: error.message,
        }));
      }
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  };

  /**
   * Password strength requirements
   * - At least 8 characters
   * - Uppercase letter
   * - Lowercase letter
   * - Number
   */
  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ];

  // Checks if all password requirements are met
  const isPasswordStrong = passwordRequirements.every((req) => req.met);

  /**
   * Gets error message for a specific field
   * 
   * @param field - Field name to retrieve error for
   * @returns Error message string or undefined
   */
  const getErrorMessage = (field: keyof RegisterFormData) => {
    return formErrors[field];
  }; 

  // Render success state after password reset
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
                {/* Success message */}
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    You can now sign in with your new password. For security
                    reasons, you'll need to sign in again on all your devices.
                  </p>
                </div>

                {/* Sign-in button */}
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

          {/* Demo environment indicator */}
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

  // Main form render
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

        {/* Password Reset Card */}
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
            {/* Security notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Security Notice:</strong> This reset link will expire in
                10 minutes and can only be used once.
              </p>
            </div>

            {/* Error display */}
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

            {/* Password reset form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
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
                  {/* Password visibility toggle */}
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
                {/* Password error message */}
                {getErrorMessage("password") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("password")}
                  </p>
                )}
              </div>

              {/* Password strength indicator */}
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

              {/* Confirm Password Field */}
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
                  {/* Confirm password visibility toggle */}
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
                {/* Confirm password error message */}
                {getErrorMessage("confirm_password") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("confirm_password")}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!isPasswordStrong || isLoading}
              >
                {isLoading && <Loader2
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />}
                Update Password
              </Button>
            </form>

            {/* Security tips section */}
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

        {/* Demo environment indicator */}
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