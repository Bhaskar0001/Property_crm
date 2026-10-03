import React from 'react';
import { useCurrencies, useCreateCurrency, useUpdateCurrency, useDeleteCurrency, useSetDefaultCurrency } from '@/hooks/useAdminConfig';

export const CurrencyManager: React.FC = () => {
    const { data: currencies, isLoading } = useCurrencies();
    const create = useCreateCurrency();
    const update = useUpdateCurrency();
    const remove = useDeleteCurrency();
    const setDefault = useSetDefaultCurrency();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Currency Manager</h2>
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                    onClick={() => {
                        const code = 'C' + Math.floor(Math.random() * 90 + 10);
                        create.mutate({ code, name: `Currency ${code}`, symbol: '$', isActive: true, isDefault: false });
                    }}
                >
                    Add Currency
                </button>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">Code</th>
                        <th>Symbol</th>
                        <th>Default</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(currencies || []).map((c: any, idx: number) => {
                        const id = c._id || c.id || `curr-${idx}`;
                        return (
                            <tr key={id} className="border-b">
                                <td className="py-2">{c.code}</td>
                                <td><span className="bg-gray-200 px-2 py-1 rounded text-sm">{c.symbol}</span></td>
                                <td>
                                    {c.isDefault ? <span className="text-green-600 font-bold">Yes</span> : <button className="text-blue-600 hover:underline" onClick={() => setDefault.mutate(id)}>Set Default</button>}
                                </td>
                                <td>
                                    <input type="checkbox" checked={!!c.isActive} onChange={() => update.mutate({ id, data: { isActive: !c.isActive } })} />
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
