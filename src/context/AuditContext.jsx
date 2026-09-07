import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PROJECTS, INITIAL_TEMPLATES, INITIAL_AUDITS, INITIAL_CAP_TICKETS } from '../data/initialData';
import { calculateAuditScore } from '../utils/auditEngine';

const AuditContext = createContext();

const LOCAL_STORAGE_KEY = 'SEQA_AUDIT_MANAGER_DATA_V3';

export const AuditProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to parse saved state:', err);
    }
    return {
      projects: INITIAL_PROJECTS,
      templates: INITIAL_TEMPLATES,
      audits: INITIAL_AUDITS,
      capTickets: INITIAL_CAP_TICKETS,
      darkMode: false // Default to Light Mode
    };
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState('ALL');
  const [activeAuditSessionId, setActiveAuditSessionId] = useState(null);
  const [activeReportAuditId, setActiveReportAuditId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save state to LocalStorage:', err);
    }
  }, [data]);

  useEffect(() => {
    if (data.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.darkMode]);

  const showToast = (message, type = 'success') => {
    setNotification({ id: Date.now(), message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const toggleDarkMode = () => {
    setData(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const addProject = (newProj) => {
    const project = {
      ...newProj,
      id: `proj-${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      milestones: newProj.milestones || []
    };
    setData(prev => ({
      ...prev,
      projects: [project, ...prev.projects]
    }));
    showToast(`Project "${project.name}" created.`);
  };

  const addMilestoneToProject = (projectId, milestone) => {
    const newMs = {
      ...milestone,
      id: `ms-${Date.now()}`,
      status: 'IN_PROGRESS'
    };
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, milestones: [...p.milestones, newMs] }
          : p
      )
    }));
    showToast(`Milestone "${newMs.name}" added to project.`);
  };

  const addTemplateItem = (templateId, item) => {
    const newItem = {
      ...item,
      id: `item-custom-${Date.now()}`
    };
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === templateId 
          ? { ...t, items: [...t.items, newItem] }
          : t
      )
    }));
    showToast(`Checklist criterion "${newItem.title}" added.`);
  };

  const updateTemplateItem = (templateId, updatedItem) => {
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === templateId 
          ? { ...t, items: t.items.map(i => i.id === updatedItem.id ? updatedItem : i) }
          : t
      )
    }));
    showToast(`Criterion updated.`);
  };

  const deleteTemplateItem = (templateId, itemId) => {
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(t => 
        t.id === templateId 
          ? { ...t, items: t.items.filter(i => i.id !== itemId) }
          : t
      )
    }));
    showToast(`Criterion removed.`);
  };

  const startNewAudit = (projectId, milestoneId, templateId = 'tmpl-standard-qa', auditorName = 'Lead QA Auditor') => {
    const project = data.projects.find(p => p.id === projectId);
    const milestone = project?.milestones.find(m => m.id === milestoneId);
    const template = data.templates.find(t => t.id === templateId);

    if (!project || !milestone || !template) {
      showToast('Please create a project and milestone before starting an audit.', 'warning');
      return null;
    }

    const newAudit = {
      id: `audit-${Date.now()}`,
      projectId,
      milestoneId,
      milestoneName: milestone.name,
      templateId,
      auditorName,
      auditDate: new Date().toISOString().split('T')[0],
      notes: `Quality audit for ${milestone.name}`,
      status: 'IN_PROGRESS',
      verdict: 'IN_PROGRESS',
      score: 0,
      itemResults: {}
    };

    setData(prev => ({
      ...prev,
      audits: [newAudit, ...prev.audits]
    }));

    setActiveAuditSessionId(newAudit.id);
    setActiveView('audits');
    showToast(`Audit session launched for ${milestone.name}`);
    return newAudit.id;
  };

  const updateAuditItemResult = (auditId, itemId, status, notes = '', evidenceUrl = '') => {
    setData(prev => ({
      ...prev,
      audits: prev.audits.map(a => {
        if (a.id !== auditId) return a;

        const updatedResults = {
          ...a.itemResults,
          [itemId]: { status, notes, evidenceUrl }
        };

        const template = prev.templates.find(t => t.id === a.templateId);
        const calc = calculateAuditScore(template ? template.items : [], updatedResults);

        return {
          ...a,
          itemResults: updatedResults,
          score: calc.score,
          verdict: calc.verdict
        };
      })
    }));
  };

  const submitAuditSession = (auditId) => {
    const audit = data.audits.find(a => a.id === auditId);
    const template = data.templates.find(t => t.id === audit.templateId);
    const project = data.projects.find(p => p.id === audit.projectId);

    if (!audit || !template) return;

    const calc = calculateAuditScore(template.items, audit.itemResults);

    const newCapTickets = [];
    template.items.forEach(item => {
      const res = audit.itemResults[item.id];
      if (res && (res.status === 'FAIL' || res.status === 'MITIGATION')) {
        const exists = data.capTickets.some(c => c.auditId === auditId && c.itemId === item.id);
        if (!exists) {
          newCapTickets.push({
            id: `cap-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            auditId,
            projectId: audit.projectId,
            projectName: project ? project.name : 'Project Audit',
            milestoneName: audit.milestoneName,
            itemId: item.id,
            itemTitle: item.title,
            severity: item.severity,
            category: item.categoryId,
            assignee: project ? project.projectManager : 'Unassigned',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'OPEN',
            finding: res.notes || `Non-conformance identified during ${audit.milestoneName}`,
            correctiveAction: item.guidelines || 'Remediate non-conformance and verify unit/integration tests.',
            resolutionNotes: ''
          });
        }
      }
    });

    setData(prev => ({
      ...prev,
      audits: prev.audits.map(a => a.id === auditId ? { ...a, status: 'COMPLETED', score: calc.score, verdict: calc.verdict } : a),
      capTickets: [...newCapTickets, ...prev.capTickets],
      projects: prev.projects.map(p => {
        if (p.id === audit.projectId) {
          return {
            ...p,
            milestones: p.milestones.map(m => m.id === audit.milestoneId ? { ...m, status: 'COMPLETED' } : m)
          };
        }
        return p;
      })
    }));

    showToast(`Audit submitted. Verdict: ${calc.verdictLabel}. Generated ${newCapTickets.length} CAP ticket(s).`);
  };

  const deleteAuditSession = (auditId) => {
    setData(prev => ({
      ...prev,
      audits: prev.audits.filter(a => a.id !== auditId),
      capTickets: prev.capTickets.filter(c => c.auditId !== auditId)
    }));
    if (activeAuditSessionId === auditId) {
      setActiveAuditSessionId(null);
    }
    showToast('Audit session deleted.');
  };

  const updateCAPTicketStatus = (ticketId, newStatus, resolutionNotes = '') => {
    setData(prev => ({
      ...prev,
      capTickets: prev.capTickets.map(c => 
        c.id === ticketId 
          ? { ...c, status: newStatus, resolutionNotes: resolutionNotes || c.resolutionNotes }
          : c
      )
    }));
    showToast(`CAP Ticket status updated.`);
  };

  const assignCAPTicket = (ticketId, assignee) => {
    setData(prev => ({
      ...prev,
      capTickets: prev.capTickets.map(c => c.id === ticketId ? { ...c, assignee } : c)
    }));
    showToast(`Assigned ticket to ${assignee}.`);
  };

  const resetToDefaults = () => {
    setData({
      projects: INITIAL_PROJECTS,
      templates: INITIAL_TEMPLATES,
      audits: INITIAL_AUDITS,
      capTickets: INITIAL_CAP_TICKETS,
      darkMode: false
    });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showToast('Cleared all data. Ready for fresh project setup.');
  };

  return (
    <AuditContext.Provider
      value={{
        ...data,
        activeView,
        setActiveView,
        activeProjectId,
        setActiveProjectId,
        activeAuditSessionId,
        setActiveAuditSessionId,
        activeReportAuditId,
        setActiveReportAuditId,
        notification,
        showToast,
        toggleDarkMode,
        addProject,
        addMilestoneToProject,
        addTemplateItem,
        updateTemplateItem,
        deleteTemplateItem,
        startNewAudit,
        updateAuditItemResult,
        submitAuditSession,
        deleteAuditSession,
        updateCAPTicketStatus,
        assignCAPTicket,
        resetToDefaults
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
