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
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold animate-pulse-subtle">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Group Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Goa Trip 2026, Flat 402, Friday Dinners"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-semibold transition"
            autoFocus
          />
        </div>

        {/* Group Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
        <div className="pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
