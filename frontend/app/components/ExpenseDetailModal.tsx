"use client";

import { useEffect, useState } from "react";
import api from "../../services/api";

type ExpenseDetail = {
  id: number;
  title: string;
  description: string;
  amount: string;
  expense_date: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  payment_method_name: string;
  user_name: string;
  created_at: string;
  updated_at: string;
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

type ExpenseDetailModalProps = {
  expenseId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated: () => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
};

const inputClass =
  "w-full rounded-lg border border-[#D9CFA6] bg-white p-3 text-[#123423] focus:border-[#1B4B34] focus:outline-none focus:ring-2 focus:ring-[#1B4B34]/20";
const labelClass = "mb-1 block text-sm font-medium text-[#4B4630]";

export default function ExpenseDetailModal({
  expenseId,
  isOpen,
  onClose,
  onExpenseUpdated,
  categories,
  paymentMethods,
}: ExpenseDetailModalProps) {
  const [expense, setExpense] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    amount: "",
    expense_date: "",
    category_id: 0,
    payment_method_id: 0,
  });

  useEffect(() => {
    if (isOpen && expenseId) {
      fetchExpenseDetail();
    }
  }, [isOpen, expenseId]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, isEditing]);

  const fetchExpenseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/analytics/expense-details/${expenseId}`);
      setExpense(response.data);

      setEditData({
        title: response.data.title || "",
        description: response.data.description || "",
        amount: response.data.amount || "",
        expense_date: response.data.expense_date || "",
        category_id: response.data.category_id || 0,
        payment_method_id: response.data.payment_method_id || 0,
      });
    } catch (error) {
      console.error("Failed to fetch expense detail:", error);
      setError("Failed to load expense details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setEditLoading(true);
      await api.put(`/expenses/${expenseId}`, {
        ...editData,
        amount: Number(editData.amount),
        user_id: 1,
      });

      await fetchExpenseDetail();
      onExpenseUpdated();
      setIsEditing(false);
      alert("✅ Expense updated successfully!");
    } catch (error) {
      console.error("Failed to update expense:", error);
      alert("❌ Failed to update expense. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isEditing) {
        setIsEditing(false);
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E2A1F]/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between bg-[#123423] px-6 py-5">
          <div className="flex items-center gap-3">
            {!isEditing && expense?.category_icon && (
              <span className="text-3xl">{expense.category_icon}</span>
            )}
            <div>
              {isEditing ? (
                <h2
                  className="text-2xl font-bold text-[#F5F1E4]"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  Edit Expense
                </h2>
              ) : (
                <>
                  <h2
                    className="text-2xl font-bold text-[#F5F1E4]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {expense?.title || "Expense Details"}
                  </h2>
                  <p className="text-sm text-[#8FBF9F]">Added by {expense?.user_name || "Unknown"}</p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
              } else {
                onClose();
              }
            }}
            className="rounded-lg p-2 text-[#BFDAC7] hover:bg-white/10 hover:text-[#F5F1E4]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#D9CFA6] border-t-[#1B4B34]"></div>
                <p className="mt-4 text-[#8A8264]">Loading expense details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center text-[#A83A32]">
                <p className="text-lg">❌ {error}</p>
                <button
                  onClick={fetchExpenseDetail}
                  className="mt-4 rounded-lg bg-[#1B4B34] px-4 py-2 text-[#F5F1E4] hover:bg-[#153A29]"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Amount *</label>
                  <input
                    type="number"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={editData.category_id}
                    onChange={(e) => setEditData({ ...editData, category_id: Number(e.target.value) })}
                    required
                    className={inputClass}
                  >
                    <option value={0}>Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Payment Method *</label>
                  <select
                    value={editData.payment_method_id}
                    onChange={(e) =>
                      setEditData({ ...editData, payment_method_id: Number(e.target.value) })
                    }
                    required
                    className={inputClass}
                  >
                    <option value={0}>Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Date *</label>
                  <input
                    type="date"
                    value={editData.expense_date}
                    onChange={(e) => setEditData({ ...editData, expense_date: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <input
                    type="text"
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="What did you buy?"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-dashed border-[#C9BE8E] pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border border-[#C9BE8E] px-4 py-3 font-medium text-[#123423] hover:bg-[#F0ECD9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 rounded-lg bg-[#1B4B34] px-4 py-3 font-medium text-[#F5F1E4] hover:bg-[#153A29] disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : expense ? (
            <div className="space-y-6">
              {/* Amount */}
              <div
                className="relative overflow-hidden rounded-xl p-6"
                style={{ background: "linear-gradient(135deg, #123423, #1B4B34)" }}
              >
                <svg
                  className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 opacity-[0.1]"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#D8B84A" strokeWidth="2" />
                  <text x="50" y="59" textAnchor="middle" fontSize="30" fill="#D8B84A" fontFamily="serif">
                    ₹
                  </text>
                </svg>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FBF9F]">Amount</p>
                <p className="mt-1 font-mono text-4xl font-bold text-[#F5F1E4]">
                  ₹{Number(expense.amount).toFixed(2)}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[#D9CFA6] bg-white p-4">
                  <p className="text-sm text-[#8A8264]">Category</p>
                  <p className="font-medium text-[#123423]">
                    <span style={{ color: expense.category_color || "#1B4B34" }}>
                      {expense.category_icon} {expense.category_name || "Uncategorized"}
                    </span>
                  </p>
                </div>

                <div className="rounded-lg border border-[#D9CFA6] bg-white p-4">
                  <p className="text-sm text-[#8A8264]">Payment Method</p>
                  <p className="font-medium text-[#123423]">
                    {expense.payment_method_name || "Not specified"}
                  </p>
                </div>

                <div className="rounded-lg border border-[#D9CFA6] bg-white p-4">
                  <p className="text-sm text-[#8A8264]">Date</p>
                  <p className="font-medium text-[#123423]">
                    {new Date(expense.expense_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="rounded-lg border border-[#D9CFA6] bg-white p-4">
                  <p className="text-sm text-[#8A8264]">Added On</p>
                  <p className="font-medium text-[#123423]">
                    {new Date(expense.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border border-[#D9CFA6] bg-white p-4">
                <p className="text-sm text-[#8A8264]">Description</p>
                <p className="font-medium text-[#123423]">
                  {expense.description || "No description provided."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-dashed border-[#C9BE8E] pt-5">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-[#C9BE8E] px-4 py-3 font-medium text-[#123423] hover:bg-[#F0ECD9]"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 rounded-lg bg-[#1B4B34] px-4 py-3 font-medium text-[#F5F1E4] hover:bg-[#153A29]"
                >
                  Edit Expense
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}