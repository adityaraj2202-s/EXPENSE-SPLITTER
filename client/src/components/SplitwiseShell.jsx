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
    <div className="min-h-screen bg-amber-50/30 flex flex-col font-sans">
      
      {/* Decorative Top Yellow Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 w-full" />

      {/* ========================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Mark: Expense Splitter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-amber-100/60 rounded-xl transition"
              aria-label="Toggle navigation"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-400/30 group-hover:scale-105 transition-transform">
                <Split className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  expense<span className="text-amber-500 font-extrabold">splitter</span>
                </span>
                <span className="hidden sm:block text-[10px] font-bold text-amber-700/80 -mt-1 tracking-wider uppercase">
                  Daily Bill Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Add Expense & Settle Up in Yellow Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-400/25 active:scale-[0.98] transition-all"
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
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white border border-amber-300 hover:border-amber-400 text-slate-800 hover:bg-amber-50 font-bold text-xs sm:text-sm rounded-xl shadow-2xs active:scale-[0.98] transition-all"
            >
              <HandCoins className="w-4 h-4 text-amber-600" />
              <span>Settle up</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-amber-200">
              <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 font-black text-xs flex items-center justify-center shadow-xs border border-amber-300/60">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR (Desktop Persistent & Mobile Drawer) */}
          {/* ========================================================= */}
          <aside
            className={`lg:col-span-3 space-y-6 ${
              isMobileSidebarOpen
                ? 'fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl overflow-y-auto block'
                : 'hidden lg:block'
            }`}
          >
            {/* Mobile close button */}
            {isMobileSidebarOpen && (
              <div className="flex justify-between items-center pb-4 border-b border-amber-100 lg:hidden">
                <span className="font-extrabold text-slate-900">Navigation</span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Global Nav Menu */}
            <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
              <button
                onClick={() => {
                  navigate('/');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isDashboardActive
                    ? 'bg-amber-100/80 text-amber-950 font-black border border-amber-300/80'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </div>
                {dashboardData.totals.totalNetBalance !== 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      dashboardData.totals.totalNetBalance > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {dashboardData.totals.totalNetBalance > 0 ? '+' : ''}
                    ₹{dashboardData.totals.totalNetBalance.toFixed(0)}
                  </span>
                )}
              </button>
            </div>

            {/* GROUPS Section */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  Groups ({dashboardData.groups.length})
                </span>
                <button
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {dashboardData.groups.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-amber-200 rounded-xl space-y-1">
                  <p className="text-xs text-slate-500 font-medium">No groups yet</p>
                  <button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="text-xs font-bold text-amber-600 hover:underline"
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
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                            : 'hover:bg-amber-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              active
                                ? 'bg-slate-950 text-amber-400'
                                : 'bg-amber-100 text-amber-800'
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
                            <span className={`text-[11px] font-extrabold ${active ? 'text-slate-950' : 'text-emerald-600'}`}>
                              +₹{net.toFixed(0)}
                            </span>
                          ) : isNegative ? (
                            <span className={`text-[11px] font-extrabold ${active ? 'text-rose-950' : 'text-rose-500'}`}>
                              -₹{Math.abs(net).toFixed(0)}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>
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

            {/* Quick Settle Promo Card in Yellow Theme */}
            <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-200/90 space-y-2">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Zero-Math Debt Settlement</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
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
