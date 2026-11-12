import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Plus,
  LogOut,
  Menu,
  X,
  Split,
  HandCoins,
  TrendingUp,
} from 'lucide-react';
import { getDashboardSummary } from '../services/groupService';
import AddExpenseSlideOver from './AddExpenseSlideOver';
import SettleUpSlideOver from './SettleUpSlideOver';
import CreateGroupSlideOver from './CreateGroupSlideOver';
import ExpenseDetailSlideOver from './ExpenseDetailSlideOver';

export default function SplitwiseShell({
  children,
  currentGroupId = null,
  currentGroupMembers = [],
  onDataRefresh,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardData, setDashboardData] = useState({
    groups: [],
    totals: { totalNetBalance: 0, totalYouAreOwed: 0, totalYouOwe: 0 },
    activities: [],
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Sliding Drawers State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Settle prefill state
  const [settleReceiverId, setSettleReceiverId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const loadSummary = () => {
    getDashboardSummary()
      .then((data) => {
        setDashboardData(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSummary();
  }, [location.pathname]);

  const handleExpenseAdded = () => {
    loadSummary();
    if (onDataRefresh) onDataRefresh();
  };

  const handleSettled = () => {
    loadSummary();
    if (onDataRefresh) onDataRefresh();
  };

  const handleGroupCreated = (newGroup) => {
    loadSummary();
    navigate(`/groups/${newGroup.id}`);
  };

  const isDashboardActive = location.pathname === '/';
  const isGroupActive = (id) => location.pathname === `/groups/${id}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden bg-mesh-dark">
      
      {/* Decorative Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 w-full" />

      {/* Ambient background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Mark: Expense Splitter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              aria-label="Toggle navigation"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Split className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  expense<span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent font-extrabold">splitter</span>
                </span>
                <span className="hidden sm:block text-[10px] font-bold text-slate-400 -mt-1 tracking-wider uppercase">
                  Daily Bill Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add an expense</span>
            </button>

            <button
              onClick={() => {
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleUpOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl shadow-sm active:scale-[0.98] transition-all"
            >
              <HandCoins className="w-4 h-4 text-indigo-400" />
              <span>Settle up</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center shadow-xs border border-indigo-500/40">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SHELL */}
      {/* ========================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR (Desktop Persistent & Mobile Drawer) */}
          {/* ========================================================= */}
          <aside
            className={`lg:col-span-3 space-y-6 ${
              isMobileSidebarOpen
                ? 'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 p-6 shadow-2xl border-r border-slate-800 overflow-y-auto block'
                : 'hidden lg:block'
            }`}
          >
            {/* Mobile close button */}
            {isMobileSidebarOpen && (
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 lg:hidden">
                <span className="font-extrabold text-white">Navigation</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Global Nav Menu */}
            <div className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-slate-800 shadow-xl space-y-1">
              <button
                onClick={() => {
                  navigate('/');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isDashboardActive
                    ? 'bg-gradient-to-r from-indigo-600/40 to-emerald-600/20 text-white font-extrabold border border-indigo-500/40 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>Dashboard</span>
                </div>
                {dashboardData.totals.totalNetBalance !== 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      dashboardData.totals.totalNetBalance > 0
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {dashboardData.totals.totalNetBalance > 0 ? '+' : ''}
                    ₹{dashboardData.totals.totalNetBalance.toFixed(0)}
                  </span>
                )}
              </button>
            </div>

            {/* GROUPS Section */}
            <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Groups ({dashboardData.groups.length})
                </span>
                <button
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {dashboardData.groups.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl space-y-1">
                  <p className="text-xs text-slate-400 font-medium">No groups yet</p>
                  <button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="text-xs font-bold text-indigo-400 hover:underline"
                  >
                    + Create a group
                  </button>
                </div>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {dashboardData.groups.map((group) => {
                    const active = isGroupActive(group.id);
                    const net = group.userNetBalance || 0;
                    const isPositive = net > 0.009;
                    const isNegative = net < -0.009;

                    return (
                      <div
                        key={group.id}
                        onClick={() => {
                          navigate(`/groups/${group.id}`);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          active
                            ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/30 shadow-xs'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              active
                                ? 'bg-indigo-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {group.name ? group.name[0].toUpperCase() : 'G'}
                          </div>
                          <span className="text-xs font-bold truncate">
                            {group.name}
                          </span>
                        </div>

                        {/* Balance pill */}
                        <div className="text-right shrink-0 ml-2">
                          {isPositive ? (
                            <span className="text-[11px] font-extrabold text-emerald-400">
                              +₹{net.toFixed(0)}
                            </span>
                          ) : isNegative ? (
                            <span className="text-[11px] font-extrabold text-rose-400">
                              -₹{Math.abs(net).toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">
                              settled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Settle Promo Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Zero-Math Debt Settlement</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Our greedy algorithm simplifies cross-payments into the fewest direct transfers.
              </p>
            </div>

          </aside>

          {/* ========================================================= */}
          {/* MAIN CONTENT AREA */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 w-full">
            {children}
          </main>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SLIDING DRAWERS / SLIDE-OVERS */}
      {/* ========================================================= */}
      <AddExpenseSlideOver
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={currentGroupId}
        groups={dashboardData.groups}
        members={currentGroupMembers}
        onExpenseAdded={handleExpenseAdded}
      />

      <SettleUpSlideOver
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        groupId={currentGroupId}
        groups={dashboardData.groups}
        members={currentGroupMembers}
        defaultReceiverId={settleReceiverId}
        defaultAmount={settleAmount}
        onSettled={handleSettled}
      />

      <CreateGroupSlideOver
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      <ExpenseDetailSlideOver
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        currentUserId={user?.id}
        onSettleClick={(receiverId, amount) => {
          setSettleReceiverId(receiverId);
          setSettleAmount(amount);
          setIsSettleUpOpen(true);
        }}
      />
    </div>
  );
}
