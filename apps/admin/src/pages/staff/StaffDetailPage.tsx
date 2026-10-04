import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useStaffMember,
  useUpdateStaffPermissions,
  useResetStaffPassword,
  useToggleStaffActive,
  useCountries,
  usePropertyTypes,
} from '../../hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import {
  ArrowLeft,
  Shield,
  Key,
  Globe,
  Building,
  CheckCircle2,
  XCircle,
  Save,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';

const PERMISSION_CATEGORIES = [
  {
    category: 'Properties & Inventory',
    permissions: [
      { key: 'properties.view', label: 'View Properties', desc: 'Browse and search property listings' },
      { key: 'properties.create', label: 'Create Properties', desc: 'Add new property records' },
      { key: 'properties.edit', label: 'Edit Properties', desc: 'Update specifications, pricing, details' },
      { key: 'properties.delete', label: 'Delete Properties', desc: 'Delete properties from the system' },
      { key: 'properties.publish', label: 'Publish / Unpublish', desc: 'Toggle property visibility on website' },
      { key: 'properties.media.upload', label: 'Upload Media', desc: 'Add photos, videos, and floor plans' },
      { key: 'properties.documents.view', label: 'View Documents', desc: 'Access internal deeds and certificates' },
      { key: 'properties.documents.upload', label: 'Upload Documents', desc: 'Upload contracts, titles, and legal PDFs' },
    ],
  },
  {
    category: 'Leads & Client CRM',
    permissions: [
      { key: 'leads.view', label: 'View Leads', desc: 'Access client enquiries and CRM board' },
      { key: 'leads.create', label: 'Create Leads', desc: 'Register new prospective buyers or sellers' },
      { key: 'leads.edit', label: 'Edit Leads', desc: 'Update stages, requirements, notes, tasks' },
      { key: 'leads.assign', label: 'Assign Leads', desc: 'Reassign leads between advisors' },
      { key: 'customers.manage', label: 'Manage Customers', desc: 'View and edit customer profile records' },
    ],
  },
  {
    category: 'Viewings & Offers',
    permissions: [
      { key: 'viewings.view', label: 'View Viewings', desc: 'Access appointments calendar' },
      { key: 'viewings.manage', label: 'Manage Viewings', desc: 'Schedule, reschedule, log feedback' },
      { key: 'offers.view', label: 'View Offers', desc: 'View submitted offers and negotiation history' },
      { key: 'offers.manage', label: 'Manage Offers', desc: 'Submit, accept, reject or counter offers' },
    ],
  },
  {
    category: 'WhatsApp & Communications',
    permissions: [
      { key: 'whatsapp.view', label: 'View WhatsApp', desc: 'Read live customer WhatsApp conversations' },
      { key: 'whatsapp.send', label: 'Send Messages', desc: 'Send direct WhatsApp messages & property cards' },
      { key: 'whatsapp.campaigns', label: 'Bulk Campaigns', desc: 'Launch targeted broadcast campaigns' },
    ],
  },
  {
    category: 'Analytics & Administration',
    permissions: [
      { key: 'analytics.view', label: 'View Analytics', desc: 'Access executive dashboards & KPI reports' },
      { key: 'staff.manage', label: 'Manage Staff', desc: 'Create and configure team accounts' },
      { key: 'settings.manage', label: 'Manage Settings', desc: 'Configure system lookup tables' },
    ],
  },
];

