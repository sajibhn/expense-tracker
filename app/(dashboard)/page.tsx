import { getDashboardData, getMonthlyComparison } from "@/app/actions/dashboard";
import { DashboardClient } from "./dashboard-client";
import { format, startOfMonth, endOfDay } from "date-fns";
import { ChartBarMultiple } from "@/components/bar-chart";

export default async function DashboardPage() {
  // Get expenses from start of current month to today
  const fromDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const toDate = format(endOfDay(new Date()), "yyyy-MM-dd");
  
  const [dashboardResult, monthlyResult] = await Promise.all([
    getDashboardData({ from: fromDate, to: toDate }),
    getMonthlyComparison(),
  ]);

  if (dashboardResult.error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading dashboard: {dashboardResult.error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardClient initialData={dashboardResult.data || { categorySummary: [], totalPayments: 0, paymentsCount: 0 }} />
      
      {/* Monthly Comparison Chart */}
      <ChartBarMultiple data={monthlyResult.data || []} />
    </div>
  );
}
