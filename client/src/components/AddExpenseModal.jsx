import React, { useState, useEffect } from 'react';
import { X, Receipt, Loader2, CheckSquare, Square } from 'lucide-react';
import { createExpense } from '../services/expenseService';

export default function AddExpenseModal({ isOpen, onClose, groupId, members, onExpenseAdded }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default payer to first member and select all members for the split
  useEffect(() => {
    if (members && members.length > 0) {
      setPayerId(members[0].id.toString());
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [members, isOpen]);

  if (!isOpen) return null;

  const toggleMemberSelection = (id) => {
    if (selectedMembers.includes(id)) {
      if (selectedMembers.length === 1) {
        setError('At least one member must share the split.');
        return;
      }
      setSelectedMembers(selectedMembers.filter((mId) => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
    setError('');
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([Number(payerId)]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (selectedMembers.length === 0) {
      setError('Select at least one member to split the cost with.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await createExpense(groupId, {
        description: description.trim(),
        amount,
        payerId: Number(payerId),
        splitUserIds: selectedMembers,
      });

      onExpenseAdded(data.expense);
      setDescription('');
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error recording expense');
    } finally {
      setLoading(false);
    }
  };

  const splitPerPerson = amount && selectedMembers.length > 0
    ? (parseFloat(amount) / selectedMembers.length).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Add an Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner, Uber, Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount (₹ / $)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Paid By
              </label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm bg-white"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Split Between Selection */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700">
                Split Equally Between ({selectedMembers.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-100 rounded-xl p-2 bg-slate-50">
              {members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMemberSelection(member.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:border-slate-300 transition text-sm select-none"
                  >
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                      <span className="font-medium text-slate-700">{member.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-slate-400 font-mono">
                        ≈ {splitPerPerson}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Adding...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}