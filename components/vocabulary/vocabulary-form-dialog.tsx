"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  vocabularySchema,
  type VocabularyFormData,
} from "@/lib/validations/vocabulary";
import { createVocabulary } from "@/app/actions/vocabulary";
import { CategoryCombobox } from "./category-combobox";

interface VocabularyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
}

export function VocabularyFormDialog({
  open,
  onOpenChange,
  categories,
}: VocabularyFormDialogProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VocabularyFormData>({
    resolver: zodResolver(vocabularySchema),
    defaultValues: {
      german: "",
      english: "",
      category_name: "",
    },
  });

  const categoryName = watch("category_name");

  const onSubmit = async (data: VocabularyFormData) => {
    setError(null);
    const result = await createVocabulary({
      german: data.german,
      english: data.english,
      category_name: data.category_name || undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    reset();
    onOpenChange(false);
    router.refresh();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vocabulary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="german">German</Label>
            <Input
              id="german"
              placeholder="Enter German word"
              {...register("german")}
            />
            {errors.german && (
              <p className="text-sm text-red-500">{errors.german.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="english">English</Label>
            <Input
              id="english"
              placeholder="Enter English word"
              {...register("english")}
            />
            {errors.english && (
              <p className="text-sm text-red-500">{errors.english.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <CategoryCombobox
              categories={categories}
              value={categoryName || ""}
              onChange={(val) => setValue("category_name", val)}
            />
            {errors.category_name && (
              <p className="text-sm text-red-500">
                {errors.category_name.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
