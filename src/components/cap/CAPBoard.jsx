import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { ITEM_SEVERITIES, QA_CATEGORIES } from '../../data/initialData';
import { 
  AlertOctagon, 
  UserCheck, 
  Calendar, 
  Filter,
  Check
} from 'lucide-react';

export default function CAPBoard() {
  const { capTickets, updateCAPTicketStatus, assignCAPTicket } = useAudit();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');

  const filteredTickets = capTickets.filter(ticket => {
    if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && ticket.severity !== severityFilter) return false;
    return true;
  });

  const openModalForTicket = (ticket) => {
    setSelectedTicketModal(ticket);
    setResolutionNotes(ticket.resolutionNotes || '');
    setAssigneeInput(ticket.assignee || '');
  };

  const handleResolveTicket = (e) => {
    e.preventDefault();
    if (!selectedTicketModal) return;
    updateCAPTicketStatus(selectedTicketModal.id, 'RESOLVED', resolutionNotes);
    if (assigneeInput) {
      assignCAPTicket(selectedTicketModal.id, assigneeInput);
    }
    setSelectedTicketModal(null);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Corrective Action Plan (CAP) Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track and remediate non-conformance items identified during quality audits.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500">Status:</span>
          <div className="flex items-center space-x-1">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Tickets' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-500">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Severity & Criterion</th>
                <th className="px-4 py-2.5">Project & Milestone</th>
                <th className="px-4 py-2.5">Assignee</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No action plan tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const severity = ITEM_SEVERITIES[ticket.severity] || ITEM_SEVERITIES.MEDIUM;
                  const category = QA_CATEGORIES.find(c => c.id === ticket.category);

                  let statusBadgeClass = 'bg-slate-100 text-slate-700';
                  if (ticket.status === 'OPEN') statusBadgeClass = 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800';
                  if (ticket.status === 'IN_PROGRESS') statusBadgeClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
                  if (ticket.status === 'RESOLVED') statusBadgeClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${severity.color}`}>
                              {severity.label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {category?.shortName}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                            {ticket.itemTitle}
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {ticket.finding}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{ticket.projectName}</span>
                        <span className="text-slate-400 text-[11px]">{ticket.milestoneName}</span>
                      </td>

                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>{ticket.assignee}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ticket.dueDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.5 font-bold rounded-full ${statusBadgeClass}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => openModalForTicket(ticket)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                        >
                          Manage Ticket
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

      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                CAP Ticket #{selectedTicketModal.id.split('-')[1]}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${ITEM_SEVERITIES[selectedTicketModal.severity]?.color}`}>
                {selectedTicketModal.severity} SEVERITY
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              {selectedTicketModal.itemTitle}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
              <div>
                <span className="font-semibold text-slate-500">Finding Details:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedTicketModal.finding}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Remediation Guidelines:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedTicketModal.correctiveAction}</p>
              </div>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                <input
                  type="text"
                  required
                  value={assigneeInput}
                  onChange={e => setAssigneeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution & Verification Notes</label>
                <textarea
                  rows={3}
                  placeholder="Document fixes applied and verified..."
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => updateCAPTicketStatus(selectedTicketModal.id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-semibold"
                >
                  In Progress
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketModal(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Resolve Ticket</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
