"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-no-jsx";

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  homeName: string;
  lastName: string;
  contactNo: string;
  password: string;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    homeName: "",
    lastName: "",
    contactNo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        ...formData,
        role: "admin" as const,
      });
      toast({
        title: "Success",
        description: "Admin account created successfully! You can now sign in.",
      });
      // Reset form
      setFormData({
        name: "",
        homeName: "",
        lastName: "",
        contactNo: "",
        password: "",
      });
      // Call onSuccess to switch back to login form
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">First Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="homeName">Home Name</Label>
        <Input
          id="homeName"
          name="homeName"
          value={formData.homeName}
          onChange={handleChange}
          placeholder="Enter home/group name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactNo">Contact Number</Label>
        <Input
          id="contactNo"
          name="contactNo"
          type="tel"
          value={formData.contactNo}
          onChange={handleChange}
          placeholder="Enter contact number"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Create Admin Account"}
      </Button>
    </form>
  );
}
