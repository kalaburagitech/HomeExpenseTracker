"use client";

import type React from "react";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-no-jsx";

interface FormData {
  date: string;
  purpose: string;
  amount: string;
}

export function AddExpense() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    purpose: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addExpenseMutation = useMutation(api.expenses.addExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await addExpenseMutation({
        token,
        date: formData.date,
        purpose: formData.purpose,
        amount: Number.parseFloat(formData.amount),
      });

      toast({
        title: "Success",
        description: "Expense added successfully!",
      });

      setFormData({
        date: new Date().toISOString().split("T")[0],
        purpose: "",
        amount: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add expense";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add New Expense
          </CardTitle>
          <CardDescription>
            Add your expense details for {user?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose/Description</Label>
              <Textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="What was this expense for?"
                rows={3}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding Expense..." : "Add Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
