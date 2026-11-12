import { useState } from 'react';
import SlideOverDrawer from './SlideOverDrawer';
import { UserPlus, Loader2, Mail } from 'lucide-react';
import { addGroupMember } from '../services/groupService';

function AddMemberContent({
  onClose,
  groupId: fixedGroupId,
  groups = [],
  onMemberAdded,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(
    () => fixedGroupId || (groups.length > 0 ? groups[0].id : '')
  );
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetGroupId = fixedGroupId || selectedGroupId;
    if (!targetGroupId) {
      setError('Please select a group.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await addGroupMember(targetGroupId, email.trim());
      if (onMemberAdded) onMemberAdded(data.member);
      setEmail('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-semibold animate-pulse-subtle">
          {error}
        </div>
      )}

      {/* Group Selector if in Global view */}
      {!fixedGroupId && groups.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm font-semibold transition"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Registered Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            placeholder="friend@test.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm font-medium transition"
            autoFocus
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          The user must already have a registered account on Expense Splitter.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-800">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Adding Member...</span>
            </>
          ) : (
            <span>Add to Group</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default function AddMemberSlideOver(props) {
  return (
    <SlideOverDrawer
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Add Group Member"
      subtitle="Invite a friend or roommate by registered email"
      icon={UserPlus}
      iconBg="bg-gradient-to-tr from-sky-600 to-blue-600 text-white"
    >
      {props.isOpen && (
        <AddMemberContent
          key={`${props.groupId || 'global'}`}
          {...props}
        />
      )}
    </SlideOverDrawer>
  );
}
