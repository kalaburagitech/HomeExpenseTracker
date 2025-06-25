"use client";

import type React from "react";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-no-jsx";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface EditExpenseDialogProps {
  expense: {
    _id: Id<"expenses">;
    purpose: string;
    amount: number;
    date: string;
    description?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  purpose: string;
  amount: string;
  date: string;
  description: string;
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
}: EditExpenseDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    purpose: expense.purpose,
    amount: expense.amount.toString(),
    date: expense.date,
    description: expense.description || "",
  });

  const updateExpenseMutation = useMutation(api.expenses.updateExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await updateExpenseMutation({
        token,
        expenseId: expense._id,
        purpose: formData.purpose,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
      });

      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update expense";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Enter expense purpose"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
