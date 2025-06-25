"use client";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-no-jsx";

export default function Home() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Home Expense Tracker
            </CardTitle>
            <CardDescription>
              {showRegister
                ? "Create your admin account"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRegister ? (
              <RegisterForm onSuccess={() => setShowRegister(false)} />
            ) : (
              <LoginForm />
            )}
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setShowRegister(!showRegister)}
                className="text-sm"
              >
                {showRegister
                  ? "Already have an account? Sign in"
                  : "Need to create an admin account? Register"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
