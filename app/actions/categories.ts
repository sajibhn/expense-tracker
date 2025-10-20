"use server";

import { createSupabaseServerActionClient } from "@/app/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function getCategories() {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data, error: error?.message };
}

export async function getCategoryById(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message };
}

export async function createCategory(formData: { name: string; thumbnail_url?: string | null }) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const categoryData: CategoryInsert = {
    name: formData.name,
    thumbnail_url: formData.thumbnail_url || null,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select()
    .single();

  if (!error) {
    revalidatePath("/categories");
  }

  return { data, error: error?.message };
}

export async function updateCategory(id: string, formData: { name: string; thumbnail_url?: string | null }) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const categoryData: CategoryUpdate = {
    name: formData.name,
    thumbnail_url: formData.thumbnail_url || null,
  };

  const { data, error } = await supabase
    .from("categories")
    .update(categoryData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/categories");
    revalidatePath(`/categories/${id}/edit`);
  }

  return { data, error: error?.message };
}

export async function deleteCategory(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/categories");
  }

  return { error: error?.message };
}

