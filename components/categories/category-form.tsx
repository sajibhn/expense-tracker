"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryFormData } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Database } from "@/types/supabase";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

type Category = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryFormProps {
  category?: Category;
  mode: "create" | "edit";
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    category?.thumbnail_url || null
  );
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      thumbnail_url: category?.thumbnail_url || "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("expense_tracker")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("expense_tracker")
        .getPublicUrl(filePath);

      setUploadedImageUrl(publicUrl);
      setValue("thumbnail_url", publicUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setValue("thumbnail_url", "");
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Use uploaded image URL if available
      const formData = {
        ...data,
        thumbnail_url: uploadedImageUrl || data.thumbnail_url || null,
      };

      const result = mode === "create"
        ? await createCategory(formData)
        : await updateCategory(category!.id, formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/categories");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., Food, Transport, Entertainment"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category Thumbnail (Optional)</Label>
        
        {/* Image Preview */}
        {uploadedImageUrl && (
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
            <Image
              src={uploadedImageUrl}
              alt="Category thumbnail"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isSubmitting || isUploading}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        {!uploadedImageUrl && (
          <label
            htmlFor="image-upload"
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-fit ${
              isUploading || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload Image</span>
              </>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading || isSubmitting}
              className="hidden"
            />
          </label>
        )}

        <p className="text-sm text-gray-500">
          Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create Category"
              : "Update Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

