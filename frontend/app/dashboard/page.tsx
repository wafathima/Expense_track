// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import api from "../../services/api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseCard from "../components/ExpenseCard";
import DashboardCharts from "../components/Charts/DashboardCharts";
import ExpenseDetailModal from "../components/ExpenseDetailModal";

type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  payment_method_id: number;
  user_name: string;
  title: string;
  description: string;
  category: string;
  payment_method: string;
  amount: string;
  expense_date: string;
};

type Category = {
  id: number;
  name: string;
  icon?: string;
  color?: string;
};

type PaymentMethod = {
  id: number;
  name: string;
};

type ExpenseSummary = {
  total_expenses: string;
  total_amount: string;
  average_amount: string;
  highest_amount: string;
};

type CategorySummary = {
  id: number;
  category: string;
  expense_count: string;
  total_amount: string;
  icon?: string;
  color?: string;
};

type ExpenseFormData = {
  user_id: number;
  category_id: number;
  payment_method_id: number;
  title: string;
  description: string;
  amount: number;
  expense_date: string;
};

type Filters = {
  search: string;
  category: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    total_expenses: "0",
    total_amount: "0",
    average_amount: "0",
    highest_amount: "0",
  });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoadingData(true);
      const [expensesRes, categoriesRes, paymentMethodsRes, summaryRes, categorySummaryRes] =
        await Promise.all([
          api.get<Expense[]>("/expenses"),
          api.get<Category[]>("/categories"),
          api.get<PaymentMethod[]>("/payment-methods"),
          api.get<ExpenseSummary>("/analytics/summary"),
          api.get<CategorySummary[]>("/analytics/by-category"),
        ]);

      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
      setPaymentMethods(paymentMethodsRes.data);
      setSummary(summaryRes.data);
      setCategorySummary(categorySummaryRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, data);
        alert("✅ Expense updated successfully!");
      } else {
        await api.post("/expenses", data);
        alert("✅ Expense added successfully!");
      }

      await fetchAllData();
      setShowForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("❌ Failed to save expense. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      alert("🗑️ Expense deleted successfully!");
      await fetchAllData();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("❌ Failed to delete expense. Please try again.");
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleExpenseClick = (id: number) => {
    setSelectedExpenseId(id);
    setIsModalOpen(true);
  };

  const handleExpenseUpdated = () => {
    fetchAllData();
  };

  const handleFilter = async (filters: Filters) => {
    try {
      setLoadingData(true);
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category_id", filters.category);
      if (filters.paymentMethod) params.append("payment_method_id", filters.paymentMethod);

      let response;
      if (filters.startDate && filters.endDate) {
        const dateParams = new URLSearchParams({
          start_date: filters.startDate,
          end_date: filters.endDate,
        });
        response = await api.get<Expense[]>(`/expenses/filter-by-date?${dateParams}`);
      } else {
        response = await api.get<Expense[]>(`/expenses?${params}`);
      }

      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to filter expenses:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleClearFilters = () => {
    fetchAllData();
  };

  // Show loading while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)",
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1B4B34] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#8A8264]">Loading...</p>
        </div>
      </div>
    );
  }

  const totalSpent = Number(summary.total_amount);
  const averageAmount = Number(summary.average_amount);
  const highestAmount = Number(summary.highest_amount);

  return (
    <main
      className="min-h-screen px-4 py-8 md:px-8"
      style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)",
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(25deg, rgba(184,134,43,0.045) 0px, rgba(184,134,43,0.045) 1px, transparent 1px, transparent 16px)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#123423]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-[#8A8264]">Here's a summary of your expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Spending" value={`₹${totalSpent.toFixed(2)}`} accent />
          <SummaryCard label="Total Expenses" value={summary.total_expenses} />
          <SummaryCard label="Average Expense" value={`₹${averageAmount.toFixed(2)}`} />
          <SummaryCard label="Highest Expense" value={`₹${highestAmount.toFixed(2)}`} gold />
        </div>

        {/* Charts Section */}
        {showCharts && (
          <div className="mb-10 rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
            <DashboardCharts />
          </div>
        )}

        {/* Category Summary */}
        <div className="mb-10 rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center justify-between border-b border-dashed border-[#C9BE8E] pb-4">
            <h2
              className="text-xl font-semibold text-[#123423]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Spending by Category
            </h2>
            <span className="text-xs uppercase tracking-widest text-[#8A8264]">
              Top {Math.min(categorySummary.length, 4)}
            </span>
          </div>
          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            {categorySummary.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-baseline gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-[#123423]">{item.category}</span>
                <span className="mx-1 flex-1 translate-y-[-3px] border-b border-dotted border-[#B8AE82]" />
                <span className="text-xs text-[#8A8264]">{item.expense_count}x</span>
                <span className="font-mono font-semibold text-[#1B4B34]">
                  ₹{Number(item.total_amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {categorySummary.length > 4 && (
            <p className="mt-4 text-sm text-[#8A8264]">
              +{categorySummary.length - 4} more categories
            </p>
          )}
        </div>

        {/* Add Expense Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) setEditingExpense(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B4B34] px-6 py-3 font-medium text-[#F5F1E4] shadow-sm transition hover:bg-[#153A29] focus:outline-none focus:ring-2 focus:ring-[#B8862B] focus:ring-offset-2 focus:ring-offset-[#EFEAD9]"
          >
            {showForm ? "✖ Cancel" : "➕ Add Expense"}
          </button>
        </div>

        {/* Expense Form */}
        {showForm && (
          <ExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => {
              setShowForm(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense || undefined}
            categories={categories}
            paymentMethods={paymentMethods}
          />
        )}

        {/* Filters */}
        <div className="mb-6">
          <ExpenseFilters
            onFilter={handleFilter}
            onClear={handleClearFilters}
            categories={categories}
            paymentMethods={paymentMethods}
          />
        </div>

        {/* Expenses List */}
        <div className="overflow-hidden rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] shadow-sm">
          <div className="border-b border-dashed border-[#C9BE8E] p-6">
            <h2
              className="text-xl font-semibold text-[#123423]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Expenses <span className="font-mono text-[#7A9E85]">({expenses.length})</span>
            </h2>
            <p className="mt-1 text-sm text-[#8A8264]">Click on any expense to view details</p>
          </div>

          {loadingData ? (
            <div className="p-10 text-center text-[#8A8264]">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-10 text-center text-[#8A8264]">
              No expenses found. Start by adding your first expense! 💰
            </div>
          ) : (
            <div className="divide-y divide-[#E4DEC2]">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={handleExpenseClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ExpenseDetailModal
        expenseId={selectedExpenseId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpenseId(null);
        }}
        onExpenseUpdated={handleExpenseUpdated}
        categories={categories}
        paymentMethods={paymentMethods}
      />
    </main>
  );
}

// Summary Card Component
function SummaryCard({
  label,
  value,
  accent,
  gold,
}: {
  label: string;
  value: string;
  accent?: boolean;
  gold?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D9CFA6] bg-[#FBF9EF] p-5 shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: gold
            ? "linear-gradient(90deg, #B8862B, #E4C766)"
            : "linear-gradient(90deg, #1B4B34, #4E9B6E)",
        }}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7358]">{label}</p>
      <p
        className={`mt-2 font-mono text-2xl font-semibold ${
          gold ? "text-[#8A6111]" : accent ? "text-[#1B4B34]" : "text-[#123423]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}