"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./app-sidebar";
import { AddExpense } from "./views/add-expense";
import { AddUsers } from "./views/add-users";
import { HomeExpenses } from "./views/home-expenses";
import { MyExpenses } from "./views/my-expenses";
import { Overview } from "./views/overview";
import { Settlements } from "./views/settlements";

export function DashboardContent() {
  const [activeView, setActiveView] = useState("overview");

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <Overview />;
      case "add-expense":
        return <AddExpense />;
      case "my-expenses":
        return <MyExpenses />;
      case "home-expenses":
        return <HomeExpenses />;
      case "add-users":
        return <AddUsers />;
      case "settlements":
        return <Settlements />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex flex-1">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold capitalize">
            {activeView.replace("-", " ")}
          </h1>
        </header>
        <main className="flex-1 p-4">{renderView()}</main>
      </SidebarInset>
    </div>
  );
}
