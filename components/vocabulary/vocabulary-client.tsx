"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VocabularyFormDialog } from "./vocabulary-form-dialog";
import { CategoryFilter } from "./category-filter";
import { getVocabularies, deleteVocabulary } from "@/app/actions/vocabulary";

const PAGE_SIZE = 100;

interface VocabularyCategory {
  id: string;
  name: string;
}

interface Vocabulary {
  id: string;
  german: string;
  english: string;
  example: string | null;
  vocabulary_category_id: string | null;
  vocabulary_category: { id: string; name: string } | null;
}

interface VocabularyClientProps {
  initialVocabularies: Vocabulary[];
  initialCategories: VocabularyCategory[];
  initialCount: number;
}

export function VocabularyClient({
  initialVocabularies,
  initialCategories,
  initialCount,
}: VocabularyClientProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = React.useState<Vocabulary | null>(null);
  const [editVocabulary, setEditVocabulary] = React.useState<Vocabulary | null>(null);
  const [vocabularies, setVocabularies] =
    React.useState<Vocabulary[]>(initialVocabularies);
  const [totalCount, setTotalCount] = React.useState(initialCount);
  const [search, setSearch] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [page, setPage] = React.useState(0);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [isPending, startTransition] = React.useTransition();

  // Debounce search to avoid excessive server calls
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data from server when page, search, or category filters change
  React.useEffect(() => {
    startTransition(async () => {
      const result = await getVocabularies({
        search: debouncedSearch || undefined,
        categoryIds:
          selectedCategories.length > 0 ? selectedCategories : undefined,
        page,
        pageSize: PAGE_SIZE,
      });

      if (result.data) {
        setVocabularies(result.data as Vocabulary[]);
        setTotalCount(result.count);
      }
    });
  }, [page, debouncedSearch, selectedCategories, refreshKey]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedCategories]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this vocabulary?");
    if (!confirmed) return;

    const result = await deleteVocabulary(id);
    if (!result.error) {
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
      setTotalCount((prev) => prev - 1);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vocabulary ({totalCount})</h1>
          <p className="text-gray-600">Manage your German-English vocabulary</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vocabulary
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vocabulary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <CategoryFilter
          categories={initialCategories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      <div className={`space-y-2 ${isPending ? "opacity-50" : ""}`}>
        {vocabularies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {totalCount === 0 && !debouncedSearch && selectedCategories.length === 0
              ? 'No vocabulary added yet. Click "Add Vocabulary" to get started.'
              : "No vocabulary matches your filters."}
          </div>
        ) : (
          vocabularies.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedVocabulary(v)}
            >
              <span className="font-medium">{v.german}</span>
              <span className="text-muted-foreground">=</span>
              <span>{v.english}</span>
              {v.vocabulary_category && (
                <Badge variant="secondary" className="ml-auto">
                  {v.vocabulary_category.name}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`${v.vocabulary_category ? "" : "ml-auto "}h-8 w-8 text-muted-foreground hover:text-foreground`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditVocabulary(v);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(v.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1 || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <VocabularyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={initialCategories}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <VocabularyFormDialog
        open={!!editVocabulary}
        onOpenChange={(open) => {
          if (!open) setEditVocabulary(null);
        }}
        categories={initialCategories}
        onSaved={() => setRefreshKey((k) => k + 1)}
        editData={editVocabulary ?? undefined}
      />

      <Dialog
        open={!!selectedVocabulary}
        onOpenChange={(open) => {
          if (!open) setSelectedVocabulary(null);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Vocabulary Detail</DialogTitle>
          </DialogHeader>
          {selectedVocabulary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">German</p>
                  <p className="font-medium">{selectedVocabulary.german}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">English</p>
                  <p className="font-medium">{selectedVocabulary.english}</p>
                </div>
              </div>
              {selectedVocabulary.vocabulary_category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">
                    {selectedVocabulary.vocabulary_category.name}
                  </Badge>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Example</p>
                <p className="mt-1">
                  {selectedVocabulary.example || (
                    <span className="text-muted-foreground italic">No example added</span>
                  )}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditVocabulary(selectedVocabulary);
                    setSelectedVocabulary(null);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
