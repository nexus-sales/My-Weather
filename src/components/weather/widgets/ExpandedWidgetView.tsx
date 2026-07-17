'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ExpandedWidgetViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

// Shared detail view for any widget: centered modal on wider screens, bottom
// sheet on mobile (a centered modal squashed into a narrow viewport reads
// badly — this switches layout at sm instead of just shrinking one). Portals
// to document.body so it isn't clipped by any ancestor's overflow-hidden
// (glass-panel itself has overflow:hidden). No mounted/hydration guard
// needed: isOpen always starts false (nothing auto-expands), so document.body
// is never touched during the SSR pass.
export default function ExpandedWidgetView({ isOpen, onClose, title, icon, children }: ExpandedWidgetViewProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-fadein"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] bg-meteorix-card border border-meteorix-border rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col animate-slideup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <div className="text-meteorix-highlight">{icon}</div>}
            <h3 className="text-sm font-outfit font-semibold tracking-wide text-white uppercase truncate">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-full text-white/45 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
