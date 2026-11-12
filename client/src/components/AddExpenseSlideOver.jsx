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
  { id: 'Food', label: 'Food', icon: Utensils, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'Travel', label: 'Travel', icon: Plane, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'Stay', label: 'Stay', icon: Home, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'Groceries', label: 'Groceries', icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'Entertainment', label: 'Movies', icon: Film, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'Utilities', label: 'Bills', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { id: 'General', label: 'Other', icon: Tag, color: 'text-slate-400 bg-slate-800/40 border-slate-700' },
];

function AddExpenseContent({
  onClose,
  groupId: fixedGroupId,
  groups = [],
  members: propMembers = [],
  onExpenseAdded,
}) {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = storedUser.id || null;

  const [selectedGroupId, setSelectedGroupId] = useState(
    () => fixedGroupId || (groups.length > 0 ? groups[0].id : '')
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [activeMembers, setActiveMembers] = useState(() => propMembers || []);
  const [payerId, setPayerId] = useState(() => {
    if (propMembers && propMembers.length > 0) {
      const match = propMembers.find((m) => Number(m.id) === Number(currentUserId));
      return match ? match.id.toString() : propMembers[0].id.toString();
    }
    return '';
  });
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
      fetch(`/api/groups/${selectedGroupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (!ignore) {
            const mList = d.members || [];
            setActiveMembers(mList);
            if (mList.length > 0) {
              const match = mList.find((m) => Number(m.id) === Number(currentUserId));
              setPayerId(match ? match.id.toString() : mList[0].id.toString());
              setSelectedMemberIds(mList.map((m) => m.id));
            }
          }
        })
        .catch(() => {});

      return () => {
        ignore = true;
      };
    }
  }, [selectedGroupId, fixedGroupId, currentUserId]);

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
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-semibold animate-pulse-subtle">
          {error}
        </div>
      )}

      {/* Group Selector if in Global Dashboard */}
      {!fixedGroupId && groups.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm font-semibold transition"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Description & Amount */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Description
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Beach shack dinner, Groceries, Flight tickets"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm font-medium transition"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
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
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white font-extrabold text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Paid By
            </label>
            <select
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm font-semibold transition"
            >
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name} {Number(m.id) === Number(currentUserId) ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
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
                    ? `${cat.color} ring-2 ring-indigo-500/50 scale-105 shadow-xs font-bold`
                    : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
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
      <div className="pt-2 border-t border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Split With ({selectedMemberIds.length} of {activeMembers.length})
          </label>
          <button
            type="button"
            onClick={handleSelectAllToggle}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            {selectedMemberIds.length === activeMembers.length ? 'Payer only' : 'Select all'}
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
          {activeMembers.map((member) => {
            const isSelected = selectedMemberIds.includes(member.id);
            return (
              <div
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-white shadow-xs'
                    : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="font-semibold text-xs">{member.name}</span>
                </div>
                {isSelected && amount > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
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
        <div className="p-3.5 bg-gradient-to-r from-indigo-950/60 to-emerald-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs text-indigo-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="font-medium">
              Split equally among {selectedMemberIds.length} members
            </span>
          </div>
          <span className="font-extrabold text-sm text-emerald-400">
            ₹{perPersonShare} <span className="text-xs font-normal text-slate-400">/ person</span>
          </span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-3 border-t border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
