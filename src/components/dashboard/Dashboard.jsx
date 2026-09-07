import React from 'react';
import { useAudit } from '../../context/AuditContext';
import { calculateAuditScore } from '../../utils/auditEngine';
import { QA_CATEGORIES } from '../../data/initialData';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  FolderPlus
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Dashboard() {
  const { 
    projects, 
    audits, 
    templates, 
    capTickets, 
    activeProjectId, 
    setActiveView, 
    setActiveAuditSessionId,
    setActiveReportAuditId,
    startNewAudit 
  } = useAudit();

  const filteredProjects = activeProjectId === 'ALL' 
    ? projects 
    : projects.filter(p => p.id === activeProjectId);

  const filteredAudits = activeProjectId === 'ALL'
    ? audits
    : audits.filter(a => a.projectId === activeProjectId);

  const filteredCap = activeProjectId === 'ALL'
    ? capTickets
    : capTickets.filter(c => c.projectId === activeProjectId);

  const completedAudits = filteredAudits.filter(a => a.status === 'COMPLETED');
  const avgScore = completedAudits.length > 0 
    ? Math.round((completedAudits.reduce((acc, a) => acc + (a.score || 0), 0) / completedAudits.length) * 10) / 10
    : 0;

  const openCapCount = filteredCap.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
  const criticalCapCount = filteredCap.filter(c => (c.status === 'OPEN' || c.status === 'IN_PROGRESS') && c.severity === 'CRITICAL').length;
  const approvedAudits = completedAudits.filter(a => a.verdict === 'APPROVED' || a.verdict === 'CONDITIONAL_APPROVAL').length;
  const approvalRate = completedAudits.length > 0 ? Math.round((approvedAudits / completedAudits.length) * 100) : 0;

  const defaultTemplate = templates.find(t => t.id === 'tmpl-standard-qa') || templates[0];

  const categoryScores = {};
  QA_CATEGORIES.forEach(cat => {
    categoryScores[cat.id] = { total: 0, sum: 0 };
  });

  completedAudits.forEach(audit => {
    const calc = calculateAuditScore(defaultTemplate?.items || [], audit.itemResults);
    Object.keys(calc.categoryScores).forEach(catId => {
      if (categoryScores[catId]) {
        categoryScores[catId].total++;
        categoryScores[catId].sum += calc.categoryScores[catId].score;
      }
    });
  });

  const radarLabels = QA_CATEGORIES.map(c => c.shortName);
  const radarDataValues = QA_CATEGORIES.map(c => {
    const stat = categoryScores[c.id];
    return stat && stat.total > 0 ? Math.round(stat.sum / stat.total) : 0;
  });

  const radarChartData = {
    labels: radarLabels,
    datasets: [
      {
        label: 'Compliance Score (%)',
        data: radarDataValues,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)'
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
        grid: { color: 'rgba(148, 163, 184, 0.2)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { backdropColor: 'transparent', stepSize: 20 }
      }
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  let totalPassed = 0;
  let totalFailed = 0;
  let totalMitigated = 0;

  completedAudits.forEach(audit => {
    const calc = calculateAuditScore(defaultTemplate?.items || [], audit.itemResults);
    totalPassed += calc.passedCount;
    totalFailed += calc.failedCount;
    totalMitigated += calc.mitigationCount;
  });

  const barChartData = {
    labels: ['Passed', 'Mitigation', 'Failed'],
    datasets: [
      {
        label: 'Criteria Results',
        data: [totalPassed, totalMitigated, totalFailed],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
  };

  const handleStartFirstAudit = () => {
    if (projects.length === 0) {
      setActiveView('projects');
    } else {
      const p = projects[0];
      if (p.milestones.length > 0) {
        startNewAudit(p.id, p.milestones[0].id);
      } else {
        setActiveView('projects');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Quality Audit Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time compliance metrics and audit deliverables status prior to milestone reviews.
          </p>
        </div>
        <button
          onClick={handleStartFirstAudit}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          {projects.length === 0 ? <FolderPlus className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          <span>{projects.length === 0 ? 'Create First Project' : 'Launch Audit Session'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Avg Compliance Score</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {avgScore > 0 ? `${avgScore}%` : '0%'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Target ≥ 85%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across completed milestone audits
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Milestone Approval Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {approvalRate > 0 ? `${approvalRate}%` : '0%'}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Approved
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Milestones cleared for release
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Open Action Tickets</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {openCapCount}
            </span>
            {criticalCapCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                {criticalCapCount} Critical
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Corrective actions pending resolution
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Projects</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {filteredProjects.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Projects
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {projects.reduce((acc, p) => acc + p.milestones.length, 0)} total milestone review gates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Category Compliance Radar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Quality score breakdown across 6 technical domains
          </p>
          <div className="h-60 relative flex items-center justify-center">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Audit Criteria Results
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribution of passed, mitigated, and failed criteria
          </p>
          <div className="h-60 relative flex items-center justify-center">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm m-0">
            Milestone Audit History
          </h3>
          {filteredAudits.length > 0 && (
            <button
              onClick={() => setActiveView('audits')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Milestone</th>
                <th className="px-4 py-2.5">Project</th>
                <th className="px-4 py-2.5">Auditor</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Verdict</th>
                <th className="px-4 py-2.5 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No audits found. Click "Create First Project" or "Launch Audit Session" to start.
                  </td>
                </tr>
              ) : (
                filteredAudits.map(audit => {
                  const proj = projects.find(p => p.id === audit.projectId);
                  let verdictBadgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                  let verdictText = audit.verdict;

                  if (audit.verdict === 'APPROVED') {
                    verdictBadgeClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
                    verdictText = 'Approved';
                  } else if (audit.verdict === 'CONDITIONAL_APPROVAL') {
                    verdictBadgeClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
                    verdictText = 'Conditional';
                  } else if (audit.verdict === 'REJECTED') {
                    verdictBadgeClass = 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800';
                    verdictText = 'Rejected';
                  }

                  return (
                    <tr key={audit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {audit.milestoneName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{proj?.code}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {audit.auditorName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {audit.auditDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {audit.score}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full ${verdictBadgeClass}`}>
                          {verdictText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setActiveAuditSessionId(audit.id);
                            setActiveView('audits');
                          }}
                          className="px-2.5 py-1 font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors"
                        >
                          Audit
                        </button>
                        <button
                          onClick={() => {
                            setActiveReportAuditId(audit.id);
                            setActiveView('reports');
                          }}
                          className="px-2.5 py-1 font-semibold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 transition-colors"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
