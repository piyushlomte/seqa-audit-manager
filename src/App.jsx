import React from 'react';
import { AuditProvider, useAudit } from './context/AuditContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import NotificationToast from './components/common/NotificationToast';
import Dashboard from './components/dashboard/Dashboard';
import ProjectManager from './components/projects/ProjectManager';
import TemplateLibrary from './components/templates/TemplateLibrary';
import AuditWorkbench from './components/audit/AuditWorkbench';
import CAPBoard from './components/cap/CAPBoard';
import AuditReportView from './components/reports/AuditReportView';

function MainContent() {
  const { activeView } = useAudit();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'projects' && <ProjectManager />}
      {activeView === 'templates' && <TemplateLibrary />}
      {activeView === 'audits' && <AuditWorkbench />}
      {activeView === 'cap' && <CAPBoard />}
      {activeView === 'reports' && <AuditReportView />}
    </main>
  );
}

export default function App() {
  return (
    <AuditProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <MainContent />
        </div>
        <NotificationToast />
      </div>
    </AuditProvider>
  );
}
