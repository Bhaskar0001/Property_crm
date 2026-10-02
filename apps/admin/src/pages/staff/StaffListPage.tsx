import React from 'react';
import { useStaffList, useCreateStaff, useToggleStaffActive } from '../../hooks/useAdminConfig';
import { Link } from 'react-router-dom';

export const StaffListPage: React.FC = () => {
    const { data: staff, isLoading } = useStaffList();
    const createStaff = useCreateStaff();
    const toggleActive = useToggleStaffActive();

    if (isLoading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => createStaff.mutate({ name: 'New Staff', email: 'new@example.com', role: 'agent', isActive: true })}
                >
                    Create Staff
                </button>
            </div>
            
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email / Phone</th>
                            <th className="p-4">Team & Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Login</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(staff || []).map((s: any) => (
                            <tr key={s.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-blue-600">
                                    <Link to={`/staff/${s.id}`}>{s.name}</Link>
                                </td>
                                <td className="p-4">
                                    <div>{s.email}</div>
                                    <div className="text-sm text-gray-500">{s.phone}</div>
                                </td>
                                <td className="p-4">
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">{s.role}</span>
                                    {s.team && <span className="bg-gray-100 px-2 py-1 rounded text-xs">{s.team}</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs text-white ${s.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {s.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">{s.lastLogin || 'Never'}</td>
                                <td className="p-4">
                                    <button 
                                        className="text-sm text-gray-600 underline mr-4"
                                        onClick={() => toggleActive.mutate({ id: s.id, active: !s.isActive })}
                                    >
                                        Toggle Active
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
