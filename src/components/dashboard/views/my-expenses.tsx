"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Calendar, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-no-jsx";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export function MyExpenses() {
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const expenses = useQuery(
    api.expenses.getUserExpenses,
    token
      ? { token, month: selectedMonth === "all" ? undefined : selectedMonth }
      : "skip"
  );

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

  // Generate month options for the last 12 months with unique keys
  const monthOptions = [];
  const seenMonths = new Set<string>();

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format

    // Only add if we haven't seen this month before
    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      const monthLabel = format(date, "MMMM yyyy");
      monthOptions.push({ value: monthKey, label: monthLabel });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Expenses</h2>
          <p className="text-muted-foreground">Track your personal expenses</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ₹{totalAmount.toLocaleString()}
          </div>
          <p className="text-muted-foreground">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            {selectedMonth !== "all" &&
              ` in ${monthOptions.find((m) => m.value === selectedMonth)?.label}`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No expenses found</h3>
              <p className="text-muted-foreground text-center">
                {selectedMonth !== "all"
                  ? "No expenses for the selected month"
                  : "Start by adding your first expense"}
              </p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "PPP")}
                      </span>
                      {expense.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingReceipt(expense.receiptUrl!)}
                          className="h-6 px-2 ml-2"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                    <h3 className="font-medium mb-1">{expense.purpose}</h3>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {expense.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Added on {format(new Date(expense.createdAt), "PPp")}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="text-lg font-semibold"
                    >
                      ₹{expense.amount.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
