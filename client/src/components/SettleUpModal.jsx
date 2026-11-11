import React, { useState, useEffect } from 'react';
import { X, HandCoins, Loader2, ArrowRight } from 'lucide-react';
import { settlePayment } from '../services/balanceService';

export default function SettleUpModal({
  isOpen,
  onClose,
  groupId,
  members,
  defaultReceiverId = '',
  defaultAmount = '',
  onSettled,
}) {
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultReceiverId) {
      setToUserId(defaultReceiverId.toString());
    } else if (members && members.length > 0) {
      setToUserId(members[0].id.toString());
    }
    if (defaultAmount) {
      setAmount(defaultAmount.toString());
    }
  }, [members, defaultReceiverId, defaultAmount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toUserId) {
      setError('Please select who you are paying.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid settlement amount.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await settlePayment(groupId, {
        toUserId: Number(toUserId),
        amount,
      });

      onSettled();
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error recording settlement');
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = members.find((m) => m.id === Number(toUserId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Record a Settlement</h3>
              <p className="text-xs text-slate-500">Pay a debt to balance the ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200/80 text-red-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Paying To
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-sm font-medium transition"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Settlement Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 font-semibold text-sm transition"
                autoFocus
              />
            </div>
          </div>

          {selectedMember && amount > 0 && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <span>Transfer summary</span>
              <span className="font-bold flex items-center gap-1">
                You <ArrowRight className="w-3 h-3 text-indigo-400" /> {selectedMember.name}: ₹{parseFloat(amount).toFixed(2)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-sm shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}