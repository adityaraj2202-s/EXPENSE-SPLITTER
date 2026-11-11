import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Users,
  Receipt,
  Plus,
  Loader2,
  Scale,
  ArrowRight,
  HandCoins,
  CheckCircle2,
  Wallet,
  X,
  History,
} from 'lucide-react';
import { getGroupMembers } from '../services/groupService';
import { getExpenses } from '../services/expenseService';
import { getGroupBalances, getSettlementHistory } from '../services/balanceService';
import { getCategoryMeta } from '../utils/categoryIcons';
import AddMemberModal from '../components/AddMemberModal';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Floating speed dial state
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  // Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  // Settlement prefill state
  const [settleReceiverId, setSettleReceiverId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  // Current logged in user
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = storedUser.id || null;

  const fetchAllData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);

      const [memberData, expenseData, balanceData, historyData] = await Promise.all([
        getGroupMembers(groupId),
        getExpenses(groupId),
        getGroupBalances(groupId),
        getSettlementHistory(groupId).catch(() => ({ settlements: [] })),
      ]);

      setMembers(memberData.members || []);
      setExpenses(expenseData.expenses || []);
      setBalances(balanceData.balances || {});
      setSettlements(balanceData.settlements || []);
      setSettlementHistory(historyData.settlements || []);
    } catch (err) {
      setError(err.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getGroupMembers(groupId),
      getExpenses(groupId),
      getGroupBalances(groupId),
      getSettlementHistory(groupId).catch(() => ({ settlements: [] })),
    ])
      .then(([memberData, expenseData, balanceData, historyData]) => {
        if (!ignore) {
          setMembers(memberData.members || []);
          setExpenses(expenseData.expenses || []);
          setBalances(balanceData.balances || {});
          setSettlements(balanceData.settlements || []);
          setSettlementHistory(historyData.settlements || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load group details');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [groupId]);

  const handleMemberAdded = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    fetchAllData();
  };

  const handleExpenseAdded = () => {
    fetchAllData();
  };

  const handleSettled = () => {
    fetchAllData();
  };

  const openSettleWithPrefill = (receiverId, amount) => {
    setSettleReceiverId(receiverId);
    setSettleAmount(amount);
    setIsSettleModalOpen(true);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const userNetBalance =
    currentUserId && balances[currentUserId] !== undefined
      ? balances[currentUserId]
      : null;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-28 relative">
      {/* 1. Decorative Top Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 w-full" />

      {/* Floating Speed Dial Backdrop */}
      {isSpeedDialOpen && (
        <div
          onClick={() => setIsSpeedDialOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* 2. Top Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors w-fit group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>Add Member</span>
            </button>

            <button
              onClick={() => {
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleModalOpen(true);
              }}
              disabled={members.length < 2}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <HandCoins className="w-4 h-4 text-indigo-600" />
              <span>Settle Up</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              disabled={members.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 3. Hero Header & Metric Stats Grid */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header Title */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-600/20 shrink-0">
                #{groupId}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Group #{groupId}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Automated debt simplification & shared expense ledger
                </p>
              </div>
            </div>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
            {/* Stat 1: Total Group Spend */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Receipt className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Group Spend
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  ₹{totalSpent.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Stat 2: Your Net Balance */}
            <div className="p-5 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  userNetBalance === null || userNetBalance === 0
                    ? 'bg-slate-100 text-slate-600'
                    : userNetBalance > 0
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your Balance
                </p>
                <p
                  className={`text-2xl font-bold mt-0.5 ${
                    userNetBalance === null || userNetBalance === 0
                      ? 'text-slate-800'
                      : userNetBalance > 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {userNetBalance === null
                    ? '₹0.00'
                    : userNetBalance > 0
                    ? `+₹${userNetBalance.toFixed(2)}`
                    : userNetBalance < 0
                    ? `-₹${Math.abs(userNetBalance).toFixed(2)}`
                    : '₹0.00'}
                </p>
              </div>
            </div>

            {/* Stat 3: Suggested Transfers Needed */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transfers Needed
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {settlements.length}{' '}
                  <span className="text-xs font-medium text-slate-400 lowercase">
                    {settlements.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl shadow-sm">
            {error}
          </div>
        )}

        {/* 4. Suggested Settlements Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>Smart Debt Simplification</span>
            </h2>
            {settlements.length > 0 && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Greedy 2-Pointer Optimized
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Calculating optimal settlements...</span>
            </div>
          ) : settlements.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">All settled up! No outstanding balances in this group.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((item, idx) => {
                const payerId = item.from ?? item.fromUserId ?? item.fromId ?? item.payerId;
                const receiverId = item.to ?? item.toUserId ?? item.toId ?? item.receiverId;

                const fromMember = members.find((m) => m.id === Number(payerId));
                const toMember = members.find((m) => m.id === Number(receiverId));

                const payerName =
                  item.fromName || (fromMember ? fromMember.name : `User #${payerId}`);
                const receiverName =
                  item.toName || (toMember ? toMember.name : `User #${receiverId}`);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    {/* Visual Transfer Pathway */}
                    <div className="flex items-center gap-3">
                      {/* Payer Avatar Badge */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                          {payerName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {payerName}
                        </span>
                      </div>

                      {/* Directional Tag */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/80 rounded-full shadow-2xs">
                        <span className="text-[11px] font-medium text-slate-500">owes</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                      </div>

                      {/* Receiver Avatar Badge */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {receiverName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {receiverName}
                        </span>
                      </div>
                    </div>

                    {/* Amount & Settle Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                      <span className="font-bold text-slate-900 text-lg">
                        ₹{parseFloat(item.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => openSettleWithPrefill(receiverId, item.amount)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-all"
                      >
                        <HandCoins className="w-3.5 h-3.5" />
                        <span>Settle Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Members & Net Balances Grid */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Members & Net Balances ({members.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Current financial position per member</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm">Loading members...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {members.map((member) => {
                const net = balances[member.id] || 0;
                const isPositive = net > 0.001;
                const isNegative = net < -0.001;
                const isCurrentUser = currentUserId && Number(currentUserId) === Number(member.id);

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex flex-col justify-between gap-3 ${
                      isCurrentUser
                        ? 'bg-indigo-50/40 border-indigo-200/80 ring-1 ring-indigo-500/10'
                        : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    {/* Member Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            : isNegative
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {member.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-indigo-100 text-indigo-700">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{member.email}</p>
                      </div>
                    </div>

                    {/* Balance Status Footer */}
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled'}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isPositive
                            ? 'text-emerald-600'
                            : isNegative
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isPositive
                          ? `+₹${net.toFixed(2)}`
                          : isNegative
                          ? `-₹${Math.abs(net).toFixed(2)}`
                          : '₹0.00'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Expenses List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Recent Expenses ({expenses.length})</span>
            </h2>
            {expenses.length > 0 && (
              <span className="text-xs text-slate-400">Chronological transaction history</span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">No expenses recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Add an expense to start tracking group bills and fair splits.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const payer = members.find(
                  (m) => m.id === (expense.paid_by_id || expense.payerId)
                );
                const payerName = expense.payer_name || (payer ? payer.name : 'Member');

                let cat = expense.category;
                if (!cat || cat.toLowerCase() === 'general') {
                  const desc = (expense.description || '').toLowerCase();
                  if (
                    desc.includes('dinner') ||
                    desc.includes('lunch') ||
                    desc.includes('food') ||
                    desc.includes('beach')
                  ) {
                    cat = 'Food';
                  }
                }

                const meta = getCategoryMeta(cat);
                const formattedDate = expense.created_at
                  ? new Date(expense.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={expense.id}
                    className="p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}
                      >
                        {meta.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {expense.description}
                          </p>
                          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>
                            Paid by{' '}
                            <span className="font-medium text-slate-700">
                              {payerName}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 text-base">
                        ₹{parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Settlement History */}
        {settlementHistory.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <span>Settlement History ({settlementHistory.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Recorded payments log</span>
            </div>

            <div className="space-y-2.5">
              {settlementHistory.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-slate-900">{s.from_user_name}</span>
                    <span className="text-slate-400 text-xs">settled with</span>
                    <span className="font-semibold text-slate-900">{s.to_user_name}</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">
                    ₹{parseFloat(s.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* FLOATING ACTION SPEED DIAL BUTTON (FAB) */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Speed Dial Options Menu */}
        {isSpeedDialOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Action 1: Add Expense */}
            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setIsExpenseModalOpen(true);
              }}
              disabled={members.length === 0}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>Add Expense</span>
              <div className="p-1 rounded-full bg-white/20">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Action 2: Settle Up */}
            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleModalOpen(true);
              }}
              disabled={members.length < 2}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>Settle Up</span>
              <div className="p-1 rounded-full bg-white/20">
                <HandCoins className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Action 3: Add Member */}
            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setIsMemberModalOpen(true);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Add Member</span>
              <div className="p-1 rounded-full bg-white/20">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          aria-label="Quick Actions"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${
            isSpeedDialOpen
              ? 'bg-slate-800 rotate-90 shadow-slate-900/40'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 shadow-emerald-600/35 hover:shadow-emerald-600/50'
          }`}
        >
          {isSpeedDialOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        groupId={groupId}
        onMemberAdded={handleMemberAdded}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        groupId={groupId}
        members={members}
        onExpenseAdded={handleExpenseAdded}
      />

      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        groupId={groupId}
        members={members}
        defaultReceiverId={settleReceiverId}
        defaultAmount={settleAmount}
        onSettled={handleSettled}
      />
    </div>
  );
}
