"use server";

import { createSupabaseServerActionClient } from "@/app/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PaymentUpdate = Database["public"]["Tables"]["payments"]["Update"];

export async function getPayments(params?: {
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
    .from("payments")
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
    .from("payments")
    .select("*")
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

export async function getPaymentById(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  return { data, error: error?.message };
}

export async function createPayment(formData: { amount: number; date: string; payment_from?: string | null }) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const paymentData: PaymentInsert = {
    amount: formData.amount,
    date: formData.date,
    payment_from: formData.payment_from || null,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select()
    .single();

  if (!error) {
    revalidatePath("/payments");
  }

  return { data, error: error?.message };
}

export async function updatePayment(id: string, formData: { amount: number; date: string; payment_from?: string | null }) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const paymentData: PaymentUpdate = {
    amount: formData.amount,
    date: formData.date,
    payment_from: formData.payment_from || null,
  };

  const { data, error } = await supabase
    .from("payments")
    .update(paymentData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error) {
    revalidatePath("/payments");
    revalidatePath(`/payments/${id}/edit`);
  }

  return { data, error: error?.message };
}

export async function deletePayment(id: string) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("payments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (!error) {
    revalidatePath("/payments");
  }

  return { error: error?.message };
}

