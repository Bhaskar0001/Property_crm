import React, { useState } from 'react';
import { CountryManager } from './components/CountryManager';
import { CurrencyManager } from './components/CurrencyManager';
import { PropertyTypeManager } from './components/PropertyTypeManager';
import { ListingAndTenureManager } from './components/ListingAndTenureManager';
import { PropertyStatusManager } from './components/PropertyStatusManager';
import { PropertyFeatureManager } from './components/PropertyFeatureManager';
import { LeadPipelineManager } from './components/LeadPipelineManager';

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('countries');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'countries': return <CountryManager />;
            case 'currencies': return <CurrencyManager />;
            case 'property-types': return <PropertyTypeManager />;
            case 'listing-tenure': return <ListingAndTenureManager />;
            case 'property-statuses': return <PropertyStatusManager />;
            case 'property-features': return <PropertyFeatureManager />;
            case 'lead-pipeline': return <LeadPipelineManager />;
            default: return null;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Configuration Management</h1>
            <div className="flex border-b mb-6 space-x-4">
                {[
                    { id: 'countries', label: 'Countries' },
                    { id: 'currencies', label: 'Currencies' },
                    { id: 'property-types', label: 'Property Types' },
                    { id: 'listing-tenure', label: 'Listing & Tenure Types' },
                    { id: 'property-statuses', label: 'Property Statuses' },
                    { id: 'property-features', label: 'Property Features' },
                    { id: 'lead-pipeline', label: 'Lead Sources & Stages' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        className={`pb-2 px-1 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="bg-white p-4 rounded shadow">
                {renderTabContent()}
            </div>
        </div>
    );
};
