"use client";

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

type ExpenseCardProps = {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onClick: (id: number) => void;
};

export default function ExpenseCard({ expense, onEdit, onDelete, onClick }: ExpenseCardProps) {
  return (
    <div
      className="group flex cursor-pointer flex-col gap-4 border-l-4 border-transparent p-6 transition-colors hover:border-[#B8862B] hover:bg-[#F5F1E0] md:flex-row md:items-center md:justify-between"
      onClick={() => onClick(expense.id)}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-[#123423]">{expense.title}</h3>
        <p className="text-sm text-[#8A8264]">{expense.description || "No description"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-dashed border-[#1B4B34]/50 bg-[#DCEEE1] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#1B4B34]">
            {expense.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#F0ECD9] px-3 py-1 text-xs font-medium text-[#6B6547]">
            {expense.payment_method}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#1B4B34]/10 px-3 py-1 font-mono text-xs font-semibold text-[#1B4B34]">
            ₹{Number(expense.amount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-[#8A8264]">
            {new Date(expense.expense_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#8A8264]">by {expense.user_name}</p>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          
          <button
            onClick={() => onDelete(expense.id)}
            className="rounded-lg bg-[#A83A32] px-3 py-2 text-sm text-[#F5F1E4] transition hover:bg-[#8C2F29]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}