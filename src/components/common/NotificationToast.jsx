import React from 'react';
import { useAudit } from '../../context/AuditContext';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function NotificationToast() {
  const { notification } = useAudit();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-4 max-w-md animate-bounce-short transition-all no-print">
      {icons[notification.type] || icons.info}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {notification.message}
      </p>
    </div>
  );
}
