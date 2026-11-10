import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';
import { Users, Receipt, ArrowRightLeft, LogOut } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Expense Splitter</h1>
          <p className="text-slate-500 text-sm">Signed in as {user?.name} ({user?.email})</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Groups</h2>
            <p className="text-xs text-slate-400">View & invite members</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Expenses</h2>
            <p className="text-xs text-slate-400">Atomic group splits</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Settlements</h2>
            <p className="text-xs text-slate-400">Simplified debt graph</p>
          </div>
        </div>
      </div>
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
