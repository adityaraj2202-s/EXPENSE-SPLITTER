import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';
import { Users, LogOut, Plus, ChevronRight, Loader2 } from 'lucide-react';
import CreateGroupModal from './components/CreateGroupModal';
import { getGroups } from './services/groupService';

function Dashboard() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getGroups();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Expense Splitter</h1>
            <p className="text-slate-500 text-sm">
              Signed in as <span className="font-medium text-slate-700">{user?.name}</span> ({user?.email})
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Section Heading & Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Your Groups</h2>
            <p className="text-xs text-slate-500">View groups or create a new one</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>

        {/* Group Content State */}
        {loading ? (
          <div className="flex justify-center items-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm">Loading your groups...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No groups yet</h3>
            <p className="text-sm text-slate-400 mb-4">
              Create your first group to start splitting bills and tracking expenses.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition cursor-pointer flex justify-between items-center group"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Created {new Date(group.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}

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
    </Routes>
  );
}