import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { 
  FolderGit2, 
  Plus, 
  Calendar, 
  User, 
  PlayCircle,
  Flag,
  FolderPlus
} from 'lucide-react';

export default function ProjectManager() {
  const { 
    projects, 
    addProject, 
    addMilestoneToProject, 
    startNewAudit,
    audits 
  } = useAudit();

  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(null);

  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [leadAuditor, setLeadAuditor] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [desc, setDesc] = useState('');

  const [msName, setMsName] = useState('');
  const [msTargetDate, setMsTargetDate] = useState('');
  const [msType, setMsType] = useState('Sprint Review');

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projName || !projCode) return;
    addProject({
      name: projName,
      code: projCode.toUpperCase(),
      leadAuditor: leadAuditor || 'QA Lead Auditor',
      projectManager: projectManager || 'Engineering Manager',
      repositoryUrl: repoUrl || 'https://github.com/enterprise/repo',
      description: desc || 'Enterprise application deliverables subject to quality audit review.',
      milestones: [
        {
          id: `ms-${Date.now()}`,
          name: 'Architecture & Baseline Review',
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'IN_PROGRESS',
          type: 'Architecture Review'
        }
      ]
    });
    setProjName('');
    setProjCode('');
    setLeadAuditor('');
    setProjectManager('');
    setRepoUrl('');
    setDesc('');
    setShowNewProjModal(false);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!msName || !showMilestoneModal) return;
    addMilestoneToProject(showMilestoneModal, {
      name: msName,
      targetDate: msTargetDate || new Date().toISOString().split('T')[0],
      type: msType
    });
    setMsName('');
    setMsTargetDate('');
    setShowMilestoneModal(null);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Projects & Milestone Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage projects, lead auditor assignments, and milestone review gates.
          </p>
        </div>
        <button
          onClick={() => setShowNewProjModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No Projects Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Create your first project to start defining milestones, scheduling review gates, and executing quality audits.
            </p>
          </div>
          <button
            onClick={() => setShowNewProjModal(true)}
            className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map(proj => {
            const projAudits = audits.filter(a => a.projectId === proj.id);
            const completedAudits = projAudits.filter(a => a.status === 'COMPLETED');
            const avgScore = completedAudits.length > 0
              ? Math.round((completedAudits.reduce((acc, a) => acc + a.score, 0) / completedAudits.length) * 10) / 10
              : 'N/A';

            return (
              <div 
                key={proj.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {proj.name}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {proj.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {proj.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs">
                    <div>
                      <span className="block text-slate-400 font-medium">Lead Auditor</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>{proj.leadAuditor}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Project Manager</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {proj.projectManager}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium">Avg Score</span>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        {avgScore === 'N/A' ? 'N/A' : `${avgScore}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Flag className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Milestone Review Gates ({proj.milestones.length})</span>
                    </h4>
                    <button
                      onClick={() => setShowMilestoneModal(proj.id)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {proj.milestones.map(ms => {
                      const existingAudit = projAudits.find(a => a.milestoneId === ms.id);
                      const isCompleted = ms.status === 'COMPLETED';

                      return (
                        <div 
                          key={ms.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-400">
                              {ms.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                            }`}>
                              {isCompleted ? 'COMPLETED' : 'PENDING'}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">
                            {ms.name}
                          </h5>

                          <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Review Date: {ms.targetDate}</span>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                            {existingAudit ? (
                              <div className="text-xs">
                                <span className="text-slate-400">Score: </span>
                                <span className="font-bold text-slate-900 dark:text-white">{existingAudit.score}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Not Audited</span>
                            )}

                            <button
                              onClick={() => startNewAudit(proj.id, ms.id)}
                              className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>{existingAudit ? 'Re-Audit' : 'Audit'}</span>
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {showNewProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              New Enterprise Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microservices API Gateway"
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. API-GATE"
                    value={projCode}
                    onChange={e => setProjCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Auditor</label>
                  <input
                    type="text"
                    placeholder="Auditor Title/Name"
                    value={leadAuditor}
                    onChange={e => setLeadAuditor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Manager</label>
                <input
                  type="text"
                  placeholder="Manager Name"
                  value={projectManager}
                  onChange={e => setProjectManager(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of project scope..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Add Milestone Gate
            </h3>
            <form onSubmit={handleAddMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Release Candidate Audit"
                  value={msName}
                  onChange={e => setMsName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gate Type</label>
                <select
                  value={msType}
                  onChange={e => setMsType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Sprint Review">Sprint Review</option>
                  <option value="Architecture Review">Architecture Review</option>
                  <option value="MVP Gate">MVP Gate</option>
                  <option value="Security Review">Security Audit</option>
                  <option value="Release Gate">Release Candidate Gate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Review Date</label>
                <input
                  type="date"
                  required
                  value={msTargetDate}
                  onChange={e => setMsTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
