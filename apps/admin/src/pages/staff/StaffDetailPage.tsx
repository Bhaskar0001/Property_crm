import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStaffMember, useUpdateStaffPermissions, useResetStaffPassword, useToggleStaffActive, useCountries, usePropertyTypes } from '../../hooks/useAdminConfig';

export const StaffDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: staff, isLoading } = useStaffMember(id || '');
    const updatePermissions = useUpdateStaffPermissions();
    const resetPassword = useResetStaffPassword();
    const toggleActive = useToggleStaffActive();
    const { data: countries } = useCountries();
    const { data: propertyTypes } = usePropertyTypes();

    const [perms, setPerms] = useState<any>({});

    React.useEffect(() => {
        if (staff?.permissions) {
            setPerms(staff.permissions);
        }
    }, [staff]);

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (!staff) return <div className="p-6">Staff not found</div>;

    const handlePermChange = (category: string, item: string, value: boolean) => {
        setPerms((prev: any) => ({
            ...prev,
            [category]: {
                ...(prev[category] || {}),
                [item]: value
            }
        }));
    };

    const handleSavePermissions = () => {
        if (id) updatePermissions.mutate({ id, permissions: perms });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link to="/staff" className="text-blue-600 mb-4 inline-block">&larr; Back to Staff List</Link>
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{staff.name}</h1>
                    <p className="text-gray-500">{staff.email} | {staff.role}</p>
                </div>
                <div className="space-x-2">
                    <button 
                        className={`px-4 py-2 rounded text-white ${staff.isActive ? 'bg-red-500' : 'bg-green-500'}`}
                        onClick={() => { if(id) toggleActive.mutate({ id, active: !staff.isActive }); }}
                    >
                        {staff.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                        onClick={() => { if(id) resetPassword.mutate({ id, data: {} }); alert('Password reset link sent'); }}
                    >
                        Reset Password
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">Granular Permissions</h2>
                
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Modules</h3>
                        {['properties', 'leads', 'whatsapp', 'viewings', 'offers', 'analytics'].map(mod => (
                            <label key={mod} className="flex items-center space-x-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={!!perms.modules?.[mod]}
                                    onChange={(e) => handlePermChange('modules', mod, e.target.checked)}
                                />
                                <span className="capitalize">{mod}</span>
                            </label>
                        ))}
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Country Access</h3>
                        {(countries || []).map((c: any) => (
                            <label key={c.id} className="flex items-center space-x-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={!!perms.countries?.[c.id]}
                                    onChange={(e) => handlePermChange('countries', c.id, e.target.checked)}
                                />
                                <span>{c.name}</span>
                            </label>
                        ))}
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Property Type Access</h3>
                        {(propertyTypes || []).map((pt: any) => (
                            <label key={pt.id} className="flex items-center space-x-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={!!perms.propertyTypes?.[pt.id]}
                                    onChange={(e) => handlePermChange('propertyTypes', pt.id, e.target.checked)}
                                />
                                <span>{pt.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded" onClick={handleSavePermissions}>
                        Save Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};
