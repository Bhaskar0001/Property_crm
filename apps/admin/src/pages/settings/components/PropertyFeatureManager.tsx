import React, { useState } from 'react';
import {
  usePropertyFeatures,
  useCreatePropertyFeature,
  useUpdatePropertyFeature,
  useDeletePropertyFeature,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Sparkles, Search, CheckCircle2, XCircle } from 'lucide-react';

interface FeatureFormData {
  name: string;
  category: string;
  icon: string;
  isActive: boolean;
}

const initialForm: FeatureFormData = {
  name: '',
  category: 'Interior',
  icon: 'check',
  isActive: true,
};

const CATEGORIES = ['Interior', 'Exterior', 'Security', 'Eco & Energy', 'Luxury', 'Community'];

export const PropertyFeatureManager: React.FC = () => {
  const { data: features, isLoading } = usePropertyFeatures();
  const createFeature = useCreatePropertyFeature();
  const updateFeature = useUpdatePropertyFeature();
  const deleteFeature = useDeletePropertyFeature();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeatureFormData>(initialForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const featureList = Array.isArray(features) ? features : [];

  const filteredFeatures = featureList.filter((f: any) => {
    const matchesSearch = (f.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditingId(f._id || f.id);
    setFormData({
      name: f.name || '',
      category: f.category || 'Interior',
      icon: f.icon || 'check',
      isActive: f.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      icon: formData.icon.trim() || 'check',
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await updateFeature.mutateAsync({ id: editingId, data: payload });
      } else {
        await createFeature.mutateAsync(payload);
      }
      setModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFeature.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Property Features & Amenities
          </h2>
          <p className="text-sm text-gray-500">Configure checkboxes available for property marketing (Swimming Pool, Balcony, Heat Pump, etc.).</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Feature
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="py-3 px-4">Feature Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Icon Identifier</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">Loading features...</td>
              </tr>
            ) : filteredFeatures.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">No property features found.</td>
              </tr>
            ) : (
              filteredFeatures.map((f: any) => {
                const id = f._id || f.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900">{f.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {f.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{f.icon || 'check'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateFeature.mutate({ id, data: { isActive: !f.isActive } })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          f.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {f.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 rounded transition"
                        title="Edit feature"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 rounded transition"
                        title="Delete feature"
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
            {editingId ? 'Edit Property Feature' : 'Add Property Feature'}
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Feature Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Underfloor Heating, Balcony, Sea View"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Icon Keyword</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. pool, wifi, sun"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveFeature"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isActiveFeature" className="text-sm text-gray-700 font-medium">
              Active in property editor
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
              {editingId ? 'Save Changes' : 'Create Feature'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">Are you sure you want to delete this feature?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
