"use server";

import { createSupabaseServerActionClient } from "@/app/lib/supabase/server-client";

export async function getDashboardData(dateRange: { from: string; to: string }) {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Fetch expenses with category information for the date range
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select(`
      amount,
      category_id,
      category:categories(id, name, thumbnail_url)
    `)
    .eq("user_id", user.id)
    .gte("date", dateRange.from)
    .lte("date", dateRange.to);

  if (expenseError) {
    return { data: null, error: expenseError.message };
  }

  // Fetch total payments for the date range
  const { data: payments, error: paymentError } = await supabase
    .from("payments")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", dateRange.from)
    .lte("date", dateRange.to);

  if (paymentError) {
    return { data: null, error: paymentError.message };
  }

  // Calculate total payments and count
  const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  const paymentsCount = payments?.length || 0;

  // Group expenses by category and sum amounts
  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      thumbnail_url: string | null;
      total: number;
    }
  >();

  expenses?.forEach((expense: any) => {
    if (expense.category) {
      const categoryId = expense.category.id;
      
      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.total += Number(expense.amount);
      } else {
        categoryMap.set(categoryId, {
          id: expense.category.id,
          name: expense.category.name,
          thumbnail_url: expense.category.thumbnail_url,
          total: Number(expense.amount),
        });
      }
    }
  });

  // Convert map to array and sort by total (descending)
  const categorySummary = Array.from(categoryMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return { 
    data: { 
      categorySummary, 
      totalPayments,
      paymentsCount
    }, 
    error: null 
  };
}

export async function getMonthlyComparison() {
  const supabase = await createSupabaseServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  // Calculate date range for last 6 months
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start from first day of that month
  
  const fromDate = formatDate(sixMonthsAgo, "yyyy-MM-dd");
  const toDate = formatDate(today, "yyyy-MM-dd");

  // Fetch expenses
  const { data: expenses, error: expenseError } = await supabase
    .from("expenses")
    .select("amount, date")
    .eq("user_id", user.id)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (expenseError) {
    return { data: null, error: expenseError.message };
  }

  // Fetch payments
  const { data: payments, error: paymentError } = await supabase
    .from("payments")
    .select("amount, date")
    .eq("user_id", user.id)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (paymentError) {
    return { data: null, error: paymentError.message };
  }

  // Group by month
  const monthlyData: { [key: string]: { expenses: number; payments: number } } = {};

  // Initialize last 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(today.getMonth() - (5 - i));
    const monthKey = formatDate(date, "yyyy-MM");
    monthlyData[monthKey] = { expenses: 0, payments: 0 };
  }

  // Sum expenses by month
  expenses?.forEach((expense) => {
    const monthKey = expense.date.substring(0, 7); // Get YYYY-MM
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses += Number(expense.amount);
    }
  });

  // Sum payments by month
  payments?.forEach((payment) => {
    const monthKey = payment.date.substring(0, 7); // Get YYYY-MM
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].payments += Number(payment.amount);
    }
  });

  // Convert to array format for chart
  const chartData = Object.entries(monthlyData).map(([monthKey, data]) => {
    const date = new Date(monthKey + "-01");
    return {
      month: formatDate(date, "MMMM"),
      expenses: Math.round(data.expenses),
      payments: Math.round(data.payments),
    };
  });

  return { data: chartData, error: null };
}

function formatDate(date: Date, formatStr: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`;
  } else if (formatStr === "yyyy-MM") {
    return `${year}-${month}`;
  } else if (formatStr === "MMMM") {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[date.getMonth()];
  }
  
  return date.toISOString();
}

