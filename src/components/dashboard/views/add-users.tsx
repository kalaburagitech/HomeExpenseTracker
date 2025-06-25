"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-no-jsx";
import { api } from "../../../../convex/_generated/api";

interface FormData {
  name: string;
  homeName: string;
  lastName: string;
  contactNo: string;
  password: string;
}

export function AddUsers() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    homeName: user?.homeName || "",
    lastName: "",
    contactNo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const users = useQuery(api.users.getAllUsers, token ? { token } : "skip");
  const addUserMutation = useMutation(api.users.addUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await addUserMutation({
        token,
        ...formData,
      });

      toast({
        title: "Success",
        description: "User added successfully!",
      });

      setFormData({
        name: "",
        homeName: user?.homeName || "",
        lastName: "",
        contactNo: "",
        password: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (user?.role !== "admin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            Only administrators can add new users
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add Users</h2>
        <p className="text-muted-foreground">
          Add friends to your home expense group
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New User
            </CardTitle>
            <CardDescription>
              Add a friend to your home expense tracking group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeName">Home Name</Label>
                <Input
                  id="homeName"
                  name="homeName"
                  value={formData.homeName}
                  onChange={handleChange}
                  placeholder="Enter home/group name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number</Label>
                <Input
                  id="contactNo"
                  name="contactNo"
                  type="tel"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding User..." : "Add User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Users
            </CardTitle>
            <CardDescription>
              {users?.length || 0} users in your home group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {user.name} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.contactNo}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
