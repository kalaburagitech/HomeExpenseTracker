"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-no-jsx";
import { api } from "../../../../convex/_generated/api";

export function Settlements() {
  const { token, user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.toISOString().substring(0, 7); // YYYY-MM format for current month
  });

  const stats = useQuery(
    api.expenses.getExpenseStats,
    token ? { token, month: selectedMonth } : "skip"
  );

  if (user?.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            Only administrators can view settlements
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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

  // Generate month options for the last 12 months
  const monthOptions = [];
  const seenMonths = new Set<string>();

  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);

    if (!seenMonths.has(monthKey)) {
      seenMonths.add(monthKey);
      const monthLabel = format(date, "MMMM yyyy");
      monthOptions.push({ value: monthKey, label: monthLabel });
    }
  }

  // Calculate settlements
  const whoOwesWho = [];
  const creditors = stats.userStats
    .filter((user) => user.balance > 0)
    .sort((a, b) => b.balance - a.balance);
  const debtors = stats.userStats
    .filter((user) => user.balance < 0)
    .sort((a, b) => a.balance - b.balance);

  // Simple settlement algorithm
  let i = 0,
    j = 0;
  const creditorsClone = creditors.map((c) => ({ ...c }));
  const debtorsClone = debtors.map((d) => ({ ...d }));

  while (i < creditorsClone.length && j < debtorsClone.length) {
    const creditor = creditorsClone[i];
    const debtor = debtorsClone[j];
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amount > 0.01) {
      whoOwesWho.push({
        from: debtor.name,
        fromId: debtor.userId,
        to: creditor.name,
        toId: creditor.userId,
        amount: amount,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j++;
  }

  const totalSettlementAmount = whoOwesWho.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settlements</h2>
          <p className="text-muted-foreground">
            Calculate who owes whom and how much
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(selectedMonth), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calculator className="h-4 w-4" />
              Per Person Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.averagePerPerson.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Equal split amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Home members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ArrowRight className="h-4 w-4" />
              Settlements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{whoOwesWho.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              transactions needed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Individual Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Balances</CardTitle>
            <CardDescription>
              Detailed breakdown of payments and balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userStats.map((user) => (
                <div
                  key={user.userId}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.expenseCount} expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {user.balance > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : user.balance < 0 ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : null}
                        <Badge
                          variant={
                            user.balance > 0
                              ? "default"
                              : user.balance < 0
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {user.balance > 0 ? "+" : ""}₹
                          {user.balance.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="font-semibold text-blue-700">
                        ₹{user.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-muted-foreground">
                        Should Pay
                      </p>
                      <p className="font-semibold">
                        ₹{user.shouldPay.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-muted-foreground">
                        {user.balance > 0
                          ? "Gets Back"
                          : user.balance < 0
                            ? "Owes"
                            : "Settled"}
                      </p>
                      <p
                        className={`font-semibold ${
                          user.balance > 0
                            ? "text-green-700"
                            : user.balance < 0
                              ? "text-red-700"
                              : "text-gray-700"
                        }`}
                      >
                        ₹{Math.abs(user.balance).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settlement Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Settlement Transactions</CardTitle>
            <CardDescription>
              Minimum transactions to settle all debts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {whoOwesWho.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-green-700">
                  All Settled!
                </h3>
                <p className="text-muted-foreground">
                  No transactions needed for this month.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {whoOwesWho.map((transaction, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-green-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-red-100 text-red-700">
                            {transaction.from.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{transaction.from}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          variant="outline"
                          className="font-semibold text-lg px-3 py-1"
                        >
                          ₹{transaction.amount.toFixed(0)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-medium">{transaction.to}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-green-100 text-green-700">
                            {transaction.to.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                      >
                        Mark as Paid
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Settlement Summary
                    </h4>
                    <p className="text-sm text-blue-700">
                      Total amount to be transferred:{" "}
                      <span className="font-bold">
                        ₹{totalSettlementAmount.toFixed(0)}
                      </span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {whoOwesWho.length} transaction
                      {whoOwesWho.length !== 1 ? "s" : ""} needed to settle all
                      debts
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
