import {
  getVocabularies,
  getVocabularyCategories,
} from "@/app/actions/vocabulary";
import { VocabularyClient } from "@/components/vocabulary/vocabulary-client";

export default async function VocabularyPage() {
  const [{ data: vocabularies, error, count }, { data: categories }] =
    await Promise.all([
      getVocabularies({ page: 0, pageSize: 100 }),
      getVocabularyCategories(),
    ]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading vocabularies: {error}
        </div>
      </div>
    );
  }

  return (
    <VocabularyClient
      initialVocabularies={vocabularies || []}
      initialCategories={categories || []}
      initialCount={count}
    />
  );
}
