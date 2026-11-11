import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GroupDetails from './pages/GroupDetails';
import { useAuth } from './context/AuthContext';
import {
  Users,
  LogOut,
  Plus,
  ChevronRight,
  Loader2,
  Layers,
  Shield,
  Split,
} from 'lucide-react';
import CreateGroupModal from './components/CreateGroupModal';
import { getGroups } from './services/groupService';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getGroups()
      .then((data) => {
        if (!ignore) {
          setGroups(data.groups || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load groups');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Deterministic color palette for group avatars
  const avatarGradients = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 relative overflow-x-hidden">
      {/* Top Accent Gradient Bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 w-full" />

      {/* Ambient background blur blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 relative z-10">
        
        {/* ========================================================= */}
        {/* Top Header Card */}
        {/* ========================================================= */}
        <header className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-500/20 shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {getGreeting()}, {user?.name || 'Explorer'}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Active Member
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                {user?.email} • Track your shared expenses & group settlements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl transition border border-rose-200/80 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* Hero Quick Stats Banner */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Groups</p>
              <p className="text-2xl font-extrabold text-slate-900">{groups.length}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Split className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Simplification</p>
              <p className="text-sm font-bold text-slate-800">Auto Two-Pointer</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security</p>
              <p className="text-sm font-bold text-slate-800">JWT & Hashed Passwords</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Section Heading & Create Button */}
        {/* ========================================================= */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Expense Groups</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a group to log expenses, check net balances, and settle debts
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Group</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* Groups Content State */}
        {/* ========================================================= */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500">Loading your groups...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-200 shadow-sm">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 sm:p-16 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-lg text-slate-800">No expense groups yet</h3>
              <p className="text-sm text-slate-400">
                Create your first group for a shared trip, flat rent, or group dinners to start logging expenses.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group, idx) => {
              const gradient = avatarGradients[idx % avatarGradients.length];
              const formattedDate = group.created_at
                ? new Date(group.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recently';

              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex justify-between items-center group relative overflow-hidden"
                >
                  {/* Subtle hover accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-600 transition-colors" />

                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {group.name ? group.name[0].toUpperCase() : 'G'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {group.name}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          #{group.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Created {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                    <span>Manage</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* FLOATING ACTION BUTTON (FAB) FOR MOBILE & DESKTOP */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-full shadow-xl shadow-indigo-600/35 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <div className="p-1 rounded-full bg-white/20 group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-4 h-4" />
          </div>
          <span>New Group</span>
        </button>
      </div>

      {/* Modal Popup */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
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
            <Dashboard />
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
