import { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GroupDetails from './pages/GroupDetails';
import SplitwiseShell from './components/SplitwiseShell';
import {
  Users,
  ChevronRight,
  Loader2,
  Receipt,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { getDashboardSummary } from './services/groupService';
import ExpenseDetailSlideOver from './components/ExpenseDetailSlideOver';
import SettleUpSlideOver from './components/SettleUpSlideOver';

function ExpenseSplitterDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    groups: [],
    totals: { totalNetBalance: 0, totalYouAreOwed: 0, totalYouOwe: 0 },
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'activity' | 'groups'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected expense for slide-over drawer
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Settle up slide-over state
  const [settleDrawerOpen, setSettleDrawerOpen] = useState(false);
  const [settleGroupId, setSettleGroupId] = useState('');
  const [settleReceiverId, setSettleReceiverId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const loadData = useCallback(() => {
    setLoading(true);
    getDashboardSummary()
      .then((summary) => {
        setData(summary);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    getDashboardSummary()
      .then((summary) => {
        if (!ignore) {
          setData(summary);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load dashboard data');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredGroups = useMemo(() => {
    return (data.groups || []).filter((g) =>
      (g.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data.groups, searchQuery]);

  const groupsYouOwe = useMemo(() => {
    return (data.groups || []).filter((g) => (g.userNetBalance || 0) < -0.009);
  }, [data.groups]);

  const groupsYouAreOwed = useMemo(() => {
    return (data.groups || []).filter((g) => (g.userNetBalance || 0) > 0.009);
  }, [data.groups]);

  const { totals } = data;
  const isNetPositive = totals.totalNetBalance > 0.009;
  const isNetNegative = totals.totalNetBalance < -0.009;

  return (
    <SplitwiseShell onDataRefresh={loadData}>
      <div className="space-y-6">

        {/* ========================================================= */}
        {/* 1. THREE-WAY BALANCE BANNER (YELLOW THEME) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-amber-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Expense Overview
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Consolidated balance breakdown across all your shared groups
              </p>
            </div>

            {/* Quick Filter Switcher with Yellow Accent */}
            <div className="flex items-center gap-1.5 p-1 bg-amber-50 border border-amber-200/60 rounded-2xl text-xs font-bold shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balances
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'activity'
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'groups'
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Groups ({data.groups.length})
              </button>
            </div>
          </div>

          {/* 3 Metrics: Total Balance, You Owe, You are Owed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-100 bg-amber-50/20">
            {/* Total Balance */}
            <div className="p-5 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isNetPositive
                    ? 'bg-amber-100 text-amber-800'
                    : isNetNegative
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Balance
                </p>
                <p
                  className={`text-2xl font-black mt-0.5 ${
                    isNetPositive
                      ? 'text-amber-600'
                      : isNetNegative
                      ? 'text-rose-600'
                      : 'text-slate-700'
                  }`}
                >
                  {isNetPositive
                    ? `+₹${totals.totalNetBalance.toFixed(2)}`
                    : isNetNegative
                    ? `-₹${Math.abs(totals.totalNetBalance).toFixed(2)}`
                    : '₹0.00'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isNetPositive
                    ? 'Overall you are owed'
                    : isNetNegative
                    ? 'Overall you owe'
                    : 'All settled up'}
                </p>
              </div>
            </div>

            {/* You Owe */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  You Owe
                </p>
                <p className="text-2xl font-black text-rose-600 mt-0.5">
                  ₹{totals.totalYouOwe.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {groupsYouOwe.length} {groupsYouOwe.length === 1 ? 'group debt' : 'group debts'}
                </p>
              </div>
            </div>

            {/* You Are Owed */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  You Are Owed
                </p>
                <p className="text-2xl font-black text-amber-600 mt-0.5">
                  ₹{totals.totalYouAreOwed.toFixed(2)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  From {groupsYouAreOwed.length} {groupsYouAreOwed.length === 1 ? 'group' : 'groups'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl font-medium">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            <span className="text-sm font-semibold">Updating balances...</span>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TAB 1: DUAL COLUMN BREAKDOWN (YOU OWE / OWED) */}
            {/* ========================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {groupsYouOwe.length === 0 && groupsYouAreOwed.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-amber-200/80 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        You are all settled up!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                        No outstanding balances in any group. When someone adds a new expense, it will show up here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: YOU OWE */}
                    <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                          <span>You Owe ({groupsYouOwe.length})</span>
                        </h3>
                        <span className="text-xs font-black text-rose-600">
                          ₹{totals.totalYouOwe.toFixed(2)}
                        </span>
                      </div>

                      {groupsYouOwe.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          You do not owe anything right now! 🎉
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {groupsYouOwe.map((g) => (
                            <div
                              key={g.id}
                              className="p-3.5 bg-rose-50/40 border border-rose-100 rounded-2xl flex items-center justify-between gap-3 transition-all hover:bg-rose-50/70"
                            >
                              <div
                                onClick={() => navigate(`/groups/${g.id}`)}
                                className="cursor-pointer min-w-0"
                              >
                                <h4 className="font-bold text-slate-900 text-sm truncate hover:text-amber-600">
                                  {g.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {g.member_count || 1} members
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-black text-rose-600 text-base">
                                  ₹{Math.abs(g.userNetBalance).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => {
                                    setSettleGroupId(g.id);
                                    setSettleAmount(Math.abs(g.userNetBalance));
                                    setSettleDrawerOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all"
                                >
                                  Settle
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: YOU ARE OWED */}
                    <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <span>You Are Owed ({groupsYouAreOwed.length})</span>
                        </h3>
                        <span className="text-xs font-black text-amber-600">
                          ₹{totals.totalYouAreOwed.toFixed(2)}
                        </span>
                      </div>

                      {groupsYouAreOwed.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          Nobody owes you money in your groups right now.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {groupsYouAreOwed.map((g) => (
                            <div
                              key={g.id}
                              onClick={() => navigate(`/groups/${g.id}`)}
                              className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-amber-100/60"
                            >
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm truncate hover:text-amber-700">
                                  {g.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {g.member_count || 1} members
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-black text-amber-600 text-base">
                                  +₹{g.userNetBalance.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: RECENT ACTIVITY TIMELINE */}
            {/* ========================================================= */}
            {activeTab === 'activity' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>Live Activity Stream</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Latest {data.activities.length} transactions across your groups
                  </span>
                </div>

                {data.activities.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-1">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No activity logged yet</p>
                    <p className="text-xs">Add an expense or settle a payment to see updates.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.activities.map((item, idx) => {
                      const isSettlement = item.type === 'settlement';
                      const formattedDate = item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent';

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isSettlement) {
                              setSelectedExpense(item);
                            }
                          }}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                            isSettlement
                              ? 'bg-amber-50/40 border-amber-200/60'
                              : 'bg-white hover:bg-amber-50/50 border-amber-200/70 shadow-2xs cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                isSettlement
                                  ? 'bg-amber-200/80 text-amber-950'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isSettlement ? (
                                <CheckCircle2 className="w-5 h-5 text-amber-700" />
                              ) : (
                                <Receipt className="w-5 h-5 text-amber-700" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {isSettlement ? (
                                  <span>
                                    <strong>{item.actor_name}</strong> settled with{' '}
                                    <strong>{item.receiver_name}</strong>
                                  </span>
                                ) : (
                                  <span>
                                    <strong>{item.actor_name}</strong> added &quot;
                                    {item.description}&quot;
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span className="font-semibold text-amber-700">
                                  {item.group_name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formattedDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-sm sm:text-base font-black ${
                                isSettlement ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              ₹{parseFloat(item.amount).toFixed(2)}
                            </span>
                            {!isSettlement && (
                              <p className="text-[10px] text-slate-400">Click for split</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: ALL GROUPS GRID WITH SEARCH */}
            {/* ========================================================= */}
            {activeTab === 'groups' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter groups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-amber-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition shadow-2xs"
                    />
                  </div>
                </div>

                {filteredGroups.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-amber-200/80">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No groups found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGroups.map((group) => {
                      const net = group.userNetBalance || 0;
                      const isPositive = net > 0.009;
                      const isNegative = net < -0.009;

                      return (
                        <div
                          key={group.id}
                          onClick={() => navigate(`/groups/${group.id}`)}
                          className="bg-white p-5 rounded-3xl border border-amber-200/80 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
                              {group.name ? group.name[0].toUpperCase() : 'G'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-amber-600 transition">
                                {group.name}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                #{group.id} • {group.member_count || 1} members
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-2">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400">
                                {isPositive ? 'You get' : isNegative ? 'You owe' : 'Status'}
                              </p>
                              <span
                                className={`text-sm font-extrabold ${
                                  isPositive
                                    ? 'text-amber-600'
                                    : isNegative
                                    ? 'text-rose-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {isPositive
                                  ? `+₹${net.toFixed(2)}`
                                  : isNegative
                                  ? `-₹${Math.abs(net).toFixed(2)}`
                                  : 'Settled'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* Settle Up Slide-Over from Dashboard */}
      <SettleUpSlideOver
        isOpen={settleDrawerOpen}
        onClose={() => setSettleDrawerOpen(false)}
        groupId={settleGroupId}
        groups={data.groups}
        defaultReceiverId={settleReceiverId}
        defaultAmount={settleAmount}
        onSettled={loadData}
      />

      {/* Sliding Expense Details Drawer */}
      <ExpenseDetailSlideOver
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        onSettleClick={(receiverId, amount) => {
          setSelectedExpense(null);
          setSettleReceiverId(receiverId);
          setSettleAmount(amount);
          setSettleDrawerOpen(true);
        }}
      />
    </SplitwiseShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ExpenseSplitterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <GroupDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
