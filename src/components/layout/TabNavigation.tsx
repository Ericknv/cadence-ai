import React from 'react';
import {
  Calendar,
  Layers,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

export type NavTabId = 'today' | 'tracks' | 'planner' | 'insights';

export interface TabItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_TABS: TabItem[] = [
  { id: 'today', label: 'Hoje', icon: Calendar },
  { id: 'tracks', label: 'Trilhas', icon: Layers },
  { id: 'planner', label: 'Planejamento', icon: CalendarDays },
  { id: 'insights', label: 'Métricas', icon: BarChart3 },
];

interface TabNavigationProps {
  activeTab: NavTabId;
  onTabChange: (tabId: NavTabId) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <nav
      aria-label="Navegação Principal"
      className={`border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xs sticky top-0 z-20 ${className}`}
    >
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
