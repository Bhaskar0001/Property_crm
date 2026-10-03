import React from 'react';
import { useListingTypes, useCreateListingType, useDeleteListingType, useTenureTypes, useCreateTenureType, useDeleteTenureType } from '@/hooks/useAdminConfig';

export const ListingAndTenureManager: React.FC = () => {
    const { data: listingTypes } = useListingTypes();
    const createLT = useCreateListingType();
    const deleteLT = useDeleteListingType();

    const { data: tenureTypes } = useTenureTypes();
    const createTT = useCreateTenureType();
    const deleteTT = useDeleteTenureType();

    return (
        <div className="grid grid-cols-2 gap-8">
            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Listing Types</h2>
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                        onClick={() => {
                            const suffix = Math.floor(Math.random() * 900 + 100);
                            createLT.mutate({ name: `Listing Type ${suffix}`, slug: `listing-type-${suffix}`, isActive: true });
                        }}
                    >
                        Add
                    </button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(listingTypes || []).map((lt: any, idx: number) => {
                            const id = lt._id || lt.id || `lt-${idx}`;
                            return (
                                <tr key={id} className="border-b">
                                    <td className="p-2">{lt.name}</td>
                                    <td className="p-2 text-right">
                                        <button className="text-red-600 hover:underline" onClick={() => deleteLT.mutate(id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Tenure Types</h2>
                    <button 
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                        onClick={() => {
                            const suffix = Math.floor(Math.random() * 900 + 100);
                            createTT.mutate({ name: `Tenure Type ${suffix}`, slug: `tenure-type-${suffix}`, isActive: true });
                        }}
                    >
                        Add
                    </button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(tenureTypes || []).map((tt: any, idx: number) => {
                            const id = tt._id || tt.id || `tt-${idx}`;
                            return (
                                <tr key={id} className="border-b">
                                    <td className="p-2">{tt.name}</td>
                                    <td className="p-2 text-right">
                                        <button className="text-red-600 hover:underline" onClick={() => deleteTT.mutate(id)}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
