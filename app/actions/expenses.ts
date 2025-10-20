"use server";

import { createSupabaseServerActionClient } from "@/app/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export async function getExpenses(params?: {
  dateRange?: { from?: string; to?: string };
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized", count: 0 };
  }

  // Get total count first
  let countQuery = supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Apply date range filter to count if provided
  if (params?.dateRange?.from && params?.dateRange?.to) {
    countQuery = countQuery
      .gte("date", params.dateRange.from)
      .lte("date", params.dateRange.to);
  }

  const { count } = await countQuery;

  // Build data query
  let query = supabase
    .from("expenses")
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq("user_id", user.id);

  // Apply date range filter if provided
  if (params?.dateRange?.from && params?.dateRange?.to) {
    query = query
      .gte("date", params.dateRange.from)
      .lte("date", params.dateRange.to);
  }

  // Apply pagination
  const page = params?.page ?? 0;
  const pageSize = params?.pageSize ?? 10;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  query = query
    .order("date", { ascending: false })
    .range(from, to);

  const { data, error } = await query;

  return { data, error: error?.message, count: count ?? 0 };
}

export async function getExpenseById(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message };
}

export async function createExpense(formData: {
  name: string;
  category_id: string;
  amount: number;
  date: string;
}) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const expenseData: ExpenseInsert = {
    name: formData.name,
    category_id: formData.category_id,
    amount: formData.amount,
    date: formData.date,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("expenses")
    .insert(expenseData)
    .select()
    .single();

  if (!error) {
    revalidatePath("/expenses");
  }

  return { data, error: error?.message };
}

export async function updateExpense(
  id: string,
  formData: { name: string; category_id: string; amount: number; date: string }
) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const expenseData: ExpenseUpdate = {
    name: formData.name,
    category_id: formData.category_id,
    amount: formData.amount,
    date: formData.date,
  };

  const { data, error } = await supabase
    .from("expenses")
    .update(expenseData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}/edit`);
  }

  return { data, error: error?.message };
}

export async function deleteExpense(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/expenses");
  }

  return { error: error?.message };
}

