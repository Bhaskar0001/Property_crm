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
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => createSource.mutate({ name: 'New Source', isActive: true })}>Add Source</button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(sources || []).map((s: any) => (
                            <tr key={s.id} className="border-b">
                                <td className="p-2">{s.name}</td>
                                <td className="p-2 text-right"><button className="text-red-600" onClick={() => deleteSource.mutate(s.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Lead Stages</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => createStage.mutate({ name: 'New Stage', color: '#ccc', isFinal: false })}>Add Stage</button>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-4">
                    {(stages || []).map((st: any) => (
                        <div key={st.id} className="min-w-[150px] border rounded p-4 text-center bg-gray-50 flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full mb-2" style={{ backgroundColor: st.color || '#333' }}></div>
                            <span className="font-semibold">{st.name}</span>
                            {st.isFinal && <span className="text-xs bg-green-200 text-green-800 px-2 rounded mt-1">Final</span>}
                            <button className="text-red-500 text-sm mt-3" onClick={() => deleteStage.mutate(st.id)}>Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
