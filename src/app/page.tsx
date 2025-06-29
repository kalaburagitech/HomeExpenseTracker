"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Dashboard } from "@/components/dashboard/dashboard";
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
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />
            {/* <div className="text-center">
              <Link href="/register">
                <Button variant="outline" className="w-full bg-transparent">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Admin Account
                </Button>
              </Link>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
