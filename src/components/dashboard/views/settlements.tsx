"use client";

import { useQuery } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth-no-jsx";
import { api } from "../../../../convex/_generated/api";

export function Settlements() {
  const { token, user } = useAuth();
  const stats = useQuery(
    api.expenses.getExpenseStats,
    token ? { token } : "skip"
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
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    if (amount > 0.01) {
      // Avoid tiny amounts due to floating point precision
      whoOwesWho.push({
        from: debtor.name,
        to: creditor.name,
        amount: amount,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settlements</h2>
        <p className="text-muted-foreground">
          Calculate who owes whom and how much
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Per Person
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.averagePerPerson.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{whoOwesWho.length}</div>
            <p className="text-sm text-muted-foreground">transactions needed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Individual Balances</CardTitle>
            <CardDescription>
              Who paid more or less than their share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userStats.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Paid ₹{user.totalPaid.toLocaleString()}
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
                        {user.balance > 0 ? "+" : ""}₹{user.balance.toFixed(0)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.balance > 0
                        ? "Gets back"
                        : user.balance < 0
                          ? "Needs to pay"
                          : "Settled"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  All settled! No transactions needed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {whoOwesWho.map((transaction, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {transaction.from.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{transaction.from}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          pays
                        </span>
                        <Badge className="font-semibold">
                          ₹{transaction.amount.toFixed(0)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          to
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{transaction.to}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {transaction.to.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Total amount to be transferred: ₹
                    {whoOwesWho
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
