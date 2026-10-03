import React from 'react';
import { usePropertyTypes, useCreatePropertyType, useUpdatePropertyType, useDeletePropertyType } from '@/hooks/useAdminConfig';

export const PropertyTypeManager: React.FC = () => {
    const { data: propertyTypes, isLoading } = usePropertyTypes();
    const create = useCreatePropertyType();
    const update = useUpdatePropertyType();
    const remove = useDeletePropertyType();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Property Types</h2>
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                    onClick={() => {
                        const suffix = Math.floor(Math.random() * 900 + 100);
                        create.mutate({ name: `Type ${suffix}`, slug: `type-${suffix}`, description: '', isActive: true });
                    }}
                >
                    Add Type
                </button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Name</th>
                        <th>Slug</th>
                        <th>Description</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(propertyTypes || []).map((pt: any, idx: number) => {
                        const id = pt._id || pt.id || `pt-${idx}`;
                        return (
                            <tr key={id} className="border-b">
                                <td className="py-2">{pt.name}</td>
                                <td>{pt.slug}</td>
                                <td>{pt.description || '—'}</td>
                                <td>
                                    <input type="checkbox" checked={!!pt.isActive} onChange={() => update.mutate({ id, data: { isActive: !pt.isActive } })} />
                                </td>
                                <td>
                                    <button className="text-red-600 hover:underline" onClick={() => remove.mutate(id)}>Delete</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
