"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-no-jsx";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function LoginForm() {
  const [contactNo, setContactNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    contactNo?: string;
    password?: string;
  }>({});

  const { login } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: { contactNo?: string; password?: string } = {};

    if (!contactNo.trim()) {
      errors.contactNo = "Contact number is required";
    } else if (contactNo.length < 10) {
      errors.contactNo = "Contact number must be at least 10 digits";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(contactNo, password);
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
        className: "border-green-200 bg-green-50 text-green-900",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";

      // Set different error messages based on the error
      if (errorMessage.includes("Invalid credentials")) {
        setError(
          "Invalid contact number or password. Please check your credentials and try again."
        );
      } else if (errorMessage.includes("User not found")) {
        setError(
          "No account found with this contact number. Please register first."
        );
      } else {
        setError(errorMessage);
      }

      // Add shake animation to form
      const form = e.target as HTMLFormElement;
      form.classList.add("animate-shake");
      setTimeout(() => form.classList.remove("animate-shake"), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear errors when user starts typing
    if (error) setError("");
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "contactNo") {
      setContactNo(value);
    } else if (field === "password") {
      setPassword(value);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-900 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="contactNo"
            className={`text-sm font-medium transition-colors ${
              fieldErrors.contactNo ? "text-red-600" : "text-gray-700"
            }`}
          >
            Contact Number
          </Label>
          <div className="relative">
            <Input
              id="contactNo"
              type="tel"
              value={contactNo}
              onChange={(e) => handleInputChange("contactNo", e.target.value)}
              placeholder="Enter your contact number"
              className={`transition-all duration-200 ${
                fieldErrors.contactNo
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : contactNo
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "focus:border-blue-500 focus:ring-blue-200"
              }`}
              required
            />
            {contactNo && !fieldErrors.contactNo && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldErrors.contactNo && (
            <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.contactNo}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className={`text-sm font-medium transition-colors ${
              fieldErrors.password ? "text-red-600" : "text-gray-700"
            }`}
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              className={`pr-10 transition-all duration-200 ${
                fieldErrors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : password
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : "focus:border-blue-500 focus:ring-blue-200"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className={`w-full h-11 font-medium transition-all duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
          }`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
