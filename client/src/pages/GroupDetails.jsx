import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { getGroupMembers } from '../services/groupService';
import { getExpenses } from '../services/expenseService';
import { getGroupBalances } from '../services/balanceService';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  // Settlement prefill state
  const [settlePayerId, setSettlePayerId] = useState('');
  const [settleReceiverId, setSettleReceiverId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const fetchAllData = async () => {
    try {
      setError('');
      setLoading(true);

      const [memberData, expenseData, balanceData] = await Promise.all([
        getGroupMembers(groupId),
        getExpenses(groupId),
        getGroupBalances(groupId),
      ]);

      setMembers(memberData.members || []);
      setExpenses(expenseData.expenses || []);
      setBalances(balanceData.balances || {});
      setSettlements(balanceData.settlements || []);
    } catch (err) {
      setError(err.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
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

  const openSettleWithPrefill = (payerId, receiverId, amount) => {
    setSettlePayerId(payerId);
    setSettleReceiverId(receiverId);
    setSettleAmount(amount);
    setIsSettleModalOpen(true);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl shadow-sm transition"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              Add Member
            </button>
            <button
              onClick={() => {
                setSettlePayerId('');
                setSettleReceiverId('');
                setSettleAmount('');
                setIsSettleModalOpen(true);
              }}
              disabled={members.length < 2}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-sm font-medium rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <HandCoins className="w-4 h-4 text-indigo-600" />
              Settle Up
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              disabled={members.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Group Banner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Group #{groupId}</h1>
            <p className="text-sm text-slate-500 mt-1">Split expenses and track balances</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Group Spend
            </span>
            <p className="text-2xl font-bold text-slate-800">₹{totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Simplified Debts / Settlement Suggestions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            Suggested Settlements
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm">Calculating balances...</span>
            </div>
          ) : settlements.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>All settled up! No outstanding balances in this group.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {settlements.map((item, idx) => {
  // Support either from/to, fromUserId/toUserId, or fromId/toId
  const payerId = item.from ?? item.fromUserId ?? item.fromId ?? item.payerId;
  const receiverId = item.to ?? item.toUserId ?? item.toId ?? item.receiverId;

  const fromMember = members.find((m) => m.id === Number(payerId));
  const toMember = members.find((m) => m.id === Number(receiverId));

  const payerName = item.fromName || (fromMember ? fromMember.name : `User #${payerId}`);
  const receiverName = item.toName || (toMember ? toMember.name : `User #${receiverId}`);

  return (
    <div
      key={idx}
      className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl gap-2"
    >
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">{payerName}</span>
        <ArrowRight className="w-4 h-4 text-slate-400" />
        <span className="font-semibold text-slate-900">{receiverName}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-900 text-base">
          ₹{parseFloat(item.amount).toFixed(2)}
        </span>
        <button
          onClick={() => openSettleWithPrefill(payerId, receiverId, item.amount)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition"
        >
          Settle
        </button>
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>

        {/* Members & Net Balance Grid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Members & Net Balances ({members.length})
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm">Loading members...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member) => {
                const net = balances[member.id] || 0;
                const isPositive = net > 0.001;
                const isNegative = net < -0.001;

                return (
                  <div
                    key={member.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                        {member.name ? member.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <p
                        className={`text-xs font-semibold ${
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
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {isPositive ? 'gets back' : isNegative ? 'owes' : 'settled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Recent Expenses ({expenses.length})
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-sm">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium text-sm">No expenses recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Add an expense to start tracking who paid and who owes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <div key={expense.id} className="py-3.5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{expense.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Paid by{' '}
                      <span className="font-medium text-slate-600">
                        {expense.payer_name || 'Member'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800 text-base">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
        defaultPayerId={settlePayerId}
        defaultReceiverId={settleReceiverId}
        defaultAmount={settleAmount}
        onSettled={handleSettled}
      />
    </div>
  );
}