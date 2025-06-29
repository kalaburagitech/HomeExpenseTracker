"use client";

import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EditExpenseDialog } from "../edit-expense-dialog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/lib/auth-no-jsx";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export function HomeExpenses() {
  const { token, user } = useAuth();
  const [editingExpense, setEditingExpense] = useState<{
    _id: Id<"expenses">;
    purpose: string;
    amount: number;
    date: string;
    description?: string;
  } | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const { toast } = useToast();

  const expenses = useQuery(
    api.expenses.getAllExpenses,
    token ? { token } : "skip"
  );
  const deleteExpenseMutation = useMutation(api.expenses.deleteExpense);

  const handleDelete = async (expenseId: Id<"expenses">) => {
    if (!token) return;

    try {
      await deleteExpenseMutation({ token, expenseId });
      toast({
        title: "Success",
        description: "Expense deleted successfully!",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete expense";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!expenses) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const userTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.userName] = (acc[expense.userName] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Home Expenses</h2>
        <p className="text-muted-foreground">All expenses from home members</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              {expenses.length} total expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Totals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(userTotals).map(([userName, total]) => (
                <div
                  key={userName}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{userName}</span>
                  </div>
                  <Badge variant="outline">₹{total.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
              <p className="text-muted-foreground text-center">
                Expenses added by home members will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {expense.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{expense.userName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </Badge>
                        {expense.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setViewingReceipt(expense.receiptUrl!)
                            }
                            className="h-6 px-2"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                      <p className="text-sm mb-1">{expense.purpose}</p>
                      {expense.description && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Added {format(new Date(expense.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-lg font-semibold">
                      ₹{expense.amount.toLocaleString()}
                    </Badge>
                    {user?.role === "admin" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingExpense(expense)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(expense._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}

      {viewingReceipt && (
        <Dialog
          open={!!viewingReceipt}
          onOpenChange={(open) => !open && setViewingReceipt(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <Image
                src={viewingReceipt || "/placeholder.svg"}
                alt="Receipt"
                width={800}
                height={600}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  // If image fails to load, show as PDF or document
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const container = target.parentElement;
                  if (container) {
                    container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-8">
          <div class="h-16 w-16 text-muted-foreground mb-4 flex items-center justify-center">
            <svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-muted-foreground mb-4">Cannot preview this file type</p>
          <a href="${viewingReceipt}" target="_blank" rel="noopener noreferrer" 
             class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Open in New Tab
          </a>
        </div>
      `;
                  }
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
