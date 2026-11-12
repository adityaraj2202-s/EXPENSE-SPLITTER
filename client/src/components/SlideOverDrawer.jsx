import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconBg = 'bg-emerald-50 text-emerald-600',
  children,
  maxWidth = 'max-w-md',
}) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-visibility duration-300 ${
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sliding Panel from Right */}
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div
          className={`w-screen ${maxWidth} bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
