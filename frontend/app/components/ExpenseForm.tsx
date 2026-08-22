"use client";

import { useState, useEffect } from "react";

type Category = {
  id: number;
  name: string;
};

type PaymentMethod = {
  id: number;
  name: string;
};

type ExpenseFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  categories: Category[];
  paymentMethods: PaymentMethod[];
};

const inputClass =
  "w-full rounded-lg border border-[#D9CFA6] bg-white px-3 py-3 text-[#123423] placeholder:text-[#A79F7E] focus:border-[#1B4B34] focus:outline-none focus:ring-2 focus:ring-[#1B4B34]/20";
const labelClass = "mb-1 block text-sm font-medium text-[#4B4630]";

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  categories,
  paymentMethods,
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    user_id: 1,
    category_id: 0,
    payment_method_id: 0,
    title: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        user_id: initialData.user_id || 1,
        category_id: initialData.category_id || 0,
        payment_method_id: initialData.payment_method_id || 0,
        title: initialData.title || "",
        description: initialData.description || "",
        amount: initialData.amount || "",
        expense_date: initialData.expense_date
          ? new Date(initialData.expense_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: Number(formData.amount),
    };
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 overflow-hidden rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] shadow-sm"
    >
      <div className="border-b border-dashed border-[#C9BE8E] bg-[#123423] px-6 py-4">
        <h2
          className="text-lg font-semibold text-[#F5F1E4]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {initialData ? "Edit Expense" : "Add New Expense"}
        </h2>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Example: Grocery"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Amount</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[#7A9E85]">
              ₹
            </span>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="500"
              required
              min="0"
              step="0.01"
              className={`${inputClass} pl-7 font-mono`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
            required
            className={inputClass}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <select
            value={formData.payment_method_id}
            onChange={(e) =>
              setFormData({ ...formData, payment_method_id: Number(e.target.value) })
            }
            required
            className={inputClass}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What did you buy?"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Expense Date</label>
          <input
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 border-t border-dashed border-[#C9BE8E] px-6 py-4">
        <button
          type="submit"
          className="rounded-lg bg-[#1B4B34] px-6 py-3 font-medium text-[#F5F1E4] transition hover:bg-[#153A29] focus:outline-none focus:ring-2 focus:ring-[#B8862B]"
        >
          {initialData ? "Update Expense" : "Add Expense"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#C9BE8E] px-6 py-3 text-[#123423] transition hover:bg-[#F0ECD9]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

