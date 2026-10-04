import React, { useState } from 'react';
import {
  useCurrencies,
  useCreateCurrency,
  useUpdateCurrency,
  useDeleteCurrency,
  useSetDefaultCurrency,
  useSyncLiveExchangeRates,
} from '@/hooks/useAdminConfig';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Coins, Search, Star, CheckCircle2, XCircle, Sparkles, Calculator, ArrowRightLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { WORLD_CURRENCIES, WorldCurrency } from '@repo/shared';

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
}

const initialForm: CurrencyFormData = {
  code: '',
  name: '',
  symbol: '',
  exchangeRate: 1.0,
  isActive: true,
  isDefault: false,
};

export const CurrencyManager: React.FC = () => {
  const { data: currencies, isLoading } = useCurrencies();
  const createCurrency = useCreateCurrency();
  const updateCurrency = useUpdateCurrency();
  const deleteCurrency = useDeleteCurrency();
  const setDefaultCurrency = useSetDefaultCurrency();
  const syncLiveRates = useSyncLiveExchangeRates();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CurrencyFormData>(initialForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Autocomplete state
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [showCurrencySuggestions, setShowCurrencySuggestions] = useState(false);

  // Live FX Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(500000);
  const [calcFromCurrency, setCalcFromCurrency] = useState<string>('EUR');
  const [calcToCurrency, setCalcToCurrency] = useState<string>('INR');

  const currencyList = Array.isArray(currencies) ? currencies : [];

  const filteredCurrencies = currencyList.filter((c: any) =>
    (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const suggestedCurrencies = WORLD_CURRENCIES.filter((wc) =>
    wc.code.toLowerCase().includes(currencySearchQuery.toLowerCase()) ||
    wc.name.toLowerCase().includes(currencySearchQuery.toLowerCase())
  ).slice(0, 8);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setCurrencySearchQuery('');
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (curr: any) => {
    setEditingId(curr._id || curr.id);
    setFormData({
      code: curr.code || '',
      name: curr.name || '',
      symbol: curr.symbol || '',
      exchangeRate: curr.exchangeRate || 1.0,
      isActive: curr.isActive !== false,
      isDefault: !!curr.isDefault,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSelectWorldCurrency = (wc: WorldCurrency) => {
    setFormData({
      ...formData,
      code: wc.code,
      name: wc.name,
      symbol: wc.symbol,
      exchangeRate: wc.rateFromEUR,
    });
    setCurrencySearchQuery(wc.code);
    setShowCurrencySuggestions(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formData.code.trim().toUpperCase();
    const cleanName = formData.name.trim();

    if (!cleanCode) {
      setFormError('Currency code (e.g. USD, EUR, INR) is required.');
      return;
    }

    const payload = {
      code: cleanCode,
      name: cleanName || cleanCode,
      symbol: formData.symbol.trim() || cleanCode,
      exchangeRate: Number(formData.exchangeRate) || 1.0,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    };

    try {
      if (editingId) {
        await updateCurrency.mutateAsync({ id: editingId, data: payload });
      } else {
        await createCurrency.mutateAsync(payload);
      }
      setModalOpen(false);
      setFormData(initialForm);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err.message || 'Operation failed';
      setFormError(msg);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultCurrency.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.response?.data?.message || 'Unable to update base currency. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCurrency.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.response?.data?.message || 'Unable to remove currency. Please check if active property pricing relies on it.');
    }
  };

  const handleSyncLiveRates = async () => {
    setSyncStatus(null);
    try {
      const res: any = await syncLiveRates.mutateAsync();
      const updatedCount = res?.data?.updatedCount || res?.data?.data?.updatedCount || res?.updatedCount || 'all';
      const base = res?.data?.base || res?.data?.data?.base || 'EUR';
      setSyncStatus({
        type: 'success',
        message: `Successfully updated global exchange rates from live market feeds for ${updatedCount} currencies against ${base} base.`,
      });
      setTimeout(() => setSyncStatus(null), 8000);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err.message || 'Failed to sync live rates from Forex API';
      setSyncStatus({
        type: 'error',
        message: errMsg,
      });
    }
  };

  // Real calculation helper for the interactive widget
  const calculateConversion = () => {
    const fromObj = currencyList.find((c: any) => c.code === calcFromCurrency) || 
      WORLD_CURRENCIES.find((w) => w.code === calcFromCurrency);
    const toObj = currencyList.find((c: any) => c.code === calcToCurrency) || 
      WORLD_CURRENCIES.find((w) => w.code === calcToCurrency);

    const fromRate = fromObj?.exchangeRate || (fromObj as any)?.rateFromEUR || 1;
    const toRate = toObj?.exchangeRate || (toObj as any)?.rateFromEUR || 1;

    // Convert from source to EUR base, then to target
    const inBaseEUR = calcAmount / fromRate;
    const converted = inBaseEUR * toRate;
    const symbol = toObj?.symbol || '';

    return {
      converted: Math.round(converted).toLocaleString(),
      rate: (toRate / fromRate).toFixed(4),
      symbol,
    };
  };

  const calcResult = calculateConversion();

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Currency & Live Exchange Rate Management
          </h2>
          <p className="text-sm text-gray-500">Foreign exchange rates, automated multi-currency property pricing, and base financial currency configuration.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncLiveRates}
            disabled={syncLiveRates.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
            title="Synchronize latest market exchange rates from live currency feeds"
          >
            <RefreshCw className={`w-4 h-4 ${syncLiveRates.isPending ? 'animate-spin' : ''}`} />
            {syncLiveRates.isPending ? 'Updating Market Rates...' : 'Sync Market Rates'}
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Currency
          </button>
        </div>
      </div>

      {/* Sync Status Feedback Banner */}
      {syncStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            syncStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {syncStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{syncStatus.message}</span>
        </div>
      )}

      {/* Real-time FX Price Calculator Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">
              Live Real-Time Currency Conversion & Calculation
            </h3>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
            Live Market Conversion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Base Price / Amount</label>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">From Currency</label>
            <select
              value={calcFromCurrency}
              onChange={(e) => setCalcFromCurrency(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {WORLD_CURRENCIES.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.name} ({w.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center pt-5 sm:pt-0">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">To Currency (Target Price)</label>
            <select
              value={calcToCurrency}
              onChange={(e) => setCalcToCurrency(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {WORLD_CURRENCIES.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.name} ({w.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            1 {calcFromCurrency} = <span className="font-mono text-white font-bold">{calcResult.rate}</span> {calcToCurrency}
          </div>
          <div className="text-lg font-black text-amber-400 font-mono">
            Calculated Price: {calcResult.symbol} {calcResult.converted}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search currency code or name..."
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
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Currency Name</th>
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">Exchange Rate (vs EUR)</th>
              <th className="py-3 px-4">Default</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">Loading currencies...</td>
              </tr>
            ) : filteredCurrencies.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">No currencies configured. Click "Add Currency" above.</td>
              </tr>
            ) : (
              filteredCurrencies.map((c: any) => {
                const id = c._id || c.id;
                return (
                  <tr key={id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{c.code}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs">
                        {c.symbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-indigo-700 font-bold">
                      {c.exchangeRate ? `${c.exchangeRate}x` : '1.0x'}
                    </td>
                    <td className="py-3 px-4">
                      {c.isDefault ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Default Base
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                        >
                          Make Default
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateCurrency.mutate({ id, data: { isActive: !c.isActive } })}
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
                        title="Edit currency"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!c.isDefault && (
                        <button
                          onClick={() => setDeleteConfirmId(id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete currency"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
              {editingId ? 'Edit Currency' : 'Add Currency'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select or search official ISO world currencies with live baseline exchange rates.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick World Currency Selector */}
          {!editingId && (
            <div className="relative bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Search Currency Directory (Auto-Fill)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search code or name (e.g. INR, USD, EUR, GBP, AED, CAD...)"
                  value={currencySearchQuery}
                  onChange={(e) => {
                    setCurrencySearchQuery(e.target.value);
                    setShowCurrencySuggestions(true);
                  }}
                  onFocus={() => setShowCurrencySuggestions(true)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {showCurrencySuggestions && (
                <div className="absolute left-3 right-3 z-30 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl divide-y divide-gray-100">
                  {suggestedCurrencies.map((wc) => (
                    <button
                      key={wc.code}
                      type="button"
                      onClick={() => handleSelectWorldCurrency(wc)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between transition"
                    >
                      <span className="font-semibold text-gray-800">
                        {wc.code} — {wc.name} ({wc.symbol})
                      </span>
                      <span className="text-indigo-600 font-mono text-[11px]">
                        Rate: {wc.rateFromEUR}x
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Popular Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'CHF', 'JPY'].map((cCode) => {
                  const item = WORLD_CURRENCIES.find((w) => w.code === cCode);
                  if (!item) return null;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleSelectWorldCurrency(item)}
                      className="px-2 py-1 bg-white hover:bg-indigo-50 border border-gray-200 rounded-md text-[11px] font-medium text-gray-700 flex items-center gap-1 transition shadow-xs"
                    >
                      <span className="font-bold">{item.code}</span>
                      <span className="text-gray-400">({item.symbol})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ISO Code (3 Letters) *</label>
              <input
                type="text"
                required
                maxLength={3}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="EUR, USD, INR"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Currency Symbol *</label>
              <input
                type="text"
                required
                maxLength={5}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="€, $, ₹, £"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Currency Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Euro, US Dollar, Indian Rupee"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Exchange Rate (relative to base EUR=1.0) *</label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.exchangeRate}
              onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 1.0 })}
              placeholder="e.g. 91.2 for INR, 1.09 for USD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">Used for real-time automatic property price calculations</span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefaultCurrency"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="isDefaultCurrency" className="text-sm text-gray-700 font-medium">
                Set as default system currency
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveCurrency"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="isActiveCurrency" className="text-sm text-gray-700 font-medium">
                Active for exchange rate calculations & price displays
              </label>
            </div>
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
              disabled={createCurrency.isPending || updateCurrency.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Create Currency'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this currency? Any active pricing relying on it will revert to the default currency.
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
