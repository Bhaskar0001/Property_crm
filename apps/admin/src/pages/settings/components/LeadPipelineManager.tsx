import React from 'react';
import { useLeadSources, useCreateLeadSource, useDeleteLeadSource, useLeadStages, useCreateLeadStage, useDeleteLeadStage } from '@/hooks/useAdminConfig';

export const LeadPipelineManager: React.FC = () => {
    const { data: sources } = useLeadSources();
    const createSource = useCreateLeadSource();
    const deleteSource = useDeleteLeadSource();

    const { data: stages } = useLeadStages();
    const createStage = useCreateLeadStage();
    const deleteStage = useDeleteLeadStage();

    return (
        <div className="grid grid-cols-2 gap-8">
            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Lead Sources</h2>
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                        onClick={() => {
                            const suffix = Math.floor(Math.random() * 900 + 100);
                            createSource.mutate({ name: `Source ${suffix}`, slug: `source-${suffix}`, isActive: true });
                        }}
                    >
                        Add Source
                    </button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(sources || []).map((s: any, idx: number) => {
                            const id = s._id || s.id || `s-${idx}`;
                            return (
                                <tr key={id} className="border-b">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2 text-right">
                                        <button className="text-red-600 hover:underline" onClick={() => deleteSource.mutate(id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Lead Stages</h2>
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                        onClick={() => {
                            const suffix = Math.floor(Math.random() * 900 + 100);
                            createStage.mutate({ name: `Stage ${suffix}`, code: `STAGE_${suffix}`, color: '#10b981', isFinal: false, isActive: true });
                        }}
                    >
                        Add Stage
                    </button>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-4">
                    {(stages || []).map((st: any, idx: number) => {
                        const id = st._id || st.id || `st-${idx}`;
                        return (
                            <div key={id} className="min-w-[150px] border rounded p-4 text-center bg-gray-50 flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: st.color || '#333' }}></div>
                                <span className="font-semibold">{st.name}</span>
                                {st.isFinal && <span className="text-xs bg-green-200 text-green-800 px-2 rounded mt-1">Final</span>}
                                <button className="text-red-500 text-sm mt-3 hover:underline" onClick={() => deleteStage.mutate(id)}>Remove</button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
