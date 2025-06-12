"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Chrome,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import useAuthStore from "@/store/auth";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { Alert, AlertDescription } from "@/components/ui/alert";

// SignIn component handles email/password and Google login
export default function SignIn() {
  // Local state for form handling and UI behavior
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validation schema using Zod
  const registerSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const router = useRouter();
  const { logIn, isLoading, error, clearError, googleLogin } = useAuthStore();

  // Validates form data using Zod schema
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

  // Clears global auth error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Triggers validation on every input change after first submission
  useEffect(() => {
    if (submitAttempted) {
      validateForm();
    }
  }, [formData, submitAttempted]);

  // Handles input changes and updates form state
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    useAuthStore.setState({ isLoading: true });
    setSubmitAttempted(true);

    if (!validateForm()) return;

    const { email, password } = formData;

    try {
      await logIn(email, password);
      setShowSuccessMessage(true);

      // Redirect after success message
      setTimeout(() => {
        router.push("/dashboard?message=sigin-success");
      }, 2000);
    } catch (error: any) {
      console.error("Sign in error:", error);

      if (error.code === "CONFLICT" && error.field === "email") {
        setFormErrors((prev) => ({
          ...prev,
          email: "An account with this email doesn't exist",
        }));
      } else if (error.code === "VALIDATION_ERROR") {
        setFormErrors((prev) => ({
          ...prev,
          [error.field || "general"]: error.message,
        }));
      }
    }
  };

  // Handles Google OAuth login
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        await googleLogin(credentialResponse.code);
        setTimeout(() => {
          router.push("/dashboard?message=sigin-success");
        }, 2000);
      } catch (error: any) {
        console.error("Google login failed:", error);
      }
    },
    onError: () => {
      useAuthStore.setState({
        error: {
          message: "Google login failed. Please try again.",
          code: "GOOGLE_LOGIN_ERROR",
        },
      });
    },
    flow: "auth-code",
  });

  // Utility: Get specific error message for a field
  const getErrorMessage = (field: keyof RegisterFormData) => formErrors[field];

  // Utility: Set input class based on validation state
  const getInputClassNames = (
    field: keyof RegisterFormData,
    baseClasses: string
  ) => {
    const hasError = formErrors[field];
    return `${baseClasses} ${
      hasError ? "border-red-500 focus:border-red-500" : ""
    }`;
  };

  // Renders a success screen on login
  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Signed In Successfully!
            </h2>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to Dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Sign In form UI
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Sign In Card */}
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11"
                type="button"
                onClick={handleGoogleLogin}
              >
                <Chrome className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>
              {/* <Button variant="outline" className="w-full h-11" type="button">
                <Github className="h-5 w-5 mr-2" />
                Continue with GitHub
              </Button> */}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error.message}</span>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* Email & Password Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                {getErrorMessage("email") && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getErrorMessage("email")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10 pr-10 h-11"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-normal text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && (
                  <Loader2
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                )}
                Sign In
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            This is a demo - no actual authentication
          </div>
        </div>
      </div>
    </div>
  );
}
