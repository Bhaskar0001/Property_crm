import React, { useState } from 'react';
import {
  useListingTypes,
  useCreateListingType,
  useUpdateListingType,
  useDeleteListingType,
  useTenureTypes,
  useCreateTenureType,
  useUpdateTenureType,
  useDeleteTenureType,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Tag, KeyRound, CheckCircle2, XCircle } from 'lucide-react';

export const ListingAndTenureManager: React.FC = () => {
  const { data: listingTypes } = useListingTypes();
  const createLT = useCreateListingType();
  const updateLT = useUpdateListingType();
  const deleteLT = useDeleteListingType();

  const { data: tenureTypes } = useTenureTypes();
  const createTT = useCreateTenureType();
  const updateTT = useUpdateTenureType();
  const deleteTT = useDeleteTenureType();

  // Modal State for Listing Type
  const [ltModalOpen, setLtModalOpen] = useState(false);
  const [ltEditingId, setLtEditingId] = useState<string | null>(null);
  const [ltForm, setLtForm] = useState({ name: '', slug: '', isActive: true });

  // Modal State for Tenure Type
  const [ttModalOpen, setTtModalOpen] = useState(false);
  const [ttEditingId, setTtEditingId] = useState<string | null>(null);
  const [ttForm, setTtForm] = useState({ name: '', slug: '', isActive: true });

  // Delete confirmations
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'lt' | 'tt'; id: string } | null>(null);

  const ltList = Array.isArray(listingTypes) ? listingTypes : [];
  const ttList = Array.isArray(tenureTypes) ? tenureTypes : [];

  // Listing Type Submit
  const handleLtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ltForm.name.trim()) return;
    const slug = ltForm.slug.trim() || ltForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    try {
      if (ltEditingId) {
        await updateLT.mutateAsync({ id: ltEditingId, data: { name: ltForm.name.trim(), slug, isActive: ltForm.isActive } });
      } else {
        await createLT.mutateAsync({ name: ltForm.name.trim(), slug, isActive: ltForm.isActive });
      }
      setLtModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  // Tenure Type Submit
  const handleTtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttForm.name.trim()) return;
    const slug = ttForm.slug.trim() || ttForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    try {
      if (ttEditingId) {
        await updateTT.mutateAsync({ id: ttEditingId, data: { name: ttForm.name.trim(), slug, isActive: ttForm.isActive } });
      } else {
        await createTT.mutateAsync({ name: ttForm.name.trim(), slug, isActive: ttForm.isActive });
      }
      setTtModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'lt') {
        await deleteLT.mutateAsync(deleteTarget.id);
      } else {
        await deleteTT.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Types Column */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Listing Types
              </h3>
              <p className="text-xs text-gray-500">e.g., For Sale, To Let, Commercial Sale, Commercial Lease</p>
            </div>
            <button
              onClick={() => {
                setLtEditingId(null);
                setLtForm({ name: '', slug: '', isActive: true });
                setLtModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Listing Type
            </button>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {ltList.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No listing types configured.</p>
            ) : (
              ltList.map((lt: any) => {
                const id = lt._id || lt.id;
                return (
                  <div key={id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{lt.name}</span>
                      <span className="ml-2 font-mono text-xs text-gray-400">/{lt.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateLT.mutate({ id, data: { isActive: !lt.isActive } })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          lt.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {lt.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {lt.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setLtEditingId(id);
                          setLtForm({ name: lt.name || '', slug: lt.slug || '', isActive: lt.isActive !== false });
                          setLtModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'lt', id })}
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

        {/* Tenure Types Column */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Tenure Types
              </h3>
              <p className="text-xs text-gray-500">e.g., Freehold, Leasehold, Share of Freehold, Commonhold</p>
            </div>
            <button
              onClick={() => {
                setTtEditingId(null);
                setTtForm({ name: '', slug: '', isActive: true });
                setTtModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Tenure Type
            </button>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {ttList.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No tenure types configured.</p>
            ) : (
              ttList.map((tt: any) => {
                const id = tt._id || tt.id;
                return (
                  <div key={id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{tt.name}</span>
                      <span className="ml-2 font-mono text-xs text-gray-400">/{tt.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateTT.mutate({ id, data: { isActive: !tt.isActive } })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          tt.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {tt.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {tt.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => {
                          setTtEditingId(id);
                          setTtForm({ name: tt.name || '', slug: tt.slug || '', isActive: tt.isActive !== false });
                          setTtModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-emerald-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'tt', id })}
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

      {/* Listing Type Modal */}
      <Modal isOpen={ltModalOpen} onClose={() => setLtModalOpen(false)}>
        <form onSubmit={handleLtSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
            {ltEditingId ? 'Edit Listing Type' : 'Add Listing Type'}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={ltForm.name}
              onChange={(e) => setLtForm({ ...ltForm, name: e.target.value })}
              placeholder="e.g. For Sale, To Let"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug</label>
            <input
              type="text"
              value={ltForm.slug}
              onChange={(e) => setLtForm({ ...ltForm, slug: e.target.value })}
              placeholder="e.g. for-sale, to-let"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isLtActive"
              checked={ltForm.isActive}
              onChange={(e) => setLtForm({ ...ltForm, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isLtActive" className="text-sm text-gray-700 font-medium">Active for listings</label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setLtModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        </form>
      </Modal>

      {/* Tenure Type Modal */}
      <Modal isOpen={ttModalOpen} onClose={() => setTtModalOpen(false)}>
        <form onSubmit={handleTtSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
            {ttEditingId ? 'Edit Tenure Type' : 'Add Tenure Type'}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={ttForm.name}
              onChange={(e) => setTtForm({ ...ttForm, name: e.target.value })}
              placeholder="e.g. Freehold, Leasehold"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug</label>
            <input
              type="text"
              value={ttForm.slug}
              onChange={(e) => setTtForm({ ...ttForm, slug: e.target.value })}
              placeholder="e.g. freehold, leasehold"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isTtActive"
              checked={ttForm.isActive}
              onChange={(e) => setTtForm({ ...ttForm, isActive: e.target.checked })}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="isTtActive" className="text-sm text-gray-700 font-medium">Active for property specs</label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={() => setTtModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">Save</button>
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
