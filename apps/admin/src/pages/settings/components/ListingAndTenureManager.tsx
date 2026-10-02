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
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => createLT.mutate({ name: 'New Listing Type' })}>Add</button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(listingTypes || []).map((lt: any) => (
                            <tr key={lt.id} className="border-b">
                                <td className="p-2">{lt.name}</td>
                                <td className="p-2 text-right"><button className="text-red-600" onClick={() => deleteLT.mutate(lt.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Tenure Types</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => createTT.mutate({ name: 'New Tenure Type' })}>Add</button>
                </div>
                <table className="w-full text-left border-collapse border">
                    <tbody>
                        {(tenureTypes || []).map((tt: any) => (
                            <tr key={tt.id} className="border-b">
                                <td className="p-2">{tt.name}</td>
                                <td className="p-2 text-right"><button className="text-red-600" onClick={() => deleteTT.mutate(tt.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
