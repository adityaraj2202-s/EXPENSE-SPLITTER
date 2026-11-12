import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SplitwiseShell from '../components/SplitwiseShell';
import {
  ArrowLeft,
  UserPlus,
  UserMinus,
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
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  Shield,
} from 'lucide-react';
import { getGroupMembers, removeGroupMember } from '../services/groupService';
import { getExpenses } from '../services/expenseService';
import { getGroupBalances, getSettlementHistory } from '../services/balanceService';
import { getCategoryMeta } from '../utils/categoryIcons';
import AddMemberSlideOver from '../components/AddMemberSlideOver';
import AddExpenseSlideOver from '../components/AddExpenseSlideOver';
import SettleUpSlideOver from '../components/SettleUpSlideOver';
import ExpenseDetailSlideOver from '../components/ExpenseDetailSlideOver';

const CATEGORY_FILTERS = [
  'All',
  'Food',
  'Travel',
  'Stay',
  'Groceries',
  'Entertainment',
  'Utilities',
  'General',
];

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupCreatedById, setGroupCreatedById] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // UI filters & expanded state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  // Floating speed dial state
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  // Slide-Over Drawers State
  const [isMemberDrawerOpen, setIsMemberDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [isSettleDrawerOpen, setIsSettleDrawerOpen] = useState(false);
  const [selectedExpenseForDrawer, setSelectedExpenseForDrawer] = useState(null);

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
      setGroupName(memberData.groupName || `Group #${groupId}`);
      setGroupCreatedById(memberData.createdById || null);
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
          setGroupName(memberData.groupName || `Group #${groupId}`);
          setGroupCreatedById(memberData.createdById || null);
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
    setSuccessToast(`${newMember.name} joined the group!`);
    setTimeout(() => setSuccessToast(''), 3500);
    fetchAllData();
  };

  const handleRemoveMember = async (memberToRemove) => {
    const isCreator = groupCreatedById && Number(memberToRemove.id) === Number(groupCreatedById);
    if (isCreator) {
      alert('The group creator cannot be removed from the group.');
      return;
    }

    const memberBalance = balances[memberToRemove.id] || 0;
    let confirmMsg = `Are you sure you want to remove "${memberToRemove.name}" from this group?`;
    if (Math.abs(memberBalance) > 0.01) {
      confirmMsg += `\n\nNotice: This member currently has an unsettled balance of ₹${Math.abs(memberBalance).toFixed(2)}.`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      await removeGroupMember(groupId, memberToRemove.id);
      setSuccessToast(`${memberToRemove.name} was removed from the group.`);
      setTimeout(() => setSuccessToast(''), 3500);
      fetchAllData();
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleExpenseAdded = () => {
    setSuccessToast('New expense recorded and split successfully!');
    setTimeout(() => setSuccessToast(''), 3500);
    fetchAllData();
  };

  const handleSettled = () => {
    setSuccessToast('Payment settled and recorded!');
    setTimeout(() => setSuccessToast(''), 3500);
    fetchAllData();
  };

  const openSettleWithPrefill = (receiverId, amount) => {
    setSettleReceiverId(receiverId);
    setSettleAmount(amount);
    setIsSettleDrawerOpen(true);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const averageSpendPerPerson =
    members.length > 0 ? (totalSpent / members.length).toFixed(2) : '0.00';

  const userNetBalance =
    currentUserId && balances[currentUserId] !== undefined
      ? balances[currentUserId]
      : null;

  // Filtered expenses based on search & category
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.paid_by_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const rawCat = (exp.category || 'General').toLowerCase();
      const desc = (exp.description || '').toLowerCase();
      let effectiveCat = rawCat;
      if (rawCat === 'general') {
        if (
          desc.includes('dinner') ||
          desc.includes('lunch') ||
          desc.includes('food') ||
          desc.includes('beach') ||
          desc.includes('snack') ||
          desc.includes('breakfast') ||
          desc.includes('restaurant') ||
          desc.includes('cafe') ||
          desc.includes('pizza') ||
          desc.includes('burger')
        ) {
          effectiveCat = 'food';
        } else if (desc.includes('uber') || desc.includes('taxi') || desc.includes('bus') || desc.includes('flight') || desc.includes('train')) {
          effectiveCat = 'travel';
        } else if (desc.includes('hotel') || desc.includes('airbnb') || desc.includes('stay') || desc.includes('room')) {
          effectiveCat = 'stay';
        } else if (desc.includes('grocery') || desc.includes('groceries') || desc.includes('mart') || desc.includes('supermarket')) {
          effectiveCat = 'groceries';
        } else if (desc.includes('movie') || desc.includes('concert') || desc.includes('show') || desc.includes('game')) {
          effectiveCat = 'entertainment';
        } else if (desc.includes('electric') || desc.includes('water') || desc.includes('internet') || desc.includes('wifi') || desc.includes('bill')) {
          effectiveCat = 'utilities';
        }
      }

      const matchesCat =
        selectedCategory === 'All' ||
        effectiveCat === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  return (
    <SplitwiseShell
      currentGroupId={groupId}
      currentGroupMembers={members}
      onDataRefresh={fetchAllData}
    >
      <div className="space-y-6">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-300 transition-colors w-fit group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>All Groups & Overview</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsMemberDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 border border-slate-700 hover:border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Add Member</span>
            </button>

            <button
              onClick={() => {
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleDrawerOpen(true);
              }}
              disabled={members.length < 2}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 border border-slate-700 hover:border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-40"
            >
              <HandCoins className="w-4 h-4 text-emerald-400" />
              <span>Settle Up</span>
            </button>

            <button
              onClick={() => setIsExpenseDrawerOpen(true)}
              disabled={members.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-2xl font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Hero Header & Metric Stats Grid */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {/* Header Title */}
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20 shrink-0">
                {groupName ? groupName[0].toUpperCase() : `#${groupId}`}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    {groupName || `Group #${groupId}`}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Automated debt simplification & shared expense ledger • Group #{groupId}
                </p>
              </div>
            </div>

            {/* Member Avatars Stack */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                {members.slice(0, 6).map((m, i) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 bg-slate-800 text-indigo-300 font-bold text-xs flex items-center justify-center shadow-md border border-slate-700"
                    style={{ zIndex: 10 - i }}
                  >
                    {m.name ? m.name[0].toUpperCase() : 'U'}
                  </div>
                ))}
              </div>
              {members.length > 6 && (
                <span className="text-xs font-bold text-slate-400">
                  +{members.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* 3 Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/40">
            {/* Stat 1: Total Group Spend */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Group Spend
                </p>
                <p className="text-2xl font-black text-white mt-0.5">
                  ₹{totalSpent.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Avg: ₹{averageSpendPerPerson} / member
                </p>
              </div>
            </div>

            {/* Stat 2: Your Net Balance */}
            <div className="p-5 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  userNetBalance === null || userNetBalance === 0
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : userNetBalance > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Balance
                </p>
                <p
                  className={`text-2xl font-black mt-0.5 ${
                    userNetBalance === null || userNetBalance === 0
                      ? 'text-slate-300'
                      : userNetBalance > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
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
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {userNetBalance === null || userNetBalance === 0
                    ? 'All settled up'
                    : userNetBalance > 0
                    ? 'You are owed by this group'
                    : 'You owe money in this group'}
                </p>
              </div>
            </div>

            {/* Stat 3: Suggested Transfers Needed */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transfers Needed
                </p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {settlements.length}{' '}
                  <span className="text-xs font-medium text-slate-400 lowercase">
                    {settlements.length === 1 ? 'transfer' : 'transfers'}
                  </span>
                </p>
                <p className="text-[11px] text-sky-400 font-bold mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Minimized payments
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-2xl shadow-sm">
            {error}
          </div>
        )}

        {/* Suggested Settlements Section */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>Smart Debt Simplification</span>
            </h2>
            {settlements.length > 0 && (
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Greedy 2-Pointer Optimized
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm font-medium">Calculating optimal settlements...</span>
            </div>
          ) : settlements.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold">All settled up! No outstanding balances in this group.</span>
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

                const isCurrentUserPayer = currentUserId && Number(currentUserId) === Number(payerId);
                const isCurrentUserReceiver = currentUserId && Number(currentUserId) === Number(receiverId);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all border ${
                      isCurrentUserPayer
                        ? 'bg-rose-500/10 border-rose-500/30 shadow-xs'
                        : isCurrentUserReceiver
                        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-xs'
                        : 'bg-slate-950/60 hover:bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                          {payerName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-bold text-white text-sm">
                          {payerName} {isCurrentUserPayer && <span className="text-rose-400 text-xs font-black">(You)</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-full shadow-xs">
                        <span className="text-[11px] font-medium text-slate-400">pays</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                          {receiverName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-bold text-white text-sm">
                          {receiverName} {isCurrentUserReceiver && <span className="text-emerald-400 text-xs font-black">(You)</span>}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <span className="font-black text-white text-lg">
                        ₹{parseFloat(item.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => openSettleWithPrefill(receiverId, item.amount)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
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

        {/* Members & Net Balances Grid with Remove Member Feature */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Members & Net Positions ({members.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Current financial position per member</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm font-medium">Loading members...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {members.map((member) => {
                const net = balances[member.id] || 0;
                const isPositive = net > 0.001;
                const isNegative = net < -0.001;
                const isCurrentUser = currentUserId && Number(currentUserId) === Number(member.id);
                const isCreator = groupCreatedById && Number(member.id) === Number(groupCreatedById);

                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between gap-3 ${
                      isCurrentUser
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isPositive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : isNegative
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {member.name ? member.name[0].toUpperCase() : 'U'}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-bold text-white truncate">
                              {member.name}
                            </p>
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                                You
                              </span>
                            )}
                            {isCreator && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                <Shield className="w-2.5 h-2.5" /> Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{member.email}</p>
                        </div>
                      </div>

                      {/* Remove Member Button */}
                      {!isCreator && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
                          title={`Remove ${member.name} from group`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled'}
                      </span>
                      <span
                        className={`text-sm font-black ${
                          isPositive
                            ? 'text-emerald-400'
                            : isNegative
                            ? 'text-rose-400'
                            : 'text-slate-500'
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

        {/* Expenses List with Search, Filters & Sliding Drawer Details */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <span>Expense Ledger ({filteredExpenses.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any expense to slide open full receipt breakdown
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search expense or payer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 pr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
            </span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-black shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950/50 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm font-medium">Loading expenses...</span>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-300 font-bold text-sm">
                {searchQuery || selectedCategory !== 'All' ? 'No matching expenses' : 'No expenses recorded yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try clearing your search query or category filter.'
                  : 'Add an expense to start tracking group bills and fair splits.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => {
                const payer = members.find(
                  (m) => m.id === (expense.paid_by_id || expense.payerId)
                );
                const payerName = expense.paid_by_name || expense.payer_name || (payer ? payer.name : 'Member');

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

                const isExpanded = expandedExpenseId === expense.id;

                return (
                  <div
                    key={expense.id}
                    className="border border-slate-800 rounded-2xl overflow-hidden transition-all bg-slate-950/50 hover:border-slate-700 shadow-sm"
                  >
                    <div
                      onClick={() => setSelectedExpenseForDrawer(expense)}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${meta.bg}`}
                        >
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-white text-sm truncate">
                              {expense.description}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shrink-0">
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <span>
                              Paid by{' '}
                              <span className="font-bold text-indigo-300">
                                {payerName}
                              </span>
                            </span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="font-black text-white text-base">
                            ₹{parseFloat(expense.amount).toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedExpenseId(isExpanded ? null : expense.id);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && expense.splits && expense.splits.length > 0 && (
                      <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
                        <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                          Split Breakdown ({expense.splits.length} members)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {expense.splits.map((s, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-300 truncate">
                                {s.user_name}
                              </span>
                              <span className="font-bold text-white ml-1">
                                ₹{parseFloat(s.share_amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlement History */}
        {settlementHistory.length > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <span>Verified Settlement History ({settlementHistory.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Recorded payments ledger</span>
            </div>

            <div className="space-y-2.5">
              {settlementHistory.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white">{s.from_user_name}</span>
                    <span className="text-slate-400 text-xs">settled with</span>
                    <span className="font-bold text-white">{s.to_user_name}</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">
                    ₹{parseFloat(s.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Speed Dial Trigger */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {isSpeedDialOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setIsExpenseDrawerOpen(true);
              }}
              disabled={members.length === 0}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <span>Add Expense</span>
              <div className="p-1 rounded-full bg-white/20">
                <Receipt className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleDrawerOpen(true);
              }}
              disabled={members.length < 2}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <span>Settle Up</span>
              <div className="p-1 rounded-full bg-emerald-500/20">
                <HandCoins className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsSpeedDialOpen(false);
                setIsMemberDrawerOpen(true);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-indigo-300 font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span>Add Member</span>
              <div className="p-1 rounded-full bg-indigo-500/20">
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          aria-label="Quick Actions"
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${
            isSpeedDialOpen
              ? 'bg-slate-800 text-white rotate-90 shadow-slate-900/40 border border-slate-700'
              : 'bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-500 shadow-indigo-500/30'
          }`}
        >
          {isSpeedDialOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 stroke-[3]" />}
        </button>
      </div>

      {/* Sliding Drawers */}
      <AddMemberSlideOver
        isOpen={isMemberDrawerOpen}
        onClose={() => setIsMemberDrawerOpen(false)}
        groupId={groupId}
        onMemberAdded={handleMemberAdded}
      />

      <AddExpenseSlideOver
        isOpen={isExpenseDrawerOpen}
        onClose={() => setIsExpenseDrawerOpen(false)}
        groupId={groupId}
        members={members}
        onExpenseAdded={handleExpenseAdded}
      />

      <SettleUpSlideOver
        isOpen={isSettleDrawerOpen}
        onClose={() => setIsSettleDrawerOpen(false)}
        groupId={groupId}
        members={members}
        defaultReceiverId={settleReceiverId}
        defaultAmount={settleAmount}
        onSettled={handleSettled}
      />

      <ExpenseDetailSlideOver
        isOpen={Boolean(selectedExpenseForDrawer)}
        onClose={() => setSelectedExpenseForDrawer(null)}
        expense={selectedExpenseForDrawer}
        currentUserId={currentUserId}
        onSettleClick={(receiverId, amount) => {
          setSelectedExpenseForDrawer(null);
          setSettleReceiverId(receiverId);
          setSettleAmount(amount);
          setIsSettleDrawerOpen(true);
        }}
      />
    </SplitwiseShell>
  );
}
