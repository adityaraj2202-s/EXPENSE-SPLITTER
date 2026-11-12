import { useState } from 'react';
import SlideOverDrawer from './SlideOverDrawer';
import { Users, Loader2 } from 'lucide-react';
import { createGroup } from '../services/groupService';

const GROUP_TYPES = [
  { id: 'trip', label: 'Trip', emoji: '🏖️' },
  { id: 'home', label: 'Home / Flat', emoji: '🏠' },
  { id: 'food', label: 'Food / Outing', emoji: '🍕' },
  { id: 'couple', label: 'Couple', emoji: '💑' },
  { id: 'project', label: 'Project / Work', emoji: '💻' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

export default function CreateGroupSlideOver({
  isOpen,
  onClose,
  onGroupCreated,
}) {
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('trip');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await createGroup(groupName.trim());
      if (onGroupCreated) onGroupCreated(data.group);
      setGroupName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlideOverDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      subtitle="Start sharing bills with roommates or friends"
      icon={Users}
      iconBg="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-semibold animate-pulse-subtle">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Group Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Goa Trip 🏖️, Flat 402, Friday Dinners"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm font-semibold transition"
            autoFocus
          />
        </div>

        {/* Group Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Group Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GROUP_TYPES.map((type) => {
              const isSelected = groupType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setGroupType(type.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold shadow-xs'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
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
                <span>Creating Group...</span>
              </>
            ) : (
              <span>Create Group</span>
            )}
          </button>
        </div>
      </form>
    </SlideOverDrawer>
  );
}
