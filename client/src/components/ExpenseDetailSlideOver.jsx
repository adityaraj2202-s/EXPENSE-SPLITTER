import SlideOverDrawer from './SlideOverDrawer';
import { getCategoryMeta } from '../utils/categoryIcons';
import {
  Receipt,
  Calendar,
  Users,
  Wallet,
  CheckCircle2,
  HandCoins,
} from 'lucide-react';

export default function ExpenseDetailSlideOver({
  isOpen,
  onClose,
  expense,
  onSettleClick,
  currentUserId,
}) {
  if (!expense) return null;

  const meta = getCategoryMeta(expense.category || 'General');
  const formattedDate = expense.created_at
    ? new Date(expense.created_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent';

  // Check if current user is part of the split
  const userSplit = (expense.splits || []).find(
    (s) => Number(s.user_id) === Number(currentUserId)
  );
  const isPayer = Number(expense.paid_by_id) === Number(currentUserId);

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={expense.description}
      subtitle={expense.group_name ? `In ${expense.group_name}` : 'Expense Breakdown'}
      icon={Receipt}
      iconBg={meta.bg}
    >
      <div className="space-y-6">
        
        {/* Big Amount Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              {meta.label}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Amount
            </p>
            <p className="text-3xl font-extrabold text-white mt-1">
              ₹{parseFloat(expense.amount).toFixed(2)}
            </p>
          </div>

          {/* User status banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300">Paid by</span>
            <span className="font-bold text-emerald-400">
              {expense.paid_by_name || 'Group Member'} {isPayer && '(You)'}
            </span>
          </div>
        </div>

        {/* User Share Status */}
        {userSplit && !isPayer && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-800 text-xs">
              <Wallet className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Your share of this bill is{' '}
                <strong className="text-rose-950 font-bold">
                  ₹{parseFloat(userSplit.share_amount).toFixed(2)}
                </strong>
              </span>
            </div>
            {onSettleClick && (
              <button
                onClick={() => {
                  onClose();
                  onSettleClick(expense.paid_by_id, userSplit.share_amount);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>Settle Up</span>
              </button>
            )}
          </div>
        )}

        {isPayer && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              You paid for this entire expense. Other members owe you their shares.
            </span>
          </div>
        )}

        {/* Detailed Splits Breakdown List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Split Allocations ({(expense.splits || []).length})
            </h4>
            <span className="text-xs text-slate-400 font-medium">Individual debts</span>
          </div>

          <div className="space-y-2">
            {(expense.splits || []).map((s, idx) => {
              const isCurrentUser = Number(s.user_id) === Number(currentUserId);
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    isCurrentUser
                      ? 'bg-indigo-50/50 border-indigo-200/90 shadow-2xs font-semibold'
                      : 'bg-slate-50/70 border-slate-200/60 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {s.user_name ? s.user_name[0].toUpperCase() : 'U'}
                    </div>
                    <span>
                      {s.user_name} {isCurrentUser && <span className="text-indigo-600 font-bold">(You)</span>}
                    </span>
                  </div>

                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{parseFloat(s.share_amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </SlideOverDrawer>
  );
}
