import { useState, useEffect } from 'react';
import SlideOverDrawer from './SlideOverDrawer';
import {
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

function AddExpenseContent({
  onClose,
  groupId: fixedGroupId,
  groups = [],
  members: propMembers = [],
  onExpenseAdded,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(
    () => fixedGroupId || (groups.length > 0 ? groups[0].id : '')
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [activeMembers, setActiveMembers] = useState(() => propMembers || []);
  const [payerId, setPayerId] = useState(() =>
    propMembers && propMembers.length > 0 ? propMembers[0].id.toString() : ''
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState(() =>
    (propMembers || []).map((m) => m.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch group members if not pre-provided
  useEffect(() => {
    if (!fixedGroupId && selectedGroupId) {
      let ignore = false;
      const token = localStorage.getItem('token');
      fetch(`http://localhost:5001/api/groups/${selectedGroupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (!ignore) {
            const mList = d.members || [];
            setActiveMembers(mList);
            if (mList.length > 0) {
              setPayerId(mList[0].id.toString());
              setSelectedMemberIds(mList.map((m) => m.id));
            }
          }
        })
        .catch(() => {});

      return () => {
        ignore = true;
      };
    }
  }, [selectedGroupId, fixedGroupId]);

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
    if (selectedMemberIds.length === activeMembers.length) {
      setSelectedMemberIds([Number(payerId || activeMembers[0]?.id)]);
    } else {
      setSelectedMemberIds(activeMembers.map((m) => m.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetGroupId = fixedGroupId || selectedGroupId;
    if (!targetGroupId) {
      setError('Please select an expense group.');
      return;
    }
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

      await createExpense(targetGroupId, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        payerId: Number(payerId || activeMembers[0]?.id),
        splitUserIds: selectedMemberIds,
      });

      if (onExpenseAdded) onExpenseAdded();
      setDescription('');
      setAmount('');
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold animate-pulse-subtle">
          {error}
        </div>
      )}

      {/* Group Selector if in Global Dashboard */}
      {!fixedGroupId && groups.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-semibold transition"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description & Amount */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Dinner with friends, Groceries, Flight tickets"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-medium transition"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Total Amount
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
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-extrabold text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Paid By
            </label>
            <select
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-semibold transition"
            >
              {activeMembers.map((m) => (
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
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Split With ({selectedMemberIds.length} of {activeMembers.length})
          </label>
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            {selectedMemberIds.length === activeMembers.length ? 'Payer only' : 'Select all'}
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
          {activeMembers.map((member) => {
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

      {/* Live Split Calculation Card */}
      {parseFloat(amount) > 0 && selectedMemberIds.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-semibold">
              Split equally among {selectedMemberIds.length} members
            </span>
          </div>
          <span className="font-extrabold text-sm text-emerald-800">
            ₹{perPersonShare} <span className="text-xs font-normal text-emerald-600">/ person</span>
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording Expense...</span>
            </>
          ) : (
            <span>Save & Split Expense</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function AddExpenseSlideOver(props) {
  return (
    <SlideOverDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Add an Expense"
      subtitle="Splitwise-style equal & custom splitting"
      icon={Receipt}
      iconBg="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white"
    >
      {props.isOpen && (
        <AddExpenseContent
          key={`${props.groupId || 'global'}-${props.members?.length || 0}`}
          {...props}
        />
      )}
    </SlideOverDrawer>
  );
}
