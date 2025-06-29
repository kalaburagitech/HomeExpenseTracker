"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import { CalendarIcon, DollarSign, Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-no-jsx";
import type { Id } from "../../../../convex/_generated/dataModel";

interface FormData {
  date: string;
  purpose: string;
  amount: string;
  description: string;
}

export function AddExpense() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    purpose: "",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<Id<"_storage"> | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addExpenseMutation = useMutation(api.expenses.addExpense);
  const generateUploadUrl = useMutation(api.expenses.generateUploadUrl);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPEG, PNG) or PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const response = await result.json();
      const storageId = response.storageId as Id<"_storage">;

      setUploadedFile(file);
      setUploadedFileId(storageId);

      toast({
        title: "File uploaded",
        description: "Receipt uploaded successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedFileId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        description: formData.description,
        receiptFileId: uploadedFileId || undefined,
      });

      toast({
        title: "Success",
        description: "Expense added successfully!",
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        purpose: "",
        amount: "",
        description: "",
      });
      removeFile();
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

            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Any additional details..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt/Document (Optional)</Label>
              <div className="space-y-2">
                <Input
                  ref={fileInputRef}
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Receipt
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">
                        {uploadedFile.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
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
