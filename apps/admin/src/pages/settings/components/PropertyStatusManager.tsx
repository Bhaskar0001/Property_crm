import React from 'react';
import { usePropertyStatuses, useCreatePropertyStatus, useDeletePropertyStatus } from '@/hooks/useAdminConfig';

export const PropertyStatusManager: React.FC = () => {
    const { data: statuses, isLoading } = usePropertyStatuses();
    const create = useCreatePropertyStatus();
    const remove = useDeletePropertyStatus();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Property Statuses</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => create.mutate({ name: 'New Status', color: '#000000' })}>Add Status</button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Badge</th>
                        <th>Name</th>
                        <th>Color Code</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(statuses || []).map((s: any) => (
                        <tr key={s.id} className="border-b">
                            <td className="py-2">
                                <span className="px-3 py-1 rounded text-white" style={{ backgroundColor: s.color || '#333' }}>{s.name}</span>
                            </td>
                            <td>{s.name}</td>
                            <td>{s.color}</td>
                            <td>
                                <button className="text-red-600" onClick={() => remove.mutate(s.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
