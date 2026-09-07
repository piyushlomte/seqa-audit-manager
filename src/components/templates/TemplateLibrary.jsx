import React, { useState } from 'react';
import { useAudit } from '../../context/AuditContext';
import { QA_CATEGORIES, ITEM_SEVERITIES } from '../../data/initialData';
import { 
  ListChecks, 
  Plus, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  Code2,
  TestTube2,
  ShieldCheck,
  FileText,
  Gauge,
  Server
} from 'lucide-react';

const CATEGORY_ICONS = {
  'code-quality': Code2,
  'testing-automation': TestTube2,
  'security-compliance': ShieldCheck,
  'documentation': FileText,
  'performance-scalability': Gauge,
  'deployment-ops': Server
};

export default function TemplateLibrary() {
  const { 
    templates, 
    addTemplateItem, 
    updateTemplateItem, 
    deleteTemplateItem 
  } = useAudit();

  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const currentTemplate = templates[0] || { items: [] };

  const [itemTitle, setItemTitle] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('code-quality');
  const [itemSeverity, setItemSeverity] = useState('HIGH');
  const [itemDesc, setItemDesc] = useState('');
  const [itemGuidelines, setItemGuidelines] = useState('');

  const filteredItems = selectedCategoryId === 'ALL'
    ? currentTemplate.items
    : currentTemplate.items.filter(i => i.categoryId === selectedCategoryId);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setItemTitle('');
    setItemCategoryId(selectedCategoryId === 'ALL' ? 'code-quality' : selectedCategoryId);
    setItemSeverity('HIGH');
    setItemDesc('');
    setItemGuidelines('');
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemTitle(item.title);
    setItemCategoryId(item.categoryId);
    setItemSeverity(item.severity);
    setItemDesc(item.description);
    setItemGuidelines(item.guidelines || '');
    setShowItemModal(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemTitle) return;

    if (editingItem) {
      updateTemplateItem(currentTemplate.id, {
        ...editingItem,
        title: itemTitle,
        categoryId: itemCategoryId,
        severity: itemSeverity,
        description: itemDesc,
        guidelines: itemGuidelines
      });
    } else {
      addTemplateItem(currentTemplate.id, {
        title: itemTitle,
        categoryId: itemCategoryId,
        severity: itemSeverity,
        description: itemDesc,
        guidelines: itemGuidelines
      });
    }

    setShowItemModal(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Audit Checklist Templates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Standardized quality evaluation criteria categorized by technical domain.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Criterion</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategoryId === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          All Categories ({currentTemplate.items.length})
        </button>

        {QA_CATEGORIES.map(cat => {
          const count = currentTemplate.items.filter(i => i.categoryId === cat.id).length;
          const isSelected = selectedCategoryId === cat.id;
          const Icon = CATEGORY_ICONS[cat.id] || CheckSquare;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map(item => {
          const category = QA_CATEGORIES.find(c => c.id === item.categoryId);
          const severity = ITEM_SEVERITIES[item.severity] || ITEM_SEVERITIES.MEDIUM;
          const Icon = CATEGORY_ICONS[item.categoryId] || CheckSquare;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg border mt-0.5 ${category?.bgLight}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${severity.color}`}>
                      {severity.label} (Weight x{severity.weight})
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {category?.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                  {item.guidelines && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Guideline: {item.guidelines}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Edit Criterion"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTemplateItem(currentTemplate.id, item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title="Delete Criterion"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
              {editingItem ? 'Edit Audit Criterion' : 'Add Audit Criterion'}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Vulnerability Scan"
                  value={itemTitle}
                  onChange={e => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain Category</label>
                  <select
                    value={itemCategoryId}
                    onChange={e => setItemCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {QA_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity Weight</label>
                  <select
                    value={itemSeverity}
                    onChange={e => setItemSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="CRITICAL">Critical (Weight x3)</option>
                    <option value="HIGH">High (Weight x2)</option>
                    <option value="MEDIUM">Medium (Weight x1.5)</option>
                    <option value="LOW">Low (Weight x1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Verification requirements..."
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evaluation Guideline</label>
                <input
                  type="text"
                  placeholder="Instructions for auditor..."
                  value={itemGuidelines}
                  onChange={e => setItemGuidelines(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
