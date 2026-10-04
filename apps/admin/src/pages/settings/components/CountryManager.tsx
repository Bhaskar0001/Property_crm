import React, { useState, useMemo } from 'react';
import {
  useCountries,
  useCurrencies,
  useCreateCountry,
  useUpdateCountry,
  useDeleteCountry,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Globe, Search, CheckCircle2, XCircle, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { WORLD_COUNTRIES, WorldCountry } from '@repo/shared';
import { CountryFlag } from '@/components/common/CountryFlag';

interface CountryFormData {
  name: string;
  code: string;
  currency?: string;
  phoneCode?: string;
  flag?: string;
  flagUrl?: string;
  imageUrl?: string;
  isActive: boolean;
}

const initialForm: CountryFormData = {
  name: '',
  code: '',
  currency: '',
  phoneCode: '',
  flag: '',
  flagUrl: '',
  imageUrl: '',
  isActive: true,
};

export const CountryManager: React.FC = () => {
  const { data: countries, isLoading } = useCountries();
  const { data: currencies } = useCurrencies();
  const createCountry = useCreateCountry();
  const updateCountry = useUpdateCountry();
  const deleteCountry = useDeleteCountry();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CountryFormData>(initialForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Country directory autocomplete filter
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  const countryList = Array.isArray(countries) ? countries : [];
  const currencyList = Array.isArray(currencies) ? currencies : [];

  const filteredCountries = countryList.filter((c: any) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.code || c.isoCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneCode || '').includes(search)
  );

  const suggestedCountries = useMemo(() => {
    const q = countrySearchQuery.toLowerCase().trim();
    if (!q) {
      return WORLD_COUNTRIES; // Full worldwide directory (all 250+ countries & territories)
    }
    return WORLD_COUNTRIES.filter((wc) =>
      wc.name.toLowerCase().includes(q) ||
      wc.isoCode.toLowerCase().includes(q) ||
      (wc.phoneCode && wc.phoneCode.includes(q)) ||
      wc.currencyCode.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError(null);
    setCountrySearchQuery('');
    setModalOpen(true);
  };

  const handleOpenEdit = (country: any) => {
    const code = country.code || country.isoCode || '';
    const matchedWorld = WORLD_COUNTRIES.find(
      (wc) => wc.isoCode.toUpperCase() === code.toUpperCase() || wc.name.toLowerCase() === (country.name || '').toLowerCase()
    );

    setEditingId(country._id || country.id);
    setFormData({
      name: country.name || '',
      code: code,
      currency: country.currency?._id || country.currency || '',
      phoneCode: country.phoneCode || '',
      flag: country.flag || matchedWorld?.flag || '',
      flagUrl: country.flagUrl || matchedWorld?.flagUrl || (code ? `https://flagcdn.com/w80/${code.toLowerCase()}.png` : ''),
      imageUrl: country.imageUrl || matchedWorld?.imageUrl || '',
      isActive: country.isActive !== false,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSelectWorldCountry = (wc: WorldCountry) => {
    // Attempt to match currency by code in database
    const matchedCurrency = currencyList.find(
      (c: any) => c.code?.toUpperCase() === wc.currencyCode?.toUpperCase()
    );

    setFormData({
      ...formData,
      name: wc.name,
      code: wc.isoCode,
      phoneCode: wc.phoneCode,
      currency: matchedCurrency ? (matchedCurrency._id || matchedCurrency.id) : formData.currency,
      flag: wc.flag,
      flagUrl: wc.flagUrl,
      imageUrl: wc.imageUrl,
    });
    setCountrySearchQuery(wc.name);
    setShowCountrySuggestions(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let cleanName = formData.name.trim();
    let cleanCode = formData.code.trim().toUpperCase();
    let cleanPhone = formData.phoneCode?.trim() || '';

    if (!cleanName) {
      setFormError('Country Name is required.');
      return;
    }

    // Auto-fix if user typed numeric code or empty code
    if (!cleanCode || /^\d+$/.test(cleanCode)) {
      const match = WORLD_COUNTRIES.find(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase() || c.phoneCode.replace('+', '') === cleanCode
      );
      if (match) {
        cleanCode = match.isoCode;
        if (!cleanPhone) cleanPhone = match.phoneCode;
      } else {
        cleanCode = cleanName.substring(0, 2).toUpperCase();
      }
    }

    // Ensure phone prefix has a + if numeric
    if (cleanPhone && !cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    const matchedWorld = WORLD_COUNTRIES.find(
      (c) => c.isoCode.toUpperCase() === cleanCode || c.name.toLowerCase() === cleanName.toLowerCase()
    );

    const finalFlagUrl = formData.flagUrl || matchedWorld?.flagUrl || `https://flagcdn.com/w80/${cleanCode.toLowerCase()}.png`;
    const finalImageUrl = formData.imageUrl || matchedWorld?.imageUrl || '';
    const finalFlagEmoji = formData.flag || matchedWorld?.flag || '🌐';

    const payload: any = {
      name: cleanName,
      code: cleanCode,
      isoCode: cleanCode,
      phoneCode: cleanPhone,
      flag: finalFlagEmoji,
      flagUrl: finalFlagUrl,
      imageUrl: finalImageUrl,
      isActive: formData.isActive,
    };
    if (formData.currency) payload.currency = formData.currency;

    try {
      if (editingId) {
        await updateCountry.mutateAsync({ id: editingId, data: payload });
      } else {
        await createCountry.mutateAsync(payload);
      }
      setModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || 'Operation failed';
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCountry.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.response?.data?.message || 'Unable to remove country. Please ensure no active listings are currently assigned to it.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Country Management
          </h2>
          <p className="text-sm text-gray-500">Configure operative global countries with national flags, photography, and local currencies.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Country
        </button>
      </div>

      {/* Filter bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by country, code, or phone prefix..."
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
              <th className="py-3 px-4">Country & Flag</th>
              <th className="py-3 px-4">ISO Code</th>
              <th className="py-3 px-4">Phone Prefix</th>
              <th className="py-3 px-4">Currency</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">Loading countries...</td>
              </tr>
            ) : filteredCountries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No countries found. Click "Add Country" to configure one.</td>
              </tr>
            ) : (
              filteredCountries.map((c: any) => {
                const id = c._id || c.id;
                const currencyName = typeof c.currency === 'object' ? `${c.currency.code} (${c.currency.symbol || ''})` : c.currency;
                const isoCode = (c.code || c.isoCode || '').toUpperCase();
                const matchedWorld = WORLD_COUNTRIES.find((wc) => wc.isoCode.toUpperCase() === isoCode);
                const flagUrl = c.flagUrl || matchedWorld?.flagUrl || (isoCode ? `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png` : '');
                const coverImg = c.imageUrl || matchedWorld?.imageUrl;

                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {coverImg ? (
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                            <img
                              src={coverImg}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <CountryFlag
                              code={isoCode}
                              name={c.name}
                              flagUrl={flagUrl}
                              size="md"
                            />
                            <span className="font-bold text-gray-900">{c.name}</span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {c.phoneCode ? `${c.phoneCode}` : ''} {currencyName ? `• ${currencyName}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded font-bold">
                        {isoCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 font-medium">
                      {c.phoneCode ? c.phoneCode : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{currencyName || '—'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateCountry.mutate({ id, data: { isActive: !c.isActive } })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {c.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                        title="Edit country"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete country"
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
          <div className="border-b pb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Country' : 'Add Country'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any country or territory to auto-populate official flags, ISO codes, phone prefixes, and currencies.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Real World Country Selector */}
          {!editingId && (
            <div className="relative bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Country Directory (Auto-Fill Standards)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type to search (e.g. India, United States, UAE, Ireland, Spain, Canada...)"
                  value={countrySearchQuery}
                  onChange={(e) => {
                    setCountrySearchQuery(e.target.value);
                    setShowCountrySuggestions(true);
                  }}
                  onFocus={() => setShowCountrySuggestions(true)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {showCountrySuggestions && (
                <div className="absolute left-3 right-3 z-30 mt-1 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl divide-y divide-gray-100">
                  <div className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs px-3 py-1.5 flex items-center justify-between border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <span>Worldwide Directory ({suggestedCountries.length} Countries & Territories)</span>
                    <button
                      type="button"
                      onClick={() => setShowCountrySuggestions(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  {suggestedCountries.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No country found matching "{countrySearchQuery}"
                    </div>
                  ) : (
                    suggestedCountries.map((wc) => (
                      <button
                        key={wc.isoCode}
                        type="button"
                        onClick={() => handleSelectWorldCountry(wc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-7 rounded-sm overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                            <img
                              src={wc.imageUrl}
                              alt={wc.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <CountryFlag code={wc.isoCode} name={wc.name} flagUrl={wc.flagUrl} size="sm" />
                          <div>
                            <span className="font-semibold text-gray-800">{wc.name}</span>
                            <span className="ml-1 text-gray-400 font-mono text-[11px]">({wc.isoCode})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-indigo-600 font-mono font-medium block">
                            {wc.phoneCode}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {wc.currencyCode} ({wc.currencySymbol})
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Quick popular badges with real flags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['India', 'United Arab Emirates', 'United Kingdom', 'United States', 'Ireland', 'Spain', 'Germany', 'Canada', 'Australia', 'Japan'].map((cName) => {
                  const item = WORLD_COUNTRIES.find((w) => w.name === cName);
                  if (!item) return null;
                  return (
                    <button
                      key={item.isoCode}
                      type="button"
                      onClick={() => handleSelectWorldCountry(item)}
                      className="px-2 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-md text-[11px] font-medium text-gray-700 flex items-center gap-1.5 transition shadow-xs"
                    >
                      <CountryFlag code={item.isoCode} name={item.name} flagUrl={item.flagUrl} size="xs" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real-World Country Visual Preview Card */}
          {(formData.name || formData.imageUrl) && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5">
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Country Cover"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CountryFlag
                    code={formData.code}
                    name={formData.name}
                    flagUrl={formData.flagUrl}
                    size="lg"
                    className="border-2 border-white/80 shadow-md"
                  />
                  <div>
                    <h4 className="text-base font-bold text-white drop-shadow-sm flex items-center gap-1.5">
                      {formData.name || 'Country Name'}
                      {formData.code && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">
                          {formData.code}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-200 drop-shadow-xs flex items-center gap-2 mt-0.5">
                      {formData.phoneCode && <span>Prefix: <b>{formData.phoneCode}</b></span>}
                      {formData.currency && (
                        <span>• Currency: <b>{currencyList.find((c: any) => (c._id || c.id) === formData.currency)?.code || formData.currency}</b></span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/80 text-white">
                  Verified Standard
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Country Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. India, Spain, Ireland, United States"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ISO / Country Code (2 Letters) *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. IN, ES, IE, US"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Official 2-letter ISO (e.g. IN for India)</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Prefix</label>
              <input
                type="text"
                value={formData.phoneCode}
                onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
                placeholder="e.g. +91, +353, +1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">International dialing code</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Currency...</option>
              {currencyList.map((curr: any) => (
                <option key={curr._id || curr.id} value={curr._id || curr.id}>
                  {curr.code} — {curr.name} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Country Cover Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Country Cover Image URL (Landscape Photo)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Country Official Flag Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Official Flag Image URL (Auto-filled from FlagCDN)</label>
            <input
              type="url"
              value={formData.flagUrl}
              onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
              placeholder="https://flagcdn.com/w80/in.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCountry"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="isActiveCountry" className="text-sm text-gray-700 font-medium">
              Enable country for property listings & public search
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
              disabled={createCountry.isPending || updateCountry.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Create Country'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this country? Properties associated with this country might need to be reassigned.
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
