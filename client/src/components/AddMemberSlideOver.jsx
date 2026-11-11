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
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold animate-pulse-subtle">
          {error}
        </div>
      )}

      {/* Group Selector if in Global view */}
      {!fixedGroupId && groups.length > 0 && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Group
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-semibold transition"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Registered Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            placeholder="friend@test.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium transition"
            autoFocus
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          The user must already have an account on Expense Splitter.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Inviting Member...</span>
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
