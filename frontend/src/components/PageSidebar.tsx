import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiChevronRight, mdiChevronLeft, mdiHome, mdiViewDashboard } from '@mdi/js';

/**
 * Collapsible page navigation sidebar.
 * Shows in view mode as a thin strip on the left edge with page indicators.
 * Expands to show page names on hover/click.
 */
export default function PageSidebar() {
  const [expanded, setExpanded] = useState(false);
  const dashboard = useDashboardStore((s) => s.dashboard);
  const activePage = useDashboardStore((s) => s.activePage);
  const setActivePage = useDashboardStore((s) => s.setActivePage);
  const mode = useDashboardStore((s) => s.mode);

  const pages = dashboard?.pages || [];

  if (pages.length <= 1 || mode === 'edit') return null;

  return (
    <motion.div
      initial={{ x: -48 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex"
    >
      <motion.div
        animate={{ width: expanded ? 160 : 48 }}
        className="rounded-r-xl shadow-lg overflow-hidden flex flex-col py-2"
        style={{
          background: 'var(--color-surface-primary)',
          borderRight: '1px solid var(--color-border-primary)',
          borderTop: '1px solid var(--color-border-primary)',
          borderBottom: '1px solid var(--color-border-primary)',
        }}
      >
        {/* Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="self-end px-2 py-1 mb-1"
        >
          <Icon
            path={expanded ? mdiChevronLeft : mdiChevronRight}
            size={0.6}
            color="var(--color-text-tertiary)"
          />
        </button>

        {/* Page buttons */}
        {pages.map((page, i) => {
          const isActive = i === activePage;
          return (
            <button
              key={page.id}
              onClick={() => setActivePage(i)}
              className="flex items-center gap-2 px-3 py-2 transition-all"
              style={{
                background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
              }}
            >
              <Icon
                path={i === 0 ? mdiHome : mdiViewDashboard}
                size={0.7}
                color={isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}
              />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-xs font-medium whitespace-nowrap overflow-hidden"
                  >
                    {page.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
