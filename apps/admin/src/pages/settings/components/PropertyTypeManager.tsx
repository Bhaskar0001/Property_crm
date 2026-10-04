import React, { useState } from 'react';
import {
  usePropertyTypes,
  useCreatePropertyType,
  useUpdatePropertyType,
  useDeletePropertyType,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Building, Search, CheckCircle2, XCircle } from 'lucide-react';

interface PropertyTypeFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

const initialForm: PropertyTypeFormData = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
};

export const PropertyTypeManager: React.FC = () => {
  const { data: propertyTypes, isLoading } = usePropertyTypes();
  const createType = useCreatePropertyType();
  const updateType = useUpdatePropertyType();
  const deleteType = useDeletePropertyType();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyTypeFormData>(initialForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const typeList = Array.isArray(propertyTypes) ? propertyTypes : [];

  const filteredTypes = typeList.filter((t: any) =>
    (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (pt: any) => {
    setEditingId(pt._id || pt.id);
    setFormData({
      name: pt.name || '',
      slug: pt.slug || '',
      description: pt.description || '',
      isActive: pt.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description.trim(),
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateType.mutateAsync({ id: editingId, data: payload });
      } else {
        await createType.mutateAsync(payload);
      }
      setModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteType.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            Property Types
          </h2>
          <p className="text-sm text-gray-500">Configure residential and commercial categories (e.g., Villa, Apartment, Penthouse).</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Property Type
        </button>
      </div>

      {/* Filter bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search property types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Type Name</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">Loading property types...</td>
              </tr>
            ) : filteredTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No property types found.</td>
              </tr>
            ) : (
              filteredTypes.map((pt: any) => {
                const id = pt._id || pt.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900">{pt.name}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        /{pt.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{pt.description || '—'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateType.mutate({ id, data: { isActive: !pt.isActive } })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          pt.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pt.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {pt.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(pt)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Edit property type"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete property type"
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
            {editingId ? 'Edit Property Type' : 'Add Property Type'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Villa, Apartment, Detached House"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">URL Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. villa, apartment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional overview or category guidelines..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActivePropType"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isActivePropType" className="text-sm text-gray-700 font-medium">
              Active in property editor & website filters
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
              disabled={createType.isPending || updateType.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Create Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this property type? Properties categorized under it may need reassignment.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
