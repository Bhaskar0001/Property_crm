import React from 'react';
import { usePropertyFeatures, useCreatePropertyFeature, useDeletePropertyFeature } from '@/hooks/useAdminConfig';

export const PropertyFeatureManager: React.FC = () => {
    const { data: features, isLoading } = usePropertyFeatures();
    const create = useCreatePropertyFeature();
    const remove = useDeletePropertyFeature();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Property Features</h2>
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                    onClick={() => {
                        const suffix = Math.floor(Math.random() * 900 + 100);
                        create.mutate({ name: `Feature ${suffix}`, slug: `feature-${suffix}`, icon: 'star', isActive: true });
                    }}
                >
                    Add Feature
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {(features || []).map((f: any, idx: number) => {
                    const id = f._id || f.id || `f-${idx}`;
                    return (
                        <span key={id} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full flex items-center space-x-2">
                            <span>{f.name}</span>
                            <button className="text-red-500 font-bold ml-2 hover:text-red-700" onClick={() => remove.mutate(id)}>&times;</button>
                        </span>
                    );
                })}
            </div>

            <table className="w-full text-left border-collapse border">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-2">Feature Name</th>
                        <th className="p-2">Icon</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(features || []).map((f: any, idx: number) => {
                        const id = f._id || f.id || `f-${idx}`;
                        return (
                            <tr key={`row-${id}`} className="border-b">
                                <td className="p-2">{f.name}</td>
                                <td className="p-2">{f.icon || '—'}</td>
                                <td className="p-2 text-red-600 cursor-pointer hover:underline" onClick={() => remove.mutate(id)}>Delete</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
