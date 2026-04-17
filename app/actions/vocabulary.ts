"use server";

import { createSupabaseServerActionClient } from "@/app/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function getVocabularyCategories() {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("vocabulary_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return { data, error: error?.message };
}

export async function getVocabularies(params?: {
  search?: string;
  categoryIds?: string[];
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized", count: 0 };
  }

  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 100;

  // Count query
  let countQuery = supabase
    .from("vocabularies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (params?.search) {
    countQuery = countQuery.or(
      `german.ilike.%${params.search}%,english.ilike.%${params.search}%`
    );
  }

  if (params?.categoryIds && params.categoryIds.length > 0) {
    countQuery = countQuery.in("vocabulary_category_id", params.categoryIds);
  }

  const { count } = await countQuery;

  // Data query
  let query = supabase
    .from("vocabularies")
    .select(
      `
      *,
      vocabulary_category:vocabulary_categories(id, name)
    `
    )
    .eq("user_id", user.id);

  if (params?.search) {
    query = query.or(
      `german.ilike.%${params.search}%,english.ilike.%${params.search}%`
    );
  }

  if (params?.categoryIds && params.categoryIds.length > 0) {
    query = query.in("vocabulary_category_id", params.categoryIds);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  query = query.order("order", { ascending: false }).range(from, to);

  const { data, error } = await query;

  return { data, error: error?.message, count: count ?? 0 };
}

export async function createVocabulary(formData: {
  german: string;
  english: string;
  example?: string;
  category_name?: string;
}) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  let vocabularyCategoryId: string | null = null;

  if (formData.category_name && formData.category_name.trim()) {
    const categoryName = formData.category_name.trim();

    // Try to find existing category
    const { data: existingCategory } = await supabase
      .from("vocabulary_categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", categoryName)
      .single();

    if (existingCategory) {
      vocabularyCategoryId = existingCategory.id;
    } else {
      // Create new category
      const { data: newCategory, error: categoryError } = await supabase
        .from("vocabulary_categories")
        .insert({ name: categoryName, user_id: user.id })
        .select("id")
        .single();

      if (categoryError) {
        // Handle race condition: category might have been created concurrently
        const { data: retryCategory } = await supabase
          .from("vocabulary_categories")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", categoryName)
          .single();

        if (retryCategory) {
          vocabularyCategoryId = retryCategory.id;
        } else {
          return { data: null, error: categoryError.message };
        }
      } else {
        vocabularyCategoryId = newCategory.id;
      }
    }
  }

  const { data, error } = await supabase
    .from("vocabularies")
    .insert({
      german: formData.german,
      english: formData.english,
      example: formData.example || null,
      vocabulary_category_id: vocabularyCategoryId,
      user_id: user.id,
    })
    .select(
      `
      *,
      vocabulary_category:vocabulary_categories(id, name)
    `
    )
    .single();

  if (!error) {
    revalidatePath("/vocabulary");
  }

  return { data, error: error?.message };
}

export async function updateVocabulary(
  id: string,
  formData: {
    german: string;
    english: string;
    example?: string;
    category_name?: string;
  }
) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  let vocabularyCategoryId: string | null = null;

  if (formData.category_name && formData.category_name.trim()) {
    const categoryName = formData.category_name.trim();

    const { data: existingCategory } = await supabase
      .from("vocabulary_categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", categoryName)
      .single();

    if (existingCategory) {
      vocabularyCategoryId = existingCategory.id;
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from("vocabulary_categories")
        .insert({ name: categoryName, user_id: user.id })
        .select("id")
        .single();

      if (categoryError) {
        const { data: retryCategory } = await supabase
          .from("vocabulary_categories")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", categoryName)
          .single();

        if (retryCategory) {
          vocabularyCategoryId = retryCategory.id;
        } else {
          return { data: null, error: categoryError.message };
        }
      } else {
        vocabularyCategoryId = newCategory.id;
      }
    }
  }

  const { data, error } = await supabase
    .from("vocabularies")
    .update({
      german: formData.german,
      english: formData.english,
      example: formData.example || null,
      vocabulary_category_id: vocabularyCategoryId,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(
      `
      *,
      vocabulary_category:vocabulary_categories(id, name)
    `
    )
    .single();

  if (!error) {
    revalidatePath("/vocabulary");
  }

  return { data, error: error?.message };
}

export async function deleteVocabulary(id: string) {
  const supabase = await createSupabaseServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("vocabularies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/vocabulary");
  }

  return { error: error?.message };
}
