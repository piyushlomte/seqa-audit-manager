import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { calculateAuditScore } from '../../utils/auditEngine';
import { QA_CATEGORIES, ITEM_SEVERITIES } from '../../data/initialData';
import { 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MinusCircle, 
  ExternalLink,
  Save,
  Trash2,
  FileCheck2,
  FolderPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuditWorkbench() {
  const { 
    audits, 
    activeAuditSessionId, 
    setActiveAuditSessionId, 
    projects, 
    templates, 
    startNewAudit, 
    updateAuditItemResult, 
    submitAuditSession, 
    deleteAuditSession,
    setActiveReportAuditId,
    setActiveView 
  } = useAudit();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || '');
  const [selectedMsId, setSelectedMsId] = useState(projects[0]?.milestones[0]?.id || '');
  const [auditorName, setAuditorName] = useState('Senior QA Lead');

  const currentAudit = audits.find(a => a.id === activeAuditSessionId) || audits[0];
  const template = templates.find(t => t.id === currentAudit?.templateId) || templates[0];
  const project = projects.find(p => p.id === currentAudit?.projectId);

  const auditCalc = currentAudit ? calculateAuditScore(template?.items || [], currentAudit.itemResults) : null;

  const filteredItems = template?.items.filter(item => {
    if (selectedCategoryFilter === 'ALL') return true;
    return item.categoryId === selectedCategoryFilter;
  }) || [];

  const handleLaunchNewSession = (e) => {
    e.preventDefault();
    if (!selectedProjId || !selectedMsId) return;
    const newId = startNewAudit(selectedProjId, selectedMsId, 'tmpl-standard-qa', auditorName);
    if (newId) {
      setActiveAuditSessionId(newId);
    }
    setShowLaunchModal(false);
  };

  const handleSubmitAudit = () => {
    if (!currentAudit) return;
    submitAuditSession(currentAudit.id);

    if (auditCalc?.verdict === 'APPROVED') {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Audit Execution Workbench
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perform item-by-item criteria checks, attach evidence, and compute milestone approval verdicts.
          </p>
        </div>

        {projects.length > 0 && (
          <button
            onClick={() => setShowLaunchModal(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>New Audit Session</span>
          </button>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Active Audit Sessions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {projects.length === 0 
                ? "Please create a project first before starting your quality audit session."
                : "Select a project milestone to launch an interactive quality audit session."}
            </p>
          </div>
          {projects.length === 0 ? (
            <button
              onClick={() => setActiveView('projects')}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLaunchModal(true)}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Audit Session</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase whitespace-nowrap">
              Audit Sessions:
            </span>
            <div className="flex items-center space-x-2">
              {audits.map(a => {
                const isSelected = a.id === currentAudit?.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveAuditSessionId(a.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{a.milestoneName}</span>
                    <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      {a.score}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentAudit && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase">
                      {project?.code} • {project?.name}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {currentAudit.milestoneName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Auditor: <span className="text-white font-medium">{currentAudit.auditorName}</span> • Date: {currentAudit.auditDate}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">Compliance Score</span>
                      <span className="text-3xl font-black text-white">
                        {auditCalc?.score}%
                      </span>
                    </div>

                    <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold ${auditCalc?.verdictColor}`}>
                      {auditCalc?.verdictLabel}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">Passed: <strong className="text-emerald-400">{auditCalc?.passedCount}</strong></span>
                    <span className="text-slate-400">Mitigation: <strong className="text-amber-400">{auditCalc?.mitigationCount}</strong></span>
                    <span className="text-slate-400">Failed: <strong className="text-red-400">{auditCalc?.failedCount}</strong></span>
                    <span className="text-slate-400">N/A: <strong className="text-slate-400">{auditCalc?.naCount}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteAuditSession(currentAudit.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete Audit Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {currentAudit.status === 'COMPLETED' ? (
                      <button
                        onClick={() => {
                          setActiveReportAuditId(currentAudit.id);
                          setActiveView('reports');
                        }}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>View Executive Report</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitAudit}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Submit & Finalize Audit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategoryFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All Categories ({template.items.length})
                </button>
                {QA_CATEGORIES.map(cat => {
                  const isSelected = selectedCategoryFilter === cat.id;
                  const count = template.items.filter(i => i.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat.shortName} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {filteredItems.map(item => {
                  const res = currentAudit.itemResults[item.id] || { status: 'UNREVIEWED', notes: '', evidenceUrl: '' };
                  const currentStatus = res.status;
                  const category = QA_CATEGORIES.find(c => c.id === item.categoryId);
                  const severity = ITEM_SEVERITIES[item.severity] || ITEM_SEVERITIES.MEDIUM;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        currentStatus === 'PASS'
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : currentStatus === 'FAIL'
                          ? 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                          : currentStatus === 'MITIGATION'
                          ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${severity.color}`}>
                              {severity.label} (Weight x{severity.weight})
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {category?.name}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {item.description}
                          </p>

                          {item.guidelines && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                              Guideline: {item.guidelines}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start">
                          <button
                            onClick={() => updateAuditItemResult(currentAudit.id, item.id, 'PASS', res.notes, res.evidenceUrl)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-bold text-xs transition-all ${
                              currentStatus === 'PASS'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </button>

                          <button
                            onClick={() => updateAuditItemResult(currentAudit.id, item.id, 'MITIGATION', res.notes, res.evidenceUrl)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-bold text-xs transition-all ${
                              currentStatus === 'MITIGATION'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Mitigate</span>
                          </button>

                          <button
                            onClick={() => updateAuditItemResult(currentAudit.id, item.id, 'FAIL', res.notes, res.evidenceUrl)}
                            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-bold text-xs transition-all ${
                              currentStatus === 'FAIL'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-red-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Fail</span>
                          </button>

                          <button
                            onClick={() => updateAuditItemResult(currentAudit.id, item.id, 'NA', res.notes, res.evidenceUrl)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded font-bold text-xs transition-all ${
                              currentStatus === 'NA'
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'
                            }`}
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>N/A</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Auditor Review Notes
                          </label>
                          <input
                            type="text"
                            placeholder="Add review findings or observations..."
                            value={res.notes || ''}
                            onChange={e => updateAuditItemResult(currentAudit.id, item.id, currentStatus, e.target.value, res.evidenceUrl)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            Evidence / Artifact URL
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Link to log, test report, or artifact..."
                              value={res.evidenceUrl || ''}
                              onChange={e => updateAuditItemResult(currentAudit.id, item.id, currentStatus, res.notes, e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                            {res.evidenceUrl && (
                              <a
                                href={res.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded"
                                title="Open Link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Launch Audit Session
            </h3>
            <form onSubmit={handleLaunchNewSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
                <select
                  value={selectedProjId}
                  onChange={e => {
                    setSelectedProjId(e.target.value);
                    const proj = projects.find(p => p.id === e.target.value);
                    if (proj && proj.milestones.length > 0) {
                      setSelectedMsId(proj.milestones[0].id);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Milestone Gate</label>
                <select
                  value={selectedMsId}
                  onChange={e => setSelectedMsId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {projects.find(p => p.id === selectedProjId)?.milestones.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.targetDate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Auditor Name</label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={e => setAuditorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLaunchModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Start Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
