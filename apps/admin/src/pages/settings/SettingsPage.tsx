import React, { useState } from 'react';
import { CountryManager } from './components/CountryManager';
import { CurrencyManager } from './components/CurrencyManager';
import { PropertyTypeManager } from './components/PropertyTypeManager';
import { ListingAndTenureManager } from './components/ListingAndTenureManager';
import { PropertyStatusManager } from './components/PropertyStatusManager';
import { PropertyFeatureManager } from './components/PropertyFeatureManager';
import { LeadPipelineManager } from './components/LeadPipelineManager';
import { AdvisoryContactManager } from './components/AdvisoryContactManager';
import {
  Globe,
  Coins,
  Building,
  Tag,
  Activity,
  Sparkles,
  GitFork,
  Sliders,
  PhoneCall,
} from 'lucide-react';

const TABS = [
  { id: 'advisory-contact', label: 'Advisory & Direct Call', icon: PhoneCall },
  { id: 'countries', label: 'Countries', icon: Globe },
  { id: 'currencies', label: 'Currencies', icon: Coins },
  { id: 'property-types', label: 'Property Types', icon: Building },
  { id: 'listing-tenure', label: 'Listing & Tenure', icon: Tag },
  { id: 'property-statuses', label: 'Statuses', icon: Activity },
  { id: 'property-features', label: 'Features', icon: Sparkles },
  { id: 'lead-pipeline', label: 'CRM Pipeline', icon: GitFork },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('advisory-contact');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'advisory-contact':
        return <AdvisoryContactManager />;
      case 'countries':
        return <CountryManager />;
      case 'currencies':
        return <CurrencyManager />;
      case 'property-types':
        return <PropertyTypeManager />;
      case 'listing-tenure':
        return <ListingAndTenureManager />;
      case 'property-statuses':
        return <PropertyStatusManager />;
      case 'property-features':
        return <PropertyFeatureManager />;
      case 'lead-pipeline':
        return <LeadPipelineManager />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
            <p className="text-sm text-gray-500">
              Manage master lookup data, countries, currencies, categories, and workflow stages.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 overflow-x-auto pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        {renderTabContent()}
      </div>
    </div>
  );
};
