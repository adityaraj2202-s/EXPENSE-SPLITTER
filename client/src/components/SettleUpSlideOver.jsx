import { useState, useEffect } from 'react';
import SlideOverDrawer from './SlideOverDrawer';
import {
  HandCoins,
  Loader2,
  ArrowRight,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import { settlePayment } from '../services/balanceService';

function SettleUpContent({
  onClose,
  groupId: fixedGroupId,
  groups = [],
  members: propMembers = [],
  defaultReceiverId = '',
  defaultAmount = '',
  onSettled,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(
    () => fixedGroupId || (groups.length > 0 ? groups[0].id : '')
  );
  const [activeMembers, setActiveMembers] = useState(() => propMembers || []);
  const [toUserId, setToUserId] = useState(
    () => defaultReceiverId?.toString() || (propMembers[0]?.id ? propMembers[0].id.toString() : '')
  );
  const [amount, setAmount] = useState(() => (defaultAmount ? defaultAmount.toString() : ''));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch members dynamically if group was chosen from a list
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
            if (mList.length > 0 && !toUserId) {
              setToUserId(mList[0].id.toString());
            }
          }
        })
        .catch(() => {});

      return () => {
        ignore = true;
      };
    }
  }, [selectedGroupId, fixedGroupId, toUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetGroupId = fixedGroupId || selectedGroupId;
    if (!targetGroupId) {
      setError('Please select an expense group.');
      return;
    }
    if (!toUserId) {
      setError('Please select who you are paying.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid settlement amount.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await settlePayment(targetGroupId, {
        toUserId: Number(toUserId),
        amount: parsedAmount,
      });

      if (onSettled) onSettled();
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error recording settlement');
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = activeMembers.find((m) => m.id === Number(toUserId));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold animate-pulse-subtle">
          {error}
        </div>
      )}

      {/* Group Selector if global */}
      {!fixedGroupId && groups.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Expense Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-semibold transition"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recipient Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Paying To
        </label>
        <select
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-semibold transition"
        >
          {activeMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-extrabold text-sm transition"
            autoFocus
          />
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'UPI', label: 'UPI / GPay', icon: Smartphone },
            { id: 'Cash', label: 'Cash', icon: Banknote },
            { id: 'Bank', label: 'Bank', icon: CreditCard },
          ].map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Payment Flow Card */}
      {selectedMember && parseFloat(amount) > 0 && (
        <div className="p-4 bg-gradient-to-tr from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-2xl text-xs space-y-2 text-indigo-950 shadow-xs">
          <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
            Transfer Overview
          </p>
          <div className="flex items-center justify-between font-bold">
            <span>You</span>
            <div className="flex items-center gap-1 text-indigo-600">
              <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                ₹{parseFloat(amount).toFixed(2)}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-emerald-700">{selectedMember.name}</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100">
            Paid via {paymentMethod} • Balances will be updated instantly
          </p>
        </div>
      )}

      {/* Submit Action */}
      <div className="pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording Payment...</span>
            </>
          ) : (
            <span>Record Settlement</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function SettleUpSlideOver(props) {
  return (
    <SlideOverDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Settle Up"
      subtitle="Record a payment to balance debts"
      icon={HandCoins}
      iconBg="bg-gradient-to-tr from-indigo-600 to-blue-600 text-white"
    >
      {props.isOpen && (
        <SettleUpContent
          key={`${props.groupId || 'global'}-${props.defaultReceiverId}-${props.defaultAmount}`}
          {...props}
        />
      )}
    </SlideOverDrawer>
  );
}
