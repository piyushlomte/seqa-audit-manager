import React from 'react';
import { useAudit } from '../../context/AuditContext';
import { 
  ShieldCheck, 
  Sun, 
  Moon, 
  PlusCircle, 
  RotateCcw,
  FolderGit2
} from 'lucide-react';

export default function Navbar() {
  const { 
    darkMode, 
    toggleDarkMode, 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    startNewAudit,
    resetToDefaults,
    setActiveView 
  } = useAudit();

  const handleQuickAudit = () => {
    const proj = projects[0];
    if (proj && proj.milestones.length > 0) {
      const targetMilestone = proj.milestones.find(m => m.status === 'IN_PROGRESS') || proj.milestones[0];
      startNewAudit(proj.id, targetMilestone.id);
    } else {
      setActiveView('audits');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Quality Audit Manager
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Software Deliverables & Milestone Review Governance
              </p>
            </div>
          </div>

          {/* Project Filter Selector */}
          <div className="hidden md:flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Project:</span>
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Enterprise Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleQuickAudit}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Audit</span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={resetToDefaults}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
