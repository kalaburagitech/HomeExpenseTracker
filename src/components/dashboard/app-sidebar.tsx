"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Plus,
  Receipt,
  Users,
  LogOut,
  ChevronUp,
  Home,
  Calculator,
} from "lucide-react";
import { useAuth } from "@/lib/auth-no-jsx";

const menuItems = [
  {
    title: "Overview",
    icon: BarChart3,
    id: "overview",
  },
  {
    title: "Add Expense",
    icon: Plus,
    id: "add-expense",
  },
  {
    title: "My Expenses",
    icon: Receipt,
    id: "my-expenses",
  },
  {
    title: "Home Expenses",
    icon: Home,
    id: "home-expenses",
  },
];

const adminMenuItems = [
  {
    title: "Add Users",
    icon: Users,
    id: "add-users",
  },
  {
    title: "Settlements",
    icon: Calculator,
    id: "settlements",
  },
];

interface AppSidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function AppSidebar({
  activeView = "overview",
  onViewChange,
}: AppSidebarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleViewChange = (viewId: string) => {
    onViewChange?.(viewId);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Home className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="font-semibold text-lg">{user.homeName}</h2>
            <p className="text-sm text-muted-foreground">Expense Tracker</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleViewChange(item.id)}
                    isActive={activeView === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleViewChange(item.id)}
                      isActive={activeView === item.id}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
