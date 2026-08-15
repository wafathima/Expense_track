"use client";

import { useState } from "react";

type Category = {
  id: number;
  name: string;
};

type PaymentMethod = {
  id: number;
  name: string;
};

type ExpenseFiltersProps = {
  onFilter: (filters: any) => void;
  onClear: () => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
};

const inputClass =
  "w-full rounded-lg border border-[#D9CFA6] bg-white px-3 py-3 text-[#123423] placeholder:text-[#A79F7E] focus:border-[#1B4B34] focus:outline-none focus:ring-2 focus:ring-[#1B4B34]/20";
const labelClass = "mb-1 block text-sm font-medium text-[#4B4630]";

export default function ExpenseFilters({
  onFilter,
  onClear,
  categories,
  paymentMethods,
}: ExpenseFiltersProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilter = () => {
    onFilter({ search, category, paymentMethod, startDate, endDate });
  };

  const handleClear = () => {
    setSearch("");
    setCategory("");
    setPaymentMethod("");
    setStartDate("");
    setEndDate("");
    onClear();
  };

  return (
    <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7A7358]">
        Search the Ledger
      </p>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className={labelClass}>Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={inputClass}
          >
            <option value="">All Methods</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3 border-t border-dashed border-[#C9BE8E] pt-4">
        <button
          onClick={handleFilter}
          className="rounded-lg bg-[#1B4B34] px-5 py-3 font-medium text-[#F5F1E4] transition hover:bg-[#153A29] focus:outline-none focus:ring-2 focus:ring-[#B8862B]"
        >
          Search 
        </button>
        <button
          onClick={handleClear}
          className="rounded-lg border border-[#C9BE8E] px-5 py-3 text-[#123423] transition hover:bg-[#F0ECD9]"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}