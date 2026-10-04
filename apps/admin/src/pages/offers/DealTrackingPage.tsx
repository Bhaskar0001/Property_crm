import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  Building,
  Tag,
  DollarSign,
  ArrowRight,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useDeals, useUpdateDealStage, Offer } from '../../hooks/useOffers';

const DEAL_STAGES: {
  key: 'offer_accepted' | 'solicitor_instructed' | 'survey_valuation' | 'contracts_exchanged' | 'completed';
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    key: 'offer_accepted',
    label: 'Offer Accepted',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Initial agreement & booking deposit placed',
  },
  {
    key: 'solicitor_instructed',
    label: 'Solicitor Instructed',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Title deeds & legal contracts in preparation',
  },
  {
    key: 'survey_valuation',
    label: 'Survey & Valuation',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Bank valuation & structural survey in progress',
  },
  {
    key: 'contracts_exchanged',
    label: 'Contracts Exchanged',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Legally binding deposit paid & completion date set',
  },
  {
    key: 'completed',
    label: 'Completed / Keys',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Final funds transferred & ownership transferred',
  },
];

export function DealTrackingPage() {
  const { data, isLoading } = useDeals();
  const updateStageMutation = useUpdateDealStage();

  const totalDeals = data?.totalDeals || 0;
  const totalVolume = data?.totalVolume || 0;
  const grouped = data?.grouped || {};

  const [commissionRate, setCommissionRate] = useState<number>(2.0);
  const estimatedCommission = (totalVolume * commissionRate) / 100;

  const handleAdvanceStage = (
    offer: Offer,
    currentStage: typeof DEAL_STAGES[number]['key']
  ) => {
    const currentIndex = DEAL_STAGES.findIndex((s) => s.key === currentStage);
    if (currentIndex < DEAL_STAGES.length - 1) {
      const nextStage = DEAL_STAGES[currentIndex + 1].key;
      updateStageMutation.mutate({
        id: offer._id,
        dealStage: nextStage,
      });
    }
  };

  const handleStageSelect = (
    offerId: string,
    newStage: typeof DEAL_STAGES[number]['key']
  ) => {
    updateStageMutation.mutate({
      id: offerId,
      dealStage: newStage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Deal Conveyancing & Commission Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track legal conveyancing milestones, contract exchanges, escrow deposits, and projected agency fees.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-gray-200 rounded-md shadow-xs text-xs">
            <span className="text-gray-500 font-medium">Agency Fee Rate:</span>
            <select
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="font-bold text-[#004274] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={1.5}>1.5%</option>
              <option value={2.0}>2.0% (Standard)</option>
              <option value={2.5}>2.5%</option>
              <option value={3.0}>3.0% (Prime)</option>
            </select>
          </div>
          <Link
            to="/offers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Tag className="w-4 h-4 mr-2 text-primary" />
            All Offers
          </Link>
        </div>
      </div>

      {/* KPI Overview (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Deals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalDeals}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Agreed Volume
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              €{totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Est. Commission
              </p>
              <span className="text-[10px] font-bold text-[#004274] bg-blue-50 px-1.5 py-0.2 rounded">
                {commissionRate}%
              </span>
            </div>
            <p className="text-2xl font-bold text-[#004274] mt-1">
              €{Math.round(estimatedCommission).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#004274]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed Deals
            </p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {grouped['completed']?.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {isLoading ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-lg border">
          Loading deal pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[600px] pb-4">
          {DEAL_STAGES.map((stage, colIdx) => {
            const stageDeals: Offer[] = grouped[stage.key] || [];

            return (
              <div
                key={stage.key}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex flex-col min-w-[240px]"
              >
                {/* Column Header */}
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      {stage.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{stage.description}</p>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 border border-dashed rounded-md bg-white/50">
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const symbol = deal.currency?.symbol || '€';

                      return (
                        <div
                          key={deal._id}
                          className="bg-white p-3 rounded-md shadow-xs border border-gray-200 hover:shadow-md transition space-y-2.5"
                        >
                          {/* Property Mini Header */}
                          <div className="flex items-center space-x-2">
                            {deal.property?.coverImage ? (
                              <img
                                src={deal.property.coverImage}
                                alt=""
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Building className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {deal.property?.title}
                              </p>
                              <p className="text-[10px] text-gray-500 flex items-center mt-0.5">
                                <MapPin className="w-3 h-3 mr-0.5" />
                                {deal.property?.city || 'Location unset'}
                              </p>
                            </div>
                          </div>

                          {/* Financials & Buyer */}
                          <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">Agreed Price:</span>
                              <span className="font-bold text-emerald-600">
                                {symbol}
                                {deal.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">Agency Fee ({commissionRate}%):</span>
                              <span className="font-semibold text-[#004274]">
                                {symbol}
                                {Math.round((deal.amount * commissionRate) / 100).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-gray-500">Buyer:</span>
                              <span className="font-medium text-gray-800 truncate max-w-[120px]">
                                {deal.buyerName || deal.customer?.name || 'Client'}
                              </span>
                            </div>
                            <div className="pt-1 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                              <span className="text-gray-500 flex items-center">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                                Escrow Deposit:
                              </span>
                              <span className="font-semibold text-slate-700">
                                {stage.key === 'completed'
                                  ? 'Disbursed'
                                  : stage.key === 'contracts_exchanged'
                                  ? '10% Bound'
                                  : 'Deposit Held'}
                              </span>
                            </div>
                          </div>

                          {/* Stage Transition Control */}
                          <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
                            <select
                              value={stage.key}
                              onChange={(e) =>
                                handleStageSelect(deal._id, e.target.value as any)
                              }
                              className="text-[10px] border border-gray-200 rounded p-1 bg-white text-gray-700"
                            >
                              {DEAL_STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>

                            {colIdx < DEAL_STAGES.length - 1 && (
                              <button
                                onClick={() => handleAdvanceStage(deal, stage.key)}
                                className="text-[11px] font-semibold text-primary hover:text-primary-dark flex items-center"
                                title="Advance to next stage"
                              >
                                Advance <ArrowRight className="w-3 h-3 ml-0.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
