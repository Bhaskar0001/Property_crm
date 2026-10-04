import React, { useState } from 'react';
import { useStaffList, useCreateStaff, useToggleStaffActive } from '../../hooks/useAdminConfig';
import { Link } from 'react-router-dom';
import { Modal } from '@/components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Shield,
  Briefcase,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface CreateStaffFormData {
  name: string;
  email: string;
  phone: string;
  team: string;
  role: string;
  password: string;
  isActive: boolean;
}

const initialForm: CreateStaffFormData = {
  name: '',
  email: '',
  phone: '',
  team: 'sales',
  role: 'staff',
  password: 'Password123!',
  isActive: true,
};

const TEAMS = [
  { value: 'sales', label: 'Sales Team' },
  { value: 'telecaller', label: 'Telecaller / Inbound' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'management', label: 'Management' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'support', label: 'Customer Support' },
];

export const StaffListPage: React.FC = () => {
  const { data: staffData, isLoading } = useStaffList();
  const createStaff = useCreateStaff();
  const toggleActive = useToggleStaffActive();

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateStaffFormData>(initialForm);

  const rawStaff = Array.isArray(staffData)
    ? staffData
    : Array.isArray((staffData as any)?.staff)
    ? (staffData as any).staff
    : [];

  const filteredStaff = rawStaff.filter((s: any) => {
    const matchesSearch =
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'ALL' || s.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      password: `Pass${Math.floor(Math.random() * 899999 + 100000)}!`,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    try {
      await createStaff.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        team: formData.team,
        role: formData.role,
        password: formData.password,
        isActive: formData.isActive,
      });
      setModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Failed to create staff member');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff & Team Management</h1>
              <p className="text-sm text-gray-500">
                Manage advisory staff, role permissions, territory scoping, and account security.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by staff name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-600">Team Filter:</label>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Departments</option>
            {TEAMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Staff Member</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Department & Role</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">Loading staff records...</td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">No staff members found matching criteria.</td>
              </tr>
            ) : (
              filteredStaff.map((s: any) => {
                const staffId = s._id || s.id;
                const initials = (s.name || 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                const isRoleAdmin = (s.role || '').toLowerCase() === 'admin';

                return (
                  <tr key={staffId} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {initials}
                        </div>
                        <div>
                          <Link
                            to={`/staff/${staffId}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition"
                          >
                            {s.name}
                          </Link>
                          <div className="text-xs text-gray-400 capitalize">{s.role || 'Staff'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-gray-900 font-medium">{s.email}</div>
                      <div className="text-xs text-gray-500">{s.phone || 'No phone'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isRoleAdmin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {isRoleAdmin ? 'Administrator' : 'Staff'}
                        </span>
                        {s.team && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            {s.team}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleActive.mutate({ id: staffId, active: !s.isActive })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {s.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {s.lastLogin ? new Date(s.lastLogin).toLocaleString() : 'Never logged in'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/staff/${staffId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Add Staff Member
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@agency.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+353 87 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Team</label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="staff">Staff (Scoped permissions)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Temporary Initial Password</label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">The user will be required to change this on first login.</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isStaffActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isStaffActive" className="text-sm text-gray-700 font-medium">
              Activate account immediately
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
              disabled={createStaff.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
