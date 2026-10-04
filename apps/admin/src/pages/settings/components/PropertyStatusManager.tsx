import React, { useState } from 'react';
import {
  usePropertyStatuses,
  useCreatePropertyStatus,
  useUpdatePropertyStatus,
  useDeletePropertyStatus,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface PropertyStatusFormData {
  name: string;
  code: string;
  color: string;
  isActive: boolean;
}

const initialForm: PropertyStatusFormData = {
  name: '',
  code: '',
  color: '#10b981',
  isActive: true,
};

const COLOR_PRESETS = [
  { label: 'Green / Available', hex: '#10b981' },
  { label: 'Amber / Under Offer', hex: '#f59e0b' },
  { label: 'Purple / Reserved', hex: '#8b5cf6' },
  { label: 'Rose / Sold', hex: '#f43f5e' },
  { label: 'Slate / Off Market', hex: '#64748b' },
  { label: 'Blue / Sale Agreed', hex: '#3b82f6' },
];

export const PropertyStatusManager: React.FC = () => {
  const { data: statuses, isLoading } = usePropertyStatuses();
  const createStatus = useCreatePropertyStatus();
  const updateStatus = useUpdatePropertyStatus();
  const deleteStatus = useDeletePropertyStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyStatusFormData>(initialForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const statusList = Array.isArray(statuses) ? statuses : [];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingId(s._id || s.id);
    setFormData({
      name: s.name || '',
      code: s.code || '',
      color: s.color || '#10b981',
      isActive: s.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const code = name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      code: editingId ? prev.code : code,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      color: formData.color,
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateStatus.mutateAsync({ id: editingId, data: payload });
      } else {
        await createStatus.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStatus.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Property Status Management
          </h2>
          <p className="text-sm text-gray-500">
            Lifecycle statuses according to PRD §14 (Available, Under Offer, Reserved, Sold, Off Market).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Status
        </button>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Preview Badge</th>
              <th className="py-3 px-4">Status Name</th>
              <th className="py-3 px-4">System Code</th>
              <th className="py-3 px-4">Active</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">Loading statuses...</td>
              </tr>
            ) : statusList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No statuses found.</td>
              </tr>
            ) : (
              statusList.map((s: any) => {
                const id = s._id || s.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: s.color || '#4f46e5' }}
                      >
                        {s.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{s.code}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateStatus.mutate({ id, data: { isActive: !s.isActive } })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 rounded transition"
                        title="Edit status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 rounded transition"
                        title="Delete status"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
            {editingId ? 'Edit Status' : 'Add Property Status'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Under Offer, Sold STC"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">System Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="UNDER_OFFER"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: p.hex })}
                    className="w-6 h-6 rounded-full border-2 transition"
                    style={{
                      backgroundColor: p.hex,
                      borderColor: formData.color === p.hex ? '#1e1b4b' : 'transparent',
                    }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Live Preview: </span>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ml-2"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name || 'Sample Status'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveStatus"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isActiveStatus" className="text-sm text-gray-700 font-medium">
              Active in property status dropdown
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
            >
              {editingId ? 'Save Changes' : 'Create Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">Are you sure you want to delete this status?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
