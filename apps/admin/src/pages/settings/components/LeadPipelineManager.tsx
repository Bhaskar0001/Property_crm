import React, { useState } from 'react';
import {
  useLeadSources,
  useCreateLeadSource,
  useUpdateLeadSource,
  useDeleteLeadSource,
  useLeadStages,
  useCreateLeadStage,
  useUpdateLeadStage,
  useDeleteLeadStage,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, GitFork, Share2, CheckCircle2, XCircle } from 'lucide-react';

export const LeadPipelineManager: React.FC = () => {
  const { data: sources } = useLeadSources();
  const createSource = useCreateLeadSource();
  const updateSource = useUpdateLeadSource();
  const deleteSource = useDeleteLeadSource();

  const { data: stages } = useLeadStages();
  const createStage = useCreateLeadStage();
  const updateStage = useUpdateLeadStage();
  const deleteStage = useDeleteLeadStage();

  // Modal State for Source
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [sourceEditingId, setSourceEditingId] = useState<string | null>(null);
  const [sourceForm, setSourceForm] = useState({ name: '', slug: '', isActive: true });

  // Modal State for Stage
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageEditingId, setStageEditingId] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState({
    name: '',
    code: '',
    color: '#3b82f6',
    isFinal: false,
    isActive: true,
  });

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'source' | 'stage'; id: string } | null>(null);

  const sourceList = Array.isArray(sources) ? sources : [];
  const stageList = Array.isArray(stages) ? stages : [];

  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.name.trim()) return;
    const slug = sourceForm.slug.trim() || sourceForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    try {
      if (sourceEditingId) {
        await updateSource.mutateAsync({ id: sourceEditingId, data: { name: sourceForm.name.trim(), slug, isActive: sourceForm.isActive } });
      } else {
        await createSource.mutateAsync({ name: sourceForm.name.trim(), slug, isActive: sourceForm.isActive });
      }
      setSourceModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageForm.name.trim()) return;
    const code = stageForm.code.trim().toUpperCase() || stageForm.name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_');
    try {
      if (stageEditingId) {
        await updateStage.mutateAsync({
          id: stageEditingId,
          data: {
            name: stageForm.name.trim(),
            code,
            color: stageForm.color,
            isFinal: stageForm.isFinal,
            isActive: stageForm.isActive,
          },
        });
      } else {
        await createStage.mutateAsync({
          name: stageForm.name.trim(),
          code,
          color: stageForm.color,
          isFinal: stageForm.isFinal,
          isActive: stageForm.isActive,
        });
      }
      setStageModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'source') {
        await deleteSource.mutateAsync(deleteTarget.id);
      } else {
        await deleteStage.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources Column */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-600" />
                Lead Sources
              </h3>
              <p className="text-xs text-gray-500">e.g., Website, WhatsApp, Daft.ie, Portal, Referral</p>
            </div>
            <button
              onClick={() => {
                setSourceEditingId(null);
                setSourceForm({ name: '', slug: '', isActive: true });
                setSourceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Source
            </button>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {sourceList.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No lead sources configured.</p>
            ) : (
              sourceList.map((s: any) => {
                const id = s._id || s.id;
                return (
                  <div key={id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="ml-2 font-mono text-xs text-gray-400">/{s.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSource.mutate({ id, data: { isActive: !s.isActive } })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setSourceEditingId(id);
                          setSourceForm({ name: s.name || '', slug: s.slug || '', isActive: s.isActive !== false });
                          setSourceModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'source', id })}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lead Stages Column */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-600" />
                Pipeline Stages
              </h3>
              <p className="text-xs text-gray-500">e.g., New, Contacted, Viewing, Offer, Converted, Lost</p>
            </div>
            <button
              onClick={() => {
                setStageEditingId(null);
                setStageForm({ name: '', code: '', color: '#3b82f6', isFinal: false, isActive: true });
                setStageModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stage
            </button>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {stageList.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No pipeline stages configured.</p>
            ) : (
              stageList.map((st: any) => {
                const id = st._id || st.id;
                return (
                  <div key={id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: st.color || '#3b82f6' }} />
                      <span className="font-medium text-gray-900">{st.name}</span>
                      <span className="font-mono text-xs text-gray-400">{st.code}</span>
                      {st.isFinal && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          Final
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStage.mutate({ id, data: { isActive: !st.isActive } })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          st.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {st.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {st.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setStageEditingId(id);
                          setStageForm({
                            name: st.name || '',
                            code: st.code || '',
                            color: st.color || '#3b82f6',
                            isFinal: !!st.isFinal,
                            isActive: st.isActive !== false,
                          });
                          setStageModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'stage', id })}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Source Modal */}
      <Modal isOpen={sourceModalOpen} onClose={() => setSourceModalOpen(false)}>
        <form onSubmit={handleSourceSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
            {sourceEditingId ? 'Edit Lead Source' : 'Add Lead Source'}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Source Name *</label>
            <input
              type="text"
              required
              value={sourceForm.name}
              onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
              placeholder="e.g. Website, Portal, WhatsApp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={sourceForm.slug}
              onChange={(e) => setSourceForm({ ...sourceForm, slug: e.target.value })}
              placeholder="e.g. website, whatsapp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isSourceActive"
              checked={sourceForm.isActive}
              onChange={(e) => setSourceForm({ ...sourceForm, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isSourceActive" className="text-sm text-gray-700 font-medium">Active in lead forms</label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setSourceModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>

      {/* Stage Modal */}
      <Modal isOpen={stageModalOpen} onClose={() => setStageModalOpen(false)}>
        <form onSubmit={handleStageSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
            {stageEditingId ? 'Edit Stage' : 'Add Pipeline Stage'}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Stage Name *</label>
            <input
              type="text"
              required
              value={stageForm.name}
              onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
              placeholder="e.g. Viewing Scheduled, Under Offer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={stageForm.code}
                onChange={(e) => setStageForm({ ...stageForm, code: e.target.value.toUpperCase() })}
                placeholder="VIEWING_SCHEDULED"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={stageForm.color}
                onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                className="h-10 w-full rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStageFinal"
                checked={stageForm.isFinal}
                onChange={(e) => setStageForm({ ...stageForm, isFinal: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="isStageFinal" className="text-sm text-gray-700 font-medium">
                Final / Concluding stage (e.g. Won, Lost)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStageActive"
                checked={stageForm.isActive}
                onChange={(e) => setStageForm({ ...stageForm, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="isStageActive" className="text-sm text-gray-700 font-medium">Active in CRM pipeline</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setStageModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">Are you sure you want to delete this configuration item?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
