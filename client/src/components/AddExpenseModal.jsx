import { useState } from 'react';
import {
  X,
  Receipt,
  Loader2,
  Sparkles,
  Utensils,
  Plane,
  Home,
  ShoppingBag,
  Film,
  Zap,
  Tag,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { createExpense } from '../services/expenseService';

const CATEGORIES = [
  { id: 'Food', label: 'Food', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Travel', label: 'Travel', icon: Plane, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'Stay', label: 'Stay', icon: Home, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'Groceries', label: 'Groceries', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Entertainment', label: 'Movies', icon: Film, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Utilities', label: 'Bills', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'General', label: 'Other', icon: Tag, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

function AddExpenseModalContent({
  onClose,
  groupId,
  members,
  onExpenseAdded,
}) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(() => members[0]?.id?.toString() || '');
  const [category, setCategory] = useState('Food');
  const [selectedMemberIds, setSelectedMemberIds] = useState(() =>
    members.map((m) => m.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) {
        setError('At least one member must be selected for the split.');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
    setError('');
  };

  const handleSelectAllToggle = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([Number(payerId || members[0]?.id)]);
    } else {
      setSelectedMemberIds(members.map((m) => m.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (selectedMemberIds.length === 0) {
      setError('Select at least one member to split the cost.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createExpense(groupId, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        payerId: Number(payerId || members[0]?.id),
        splitUserIds: selectedMemberIds,
      });

      onExpenseAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const perPersonShare =
    amount && selectedMemberIds.length > 0 && parseFloat(amount) > 0
      ? (parseFloat(amount) / selectedMemberIds.length).toFixed(2)
      : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm transition-all duration-200 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Log New Expense</h3>
              <p className="text-xs text-slate-500">Record a shared purchase and split</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold animate-pulse-subtle">
              {error}
            </div>
          )}

          {/* Description & Amount */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Seafood Dinner, Uber from airport, Villa stay"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-medium transition"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Paid By
                </label>
                <select
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-semibold transition"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category.toLowerCase() === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? `${cat.color} ring-2 ring-emerald-500/30 scale-105 shadow-xs`
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Member Split Selection */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Split With ({selectedMemberIds.length} of {members.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAllToggle}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                {selectedMemberIds.length === members.length ? 'Select only payer' : 'Select all'}
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              {members.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'bg-white border-emerald-300 shadow-xs'
                        : 'bg-white/60 border-slate-200/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                      <span className="font-semibold text-slate-800 text-xs">{member.name}</span>
                    </div>
                    {isSelected && amount > 0 && (
                      <span className="text-xs font-bold text-emerald-700">
                        ₹{perPersonShare}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Split Calculation Summary Card */}
          {parseFloat(amount) > 0 && selectedMemberIds.length > 0 && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="font-semibold">
                  Split between {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'person' : 'people'}
                </span>
              </div>
              <span className="font-extrabold text-sm text-emerald-800">
                ₹{perPersonShare} <span className="text-xs font-normal text-emerald-600">/ person</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Recording...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddExpenseModal(props) {
  if (!props.isOpen) return null;
  return <AddExpenseModalContent key={props.isOpen ? 'open' : 'closed'} {...props} />;
}
