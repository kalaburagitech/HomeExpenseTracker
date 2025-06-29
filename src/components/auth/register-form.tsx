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
import { useRouter } from "next/navigation";

interface FormData {
  name: string;
  homeName: string;
  lastName: string;
  contactNo: string;
  password: string;
}

interface FieldErrors {
  name?: string;
  lastName?: string;
  homeName?: string;
  contactNo?: string;
  password?: string;
}

export function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    homeName: "",
    lastName: "",
    contactNo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const validateForm = () => {
    const errors: FieldErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "First name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Home name validation
    if (!formData.homeName.trim()) {
      errors.homeName = "Home name is required";
    } else if (formData.homeName.trim().length < 3) {
      errors.homeName = "Home name must be at least 3 characters";
    }

    // Contact number validation
    if (!formData.contactNo.trim()) {
      errors.contactNo = "Contact number is required";
    } else if (!/^\d{10,15}$/.test(formData.contactNo.replace(/\s+/g, ""))) {
      errors.contactNo = "Contact number must be 10-15 digits";
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        "Password must contain at least one letter and one number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 1, label: "Too short", color: "text-red-500" };
    if (password.length < 8)
      return { strength: 2, label: "Weak", color: "text-orange-500" };
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password))
      return { strength: 2, label: "Weak", color: "text-orange-500" };
    if (password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password))
      return { strength: 3, label: "Good", color: "text-green-500" };
    return { strength: 4, label: "Strong", color: "text-green-600" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        ...formData,
        role: "admin" as const,
      });

      toast({
        title: "🎉 Welcome aboard!",
        description:
          "Your admin account has been created successfully. Redirecting to login...",
        className: "border-green-200 bg-green-50 text-green-900",
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";

      // Set different error messages based on the error
      if (errorMessage.includes("already exists")) {
        setError(
          "An account with this contact number already exists. Please use a different number or try logging in."
        );
      } else if (errorMessage.includes("Invalid")) {
        setError("Please check your information and try again.");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear errors when user starts typing
    if (error) setError("");
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const isFieldValid = (fieldName: keyof FormData) => {
    return formData[fieldName] && !fieldErrors[fieldName];
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    return `transition-all duration-200 ${
      fieldErrors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
        : isFieldValid(fieldName)
          ? "border-green-300 focus:border-green-500 focus:ring-green-200"
          : "focus:border-blue-500 focus:ring-blue-200"
    }`;
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
        {/* Name Fields - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className={`text-sm font-medium transition-colors ${fieldErrors.name ? "text-red-600" : "text-gray-700"}`}
            >
              First Name
            </Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter first name"
                className={getInputClassName("name")}
                required
              />
              {isFieldValid("name") && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {fieldErrors.name && (
              <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className={`text-sm font-medium transition-colors ${
                fieldErrors.lastName ? "text-red-600" : "text-gray-700"
              }`}
            >
              Last Name
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={getInputClassName("lastName")}
                required
              />
              {isFieldValid("lastName") && (
                <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {fieldErrors.lastName && (
              <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
                {fieldErrors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Home Name */}
        <div className="space-y-2">
          <Label
            htmlFor="homeName"
            className={`text-sm font-medium transition-colors ${
              fieldErrors.homeName ? "text-red-600" : "text-gray-700"
            }`}
          >
            Home Name
          </Label>
          <div className="relative">
            <Input
              id="homeName"
              name="homeName"
              value={formData.homeName}
              onChange={handleChange}
              placeholder="Enter home/group name"
              className={getInputClassName("homeName")}
              required
            />
            {isFieldValid("homeName") && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldErrors.homeName && (
            <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.homeName}
            </p>
          )}
        </div>

        {/* Contact Number */}
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
              name="contactNo"
              type="tel"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="Enter contact number"
              className={getInputClassName("contactNo")}
              required
            />
            {isFieldValid("contactNo") && (
              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {fieldErrors.contactNo && (
            <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
              {fieldErrors.contactNo}
            </p>
          )}
        </div>

        {/* Password */}
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
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className={`pr-10 ${getInputClassName("password")}`}
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

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 1
                        ? "w-1/4 bg-red-500"
                        : passwordStrength.strength === 2
                          ? "w-2/4 bg-orange-500"
                          : passwordStrength.strength === 3
                            ? "w-3/4 bg-green-500"
                            : passwordStrength.strength === 4
                              ? "w-full bg-green-600"
                              : "w-0"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${passwordStrength.color}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters with letters and numbers
              </p>
            </div>
          )}

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
              <span>Creating Account...</span>
            </div>
          ) : (
            "Create Admin Account"
          )}
        </Button>
      </form>
    </div>
  );
}