export const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const staffId = id || '';

  const { data: staff, isLoading } = useStaffMember(staffId);
  const updatePermissions = useUpdateStaffPermissions();
  const resetPassword = useResetStaffPassword();
  const toggleActive = useToggleStaffActive();
  const { data: countries } = useCountries();
  const { data: propertyTypes } = usePropertyTypes();

  // Local state for permissions
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [scopeType, setScopeType] = useState<'all' | 'assigned' | 'country'>('all');
  const [featureAccess, setFeatureAccess] = useState<string[]>([]);

  // Password reset modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const countryList = Array.isArray(countries) ? countries : [];
  const typeList = Array.isArray(propertyTypes) ? propertyTypes : [];

  useEffect(() => {
    if (staff) {
      setSelectedPermissions(staff.permissions || []);
      setSelectedCountries((staff.countryAccess || []).map((c: any) => (typeof c === 'object' ? c._id : c)));
      setSelectedPropertyTypes((staff.propertyTypeAccess || []).map((t: any) => (typeof t === 'object' ? t._id : t)));
      setScopeType(staff.propertyAccessScope?.type || 'all');
      setFeatureAccess(staff.featureAccess || []);
    }
  }, [staff]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading staff details...</div>;
  if (!staff) return <div className="p-8 text-center text-rose-500">Staff member not found.</div>;

  const isRoleAdmin = (staff.role || '').toLowerCase() === 'admin';

  // Toggle individual permission
  const handleTogglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  // Select all / Deselect all in category
  const handleToggleCategory = (permKeys: string[]) => {
    const allSelected = permKeys.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !permKeys.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...permKeys])));
    }
  };

  const handleToggleCountry = (countryId: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryId) ? prev.filter((c) => c !== countryId) : [...prev, countryId]
    );
  };

  const handleTogglePropertyType = (typeId: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSaveAllPermissions = async () => {
    try {
      await updatePermissions.mutateAsync({
        id: staffId,
        permissions: {
          permissions: selectedPermissions,
          countryAccess: selectedCountries,
          propertyTypeAccess: selectedPropertyTypes,
          featureAccess,
          propertyAccessScope: {
            type: scopeType,
            countries: selectedCountries,
          },
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Failed to update permissions');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: staffId, data: { newPassword } });
      alert('Password has been successfully updated. The staff member will be prompted to change it on next login.');
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/staff"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff Directory
        </Link>
      </div>

      {/* Staff Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {(staff.name || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isRoleAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isRoleAdmin ? 'Administrator' : 'Advisor / Staff'}
              </span>
            </div>
            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span>{staff.email}</span>
              {staff.phone && <span>• {staff.phone}</span>}
              <span>• Team: <strong className="text-gray-700 capitalize">{staff.team || 'Sales'}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleActive.mutate({ id: staffId, active: !staff.isActive })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              staff.isActive
                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {staff.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {staff.isActive ? 'Suspend Account' : 'Activate Account'}
          </button>

          <button
            onClick={() => {
              setNewPassword(`Pass${Math.floor(Math.random() * 899999 + 100000)}!`);
              setResetModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            <Key className="w-4 h-4 text-gray-500" />
            Reset Password
          </button>

          <button
            onClick={handleSaveAllPermissions}
            disabled={updatePermissions.isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Permissions and territory access updated successfully!
        </div>
      )}

      {isRoleAdmin && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs">
          <strong>Note:</strong> As an Administrator, this user inherently has full system access to all modules, records, and territories. Granular restrictions below apply if role is set to Staff.
        </div>
      )}

      {/* Main Grid: Permissions & Scopes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Granular Permission Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Granular Permission Matrix
                </h2>
                <p className="text-xs text-gray-500">Fine-grained capabilities for CRM, inventory, viewings, and offers.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allKeys = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key));
                    setSelectedPermissions(allKeys);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedPermissions([])}
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {PERMISSION_CATEGORIES.map((cat) => {
                const catKeys = cat.permissions.map((p) => p.key);
                const allCatSelected = catKeys.every((k) => selectedPermissions.includes(k));

                return (
                  <div key={cat.category} className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 px-3.5 py-2 rounded-lg">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{cat.category}</span>
                      <button
                        onClick={() => handleToggleCategory(catKeys)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        {allCatSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        {allCatSelected ? 'Deselect Category' : 'Select Category'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {cat.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                              isChecked
                                ? 'bg-indigo-50/50 border-indigo-200'
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.key)}
                              className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <div>
                              <div className="text-xs font-bold text-gray-900">{perm.label}</div>
                              <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{perm.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Scope, Countries & Property Types */}
        <div className="space-y-6">
          {/* Territory Scope Rule */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              Property Access Scope
            </h3>
            <div className="space-y-2">
              {[
                { type: 'all', title: 'Global Access', desc: 'Can view/manage properties across all countries' },
                { type: 'country', title: 'Scoped by Country', desc: 'Restricted strictly to checked countries below' },
                { type: 'assigned', title: 'Assigned Only', desc: 'Only properties or leads explicitly assigned to them' },
              ].map((s) => (
                <label
                  key={s.type}
                  className={`block p-3 rounded-xl border cursor-pointer transition ${
                    scopeType === s.type ? 'border-indigo-600 bg-indigo-50/40' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="scopeType"
                      value={s.type}
                      checked={scopeType === s.type}
                      onChange={() => setScopeType(s.type as any)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-gray-900">{s.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 pl-5">{s.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Country Access Checkboxes */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Territory / Country Access
              </h3>
              <span className="text-xs text-gray-400">{selectedCountries.length} active</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {countryList.length === 0 ? (
                <p className="text-xs text-gray-400">No countries configured in settings.</p>
              ) : (
                countryList.map((c: any) => {
                  const id = c._id || c.id;
                  const isChecked = selectedCountries.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-xs cursor-pointer"
                    >
                      <span className="font-medium text-gray-800">{c.name} ({c.code || c.isoCode})</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCountry(id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Property Types Access */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                Property Type Scoping
              </h3>
              <span className="text-xs text-gray-400">{selectedPropertyTypes.length} selected</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {typeList.length === 0 ? (
                <p className="text-xs text-gray-400">No property types configured.</p>
              ) : (
                typeList.map((pt: any) => {
                  const id = pt._id || pt.id;
                  const isChecked = selectedPropertyTypes.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-xs cursor-pointer"
                    >
                      <span className="font-medium text-gray-800">{pt.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePropertyType(id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)}>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            Reset Staff Password
          </h3>
          <p className="text-xs text-gray-500">
            Set a temporary password for <strong>{staff.name}</strong> ({staff.email}). They will be required to change it on their next login.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Temporary Password *</label>
            <input
              type="text"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
