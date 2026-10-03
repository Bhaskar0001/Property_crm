import React from 'react';
import { useCountries, useCreateCountry, useUpdateCountry, useDeleteCountry } from '@/hooks/useAdminConfig';

export const CountryManager: React.FC = () => {
    const { data: countries, isLoading } = useCountries();
    const create = useCreateCountry();
    const update = useUpdateCountry();
    const remove = useDeleteCountry();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Country Manager</h2>
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                    onClick={() => {
                        const code = 'C' + Math.floor(Math.random() * 90 + 10);
                        create.mutate({ name: `Country ${code}`, isoCode: code, isActive: true });
                    }}
                >
                    Add Country
                </button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Name</th>
                        <th>ISO Code</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(countries || []).map((c: any, idx: number) => {
                        const id = c._id || c.id || `c-${idx}`;
                        return (
                            <tr key={id} className="border-b">
                                <td className="py-2">{c.name}</td>
                                <td><span className="bg-gray-200 px-2 py-1 rounded text-sm">{c.isoCode}</span></td>
                                <td>
                                    <input type="checkbox" checked={!!c.isActive} onChange={() => update.mutate({ id: c._id || c.id, data: { isActive: !c.isActive } })} />
                                </td>
                                <td>
                                    <button className="text-red-600 hover:underline" onClick={() => remove.mutate(c._id || c.id)}>Delete</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
