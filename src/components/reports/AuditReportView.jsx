import React, { useRef } from 'react';
import { useAudit } from '../../context/AuditContext';
import { calculateAuditScore } from '../../utils/auditEngine';
import { QA_CATEGORIES } from '../../data/initialData';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function AuditReportView() {
  const { 
    audits, 
    activeReportAuditId, 
    setActiveReportAuditId, 
    projects, 
    templates, 
    capTickets,
    setActiveView 
  } = useAudit();

  const reportRef = useRef();

  const currentAudit = audits.find(a => a.id === activeReportAuditId) || audits[0];
  const template = templates.find(t => t.id === currentAudit?.templateId) || templates[0];
  const project = projects.find(p => p.id === currentAudit?.projectId);

  const calc = currentAudit ? calculateAuditScore(template?.items || [], currentAudit.itemResults) : null;
  const auditCapTickets = capTickets.filter(c => c.auditId === currentAudit?.id);

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Audit_Report_${project?.code || 'SEQA'}_${currentAudit?.milestoneName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm m-0">
              Milestone Audit Summary Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Executive documentation for milestone sign-off review
            </p>
          </div>
        </div>

        {audits.length > 0 && (
          <div className="flex items-center space-x-3">
            <select
              value={currentAudit?.id}
              onChange={e => setActiveReportAuditId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {audits.map(a => (
                <option key={a.id} value={a.id}>
                  {a.milestoneName} ({a.auditDate}) — {a.verdict}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Executive Reports Available
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Complete an audit session in the Audit Workbench to generate and export an executive milestone report.
            </p>
          </div>
          <button
            onClick={() => setActiveView('audits')}
            className="inline-flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span>Go to Audit Workbench</span>
          </button>
        </div>
      ) : (
        currentAudit && (
          <div 
            ref={reportRef}
            className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xl space-y-8 print-container max-w-4xl mx-auto"
          >
            
            <div className="flex items-start justify-between border-b pb-6 border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-7 h-7 text-blue-600" />
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    Quality Audit Executive Report
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Software Deliverables & Milestone Quality Review Summary
                </p>
              </div>

              <div className="text-right">
                <span className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider inline-block ${calc?.verdictColor}`}>
                  VERDICT: {calc?.verdictLabel}
                </span>
                <span className="block text-[11px] text-slate-400 mt-1">
                  Date: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Project</span>
                <span className="font-bold text-slate-900">{project?.name} ({project?.code})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Milestone Gate</span>
                <span className="font-bold text-slate-900">{currentAudit.milestoneName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Lead Auditor</span>
                <span className="font-bold text-slate-900">{currentAudit.auditorName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Project Manager</span>
                <span className="font-bold text-slate-900">{project?.projectManager}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-900 text-white shadow-sm">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase">
                  Overall Weighted Compliance Score
                </span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-4xl font-black text-white">
                    {calc?.score}%
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    Threshold: ≥ 85.0% for Approval
                  </span>
                </div>
              </div>

              <div className="flex space-x-6 text-xs text-slate-300">
                <div className="text-center">
                  <span className="block text-xl font-bold text-emerald-400">{calc?.passedCount}</span>
                  <span>Passed</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-amber-400">{calc?.mitigationCount}</span>
                  <span>Mitigation</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-red-400">{calc?.failedCount}</span>
                  <span>Failed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                1. Category Compliance Summary
              </h4>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border-b">Category Domain</th>
                    <th className="p-2.5 border-b text-center">Items</th>
                    <th className="p-2.5 border-b text-center">Passed</th>
                    <th className="p-2.5 border-b text-center">Mitigation</th>
                    <th className="p-2.5 border-b text-center">Failed</th>
                    <th className="p-2.5 border-b text-right">Domain Compliance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {QA_CATEGORIES.map(cat => {
                    const catScore = calc?.categoryScores[cat.id] || { total: 0, passed: 0, mitigation: 0, failed: 0, score: 100 };
                    return (
                      <tr key={cat.id}>
                        <td className="p-2.5 font-semibold text-slate-900">{cat.name}</td>
                        <td className="p-2.5 text-center font-medium">{catScore.total}</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">{catScore.passed}</td>
                        <td className="p-2.5 text-center text-amber-600 font-bold">{catScore.mitigation}</td>
                        <td className="p-2.5 text-center text-red-600 font-bold">{catScore.failed}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{catScore.score}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 border-b pb-2">
                2. Non-Conformance Corrective Action Plan (CAP)
              </h4>

              {auditCapTickets.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                  No non-conformance items identified during this milestone audit. All evaluated criteria passed.
                </p>
              ) : (
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5 border-b">Severity</th>
                      <th className="p-2.5 border-b">Audit Criterion</th>
                      <th className="p-2.5 border-b">Finding</th>
                      <th className="p-2.5 border-b">Assignee</th>
                      <th className="p-2.5 border-b text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {auditCapTickets.map(t => (
                      <tr key={t.id}>
                        <td className="p-2.5 font-bold text-red-600">{t.severity}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{t.itemTitle}</td>
                        <td className="p-2.5 text-slate-600">{t.finding}</td>
                        <td className="p-2.5 font-medium">{t.assignee}</td>
                        <td className="p-2.5 text-right font-bold">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
              <div className="space-y-6">
                <span className="font-bold text-slate-900 block">Lead QA Auditor Authorization</span>
                <div className="border-b border-slate-400 w-48 pb-1">
                  <span className="font-semibold text-slate-800 italic">{currentAudit.auditorName}</span>
                </div>
                <span className="text-[11px] text-slate-400 block">Signature & Date</span>
              </div>

              <div className="space-y-6">
                <span className="font-bold text-slate-900 block">Project Manager Milestone Sign-off</span>
                <div className="border-b border-slate-400 w-48 pb-1">
                  <span className="font-semibold text-slate-800 italic">{project?.projectManager}</span>
                </div>
                <span className="text-[11px] text-slate-400 block">Signature & Date</span>
              </div>
            </div>

          </div>
        )
      )}

    </div>
  );
}
