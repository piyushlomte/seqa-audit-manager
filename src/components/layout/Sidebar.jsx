import React from 'react';
import { useAudit } from '../../context/AuditContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListChecks, 
  PlayCircle, 
  AlertOctagon, 
  FileText 
} from 'lucide-react';

export default function Sidebar() {
  const { activeView, setActiveView, capTickets, audits } = useAudit();

  const openCapCount = capTickets.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const inProgressAuditCount = audits.filter(a => a.status === 'IN_PROGRESS').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects & Milestones', icon: FolderKanban },
    { id: 'templates', label: 'Audit Templates', icon: ListChecks },
    { 
      id: 'audits', 
      label: 'Audit Workbench', 
      icon: PlayCircle, 
      badge: inProgressAuditCount > 0 ? inProgressAuditCount : null,
      badgeColor: 'bg-blue-600 text-white' 
    },
    { 
      id: 'cap', 
      label: 'CAP Action Board', 
      icon: AlertOctagon, 
      badge: openCapCount > 0 ? openCapCount : null,
      badgeColor: 'bg-amber-600 text-white' 
    },
    { id: 'reports', label: 'Executive Reports', icon: FileText }
  ];

  return (
    <aside className="w-full md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors no-print">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
        <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
          Quality Gate Rule
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Approval requires <span className="font-semibold text-emerald-600 dark:text-emerald-400">≥ 85%</span> compliance and 0 critical failures.
        </p>
      </div>
    </aside>
  );
}
