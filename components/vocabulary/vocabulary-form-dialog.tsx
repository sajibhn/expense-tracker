"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  multiVocabularySchema,
  type MultiVocabularyFormData,
} from "@/lib/validations/vocabulary";
import { createVocabulary, updateVocabulary } from "@/app/actions/vocabulary";
import { CategoryCombobox } from "./category-combobox";

interface EditData {
  id: string;
  german: string;
  english: string;
  example: string | null;
  vocabulary_category: { id: string; name: string } | null;
}

interface VocabularyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  onSaved?: () => void;
  editData?: EditData;
}

export function VocabularyFormDialog({
  open,
  onOpenChange,
  categories,
  onSaved,
  editData,
}: VocabularyFormDialogProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const isEditing = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MultiVocabularyFormData>({
    resolver: zodResolver(multiVocabularySchema),
    defaultValues: {
      entries: [{ german: "", english: "", example: "", category_name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  // Populate form when editing
  React.useEffect(() => {
    if (editData && open) {
      reset({
        entries: [
          {
            german: editData.german,
            english: editData.english,
            example: editData.example || "",
            category_name: editData.vocabulary_category?.name || "",
          },
        ],
      });
    }
  }, [editData, open, reset]);

  const onSubmit = async (data: MultiVocabularyFormData) => {
    setError(null);

    if (isEditing) {
      const entry = data.entries[0];
      const result = await updateVocabulary(editData!.id, {
        german: entry.german,
        english: entry.english,
        example: entry.example || undefined,
        category_name: entry.category_name || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
    } else {
      for (const entry of data.entries) {
        const result = await createVocabulary({
          german: entry.german,
          english: entry.english,
          example: entry.example || undefined,
          category_name: entry.category_name || undefined,
        });

        if (result.error) {
          setError(`Error saving "${entry.german}": ${result.error}`);
          return;
        }
      }
    }

    reset({ entries: [{ german: "", english: "", example: "", category_name: "" }] });
    onOpenChange(false);
    onSaved?.();
    router.refresh();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset({ entries: [{ german: "", english: "", example: "", category_name: "" }] });
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vocabulary" : "Add Vocabulary"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 p-4 rounded-lg border bg-muted/30"
            >
              {!isEditing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Word {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`german-${index}`}>German</Label>
                  <Input
                    id={`german-${index}`}
                    placeholder="German word"
                    {...register(`entries.${index}.german`)}
                  />
                  {errors.entries?.[index]?.german && (
                    <p className="text-sm text-red-500">
                      {errors.entries[index].german.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`english-${index}`}>English</Label>
                  <Input
                    id={`english-${index}`}
                    placeholder="English word"
                    {...register(`entries.${index}.english`)}
                  />
                  {errors.entries?.[index]?.english && (
                    <p className="text-sm text-red-500">
                      {errors.entries[index].english.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`example-${index}`}>Example</Label>
                <Textarea
                  id={`example-${index}`}
                  placeholder="Example sentence..."
                  rows={2}
                  {...register(`entries.${index}.example`)}
                />
                {errors.entries?.[index]?.example && (
                  <p className="text-sm text-red-500">
                    {errors.entries[index].example.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Category</Label>
                <CategoryCombobox
                  categories={categories}
                  value={watch(`entries.${index}.category_name`) || ""}
                  onChange={(val) =>
                    setValue(`entries.${index}.category_name`, val)
                  }
                />
              </div>
            </div>
          ))}

          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({ german: "", english: "", example: "", category_name: "" })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add More
            </Button>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
